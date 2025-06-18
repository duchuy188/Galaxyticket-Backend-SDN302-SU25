const Screening = require('../models/Screening');
const ApprovalRequest = require('../models/ApprovalRequest');
const Movie = require('../models/Movie');
require('../models/User');
require('../models/Room');
require('../models/Theater');

// Lấy tất cả suất chiếu
exports.getAllScreenings = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { isActive: true };

        const validStatuses = ['pending', 'approved', 'rejected'];
        if (status && validStatuses.includes(status)) {
            query.status = status;
        }

        const screenings = await Screening.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Get all screenings successfully',
            data: screenings,
            count: screenings.length
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Lấy chi tiết 1 suất chiếu
exports.getScreeningById = async (req, res) => {
    try {
        const screening = await Screening.findOne({
            _id: req.params.id,
            isActive: true
        }).populate('movieId roomId createdBy approvedBy');
        
        if (!screening) {
            return res.status(404).json({
                success: false,
                message: 'Screening not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Get screening successfully',
            data: screening
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Kiểm tra trùng giờ chiếu trong cùng 1 phòng
async function isTimeOverlap(roomId, startTime, endTime, excludeId = null) {
    const query = {
        roomId,
        isActive: true,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    };
    if (excludeId) query._id = { $ne: excludeId };
    const overlap = await Screening.findOne(query);
    return !!overlap;
}

// Tạo suất chiếu mới
exports.createScreening = async (req, res) => {
    try {
        let { movieId, roomId, theaterId, startTime, endTime } = req.body;
        let ticketPrice = 90000;
        
        if (startTime && typeof startTime === 'string') {
            startTime = new Date(startTime);
        }
        if (endTime && typeof endTime === 'string') {
            endTime = new Date(endTime);
        }

        if (!endTime && startTime) {
            const movie = await Movie.findById(movieId);
            let duration = 90; // mặc định 90 phút nếu không có
            if (movie && movie.duration) {
                duration = movie.duration;
            }
            const start = new Date(startTime);
            endTime = new Date(start.getTime() + (duration + 10) * 60000); // duration + 10 phút
        }

        // Kiểm tra trùng giờ
        if (await isTimeOverlap(roomId, startTime, endTime)) {
            return res.status(400).json({ 
                success: false,
                message: 'Thời gian chiếu bị trùng với suất chiếu khác trong phòng này.' 
            });
        }

        // Tạo screening với status pending (không có createdBy)
        const screening = await Screening.create({
            movieId, 
            roomId, 
            theaterId,
            startTime, 
            endTime,
            ticketPrice, 
            status: 'pending'
        });

        // Tạo approval request (không có staffId)
        await ApprovalRequest.create({
            type: 'screening',
            requestData: screening.toObject(),
            referenceId: screening._id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Screening created and pending approval',
            data: screening
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors).map(err => err.message).join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Cập nhật suất chiếu
exports.updateScreening = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const screening = await Screening.findById(req.params.id);
        
        if (!screening) {
            return res.status(404).json({
                success: false,
                message: 'Screening not found'
            });
        }

        if (updateData.startTime && typeof updateData.startTime === 'string') {
            updateData.startTime = new Date(updateData.startTime);
        }
        if (updateData.endTime && typeof updateData.endTime === 'string') {
            updateData.endTime = new Date(updateData.endTime);
        }

        // Nếu không truyền endTime nhưng có startTime hoặc movieId, tự động tính lại endTime
        if ((!updateData.endTime) && (updateData.startTime || updateData.movieId)) {
            const movieId = updateData.movieId || screening.movieId;
            const movie = await require('../models/Movie').findById(movieId);
            let duration = 90;
            if (movie && movie.duration) duration = movie.duration;
            const start = new Date(updateData.startTime || screening.startTime);
            updateData.endTime = new Date(start.getTime() + (duration + 10) * 60000);
        }

        // Kiểm tra trùng giờ nếu có thay đổi thời gian hoặc phòng
        if ((updateData.roomId && updateData.roomId !== screening.roomId.toString()) ||
            (updateData.startTime && updateData.startTime !== screening.startTime.toISOString()) ||
            (updateData.endTime && updateData.endTime !== screening.endTime.toISOString())) {
            if (await isTimeOverlap(updateData.roomId || screening.roomId, updateData.startTime || screening.startTime, updateData.endTime || screening.endTime, screening._id)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Thời gian chiếu bị trùng với suất chiếu khác trong phòng này.' 
                });
            }
        }

        // Nếu screening đã được approve, tạo approval request mới
        if (screening.status === 'approved') {
            updateData.status = 'pending';
            updateData.approvedBy = null;
            updateData.rejectionReason = null;

            // Tạo approval request mới
            await ApprovalRequest.create({
                staffId: screening.createdBy,
                type: 'screening',
                requestData: { ...screening.toObject(), ...updateData },
                referenceId: screening._id,
                status: 'pending'
            });
        } else if (screening.status === 'rejected') {
            updateData.status = 'pending';
            updateData.rejectionReason = null;

            // Tạo approval request mới
            await ApprovalRequest.create({
                staffId: screening.createdBy,
                type: 'screening',
                requestData: { ...screening.toObject(), ...updateData },
                referenceId: screening._id,
                status: 'pending'
            });
        }

        const updatedScreening = await Screening.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: screening.status === 'pending' ? 
                'Screening updated successfully' : 
                'Screening update submitted for approval',
            data: updatedScreening
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors).map(err => err.message).join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Xóa (deactivate) suất chiếu
exports.deleteScreening = async (req, res) => {
    try {
        const screening = await Screening.findById(req.params.id);
        if (!screening) {
            return res.status(404).json({
                success: false,
                message: 'Screening not found'
            });
        }
        
        screening.isActive = false;
        await screening.save();
        
        res.status(200).json({
            success: true,
            message: 'Screening deactivated successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Lấy screenings theo status
exports.getScreeningsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status. Status must be one of: pending, approved, rejected' 
            });
        }
        
        const screenings = await Screening.find({ 
            status,
            isActive: true 
        })
        .populate('movieId roomId createdBy approvedBy')
        .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            message: 'Get screenings by status successfully',
            data: screenings,
            count: screenings.length,
            status: status
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Lấy tất cả suất chiếu theo rạp
exports.getScreeningsByTheater = async (req, res) => {
    try {
        const roomsInTheater = await require('../models/Room').find({ theaterId: req.params.theaterId });
        const roomIds = roomsInTheater.map(room => room._id);

        const screenings = await Screening.find({
            roomId: { $in: roomIds },
            isActive: true
        }).populate('movieId roomId createdBy approvedBy');

        res.status(200).json({
            success: true,
            message: screenings.length ? 'Lấy danh sách suất chiếu thành công' : 'Không có suất chiếu nào cho rạp này',
            data: screenings,
            count: screenings.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy tất cả suất chiếu theo phim
exports.getScreeningsByMovie = async (req, res) => {
    try {
        const screenings = await Screening.find({
            movieId: req.params.movieId,
            isActive: true
        }).populate('movieId roomId createdBy approvedBy'); // Loại bỏ theaterId khỏi populate vì Screening không có nó trực tiếp

        if (!screenings.length) {
            return res.status(404).json({ message: 'Không tìm thấy suất chiếu nào cho phim này' });
        }

        res.json(screenings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};