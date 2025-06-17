const Screening = require('../models/Screening');
const ApprovalRequest = require('../models/ApprovalRequest');
require('../models/User');
require('../models/Movie');
require('../models/Room');
require('../models/Theater');

// Lấy tất cả suất chiếu
exports.getAllScreenings = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { isActive: true }; // Thêm isActive filter như movie
        
        if (status) query.status = status;

        const screenings = await Screening.find(query)
            .populate('movieId roomId createdBy approvedBy')
            .sort({ createdAt: -1 }); // Thêm sort như movie

        res.status(200).json({
            success: true,
            message: 'Get all screenings successfully',
            data: screenings,
            count: screenings.length
        });
        const screenings = await Screening.find().populate('movieId roomId theaterId createdBy approvedBy');
        res.json(screenings);
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
        const screening = await Screening.findById(req.params.id).populate('movieId roomId theaterId createdBy approvedBy');
        if (!screening) return res.status(404).json({ message: 'Screening not found' });
        res.json(screening);
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
        const { movieId, roomId, startTime, endTime, ticketPrice, createdBy } = req.body;
        
        // Kiểm tra trùng giờ
        const { movieId, roomId, theaterId, startTime, endTime, ticketPrice, createdBy } = req.body;
        if (await isTimeOverlap(roomId, startTime, endTime)) {
            return res.status(400).json({ 
                success: false,
                message: 'Thời gian chiếu bị trùng với suất chiếu khác trong phòng này.' 
            });
        }

        // Tạo screening với status pending
        const screening = await Screening.create({
            movieId, 
            roomId, 
            startTime, 
            endTime, 
            ticketPrice, 
            createdBy,
            status: 'pending'
        });

        // Tạo approval request
        await ApprovalRequest.create({
            staffId: createdBy,
            type: 'screening',
            requestData: screening.toObject(),
            referenceId: screening._id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Screening created and pending approval',
            data: screening
        const screening = new Screening({
            movieId, roomId, theaterId, startTime, endTime, ticketPrice, createdBy
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
        const { movieId, roomId, startTime, endTime, ticketPrice } = req.body;
        const { movieId, roomId, theaterId, startTime, endTime, ticketPrice, status, rejectionReason, approvedBy, isActive } = req.body;
        const screening = await Screening.findById(req.params.id);
        
        if (!screening) {
            return res.status(404).json({
                success: false,
                message: 'Screening not found'
            });
        }

        const updateData = { ...req.body };

        // Kiểm tra trùng giờ nếu có thay đổi thời gian hoặc phòng
        if ((roomId && roomId !== screening.roomId.toString()) ||
            (startTime && startTime !== screening.startTime.toISOString()) ||
            (endTime && endTime !== screening.endTime.toISOString())) {
            if (await isTimeOverlap(roomId || screening.roomId, startTime || screening.startTime, endTime || screening.endTime, screening._id)) {
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
        // Cập nhật các trường
        if (movieId) screening.movieId = movieId;
        if (roomId) screening.roomId = roomId;
        if (theaterId) screening.theaterId = theaterId;
        if (startTime) screening.startTime = startTime;
        if (endTime) screening.endTime = endTime;
        if (ticketPrice !== undefined) screening.ticketPrice = ticketPrice;
        if (status) screening.status = status;
        if (rejectionReason !== undefined) screening.rejectionReason = rejectionReason;
        if (approvedBy) screening.approvedBy = approvedBy;
        if (isActive !== undefined) screening.isActive = isActive;

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
        const screenings = await Screening.find({
            theaterId: req.params.theaterId,
            isActive: true
        }).populate('movieId roomId theaterId createdBy approvedBy');

        if (!screenings.length) {
            return res.status(404).json({ message: 'Không tìm thấy suất chiếu nào cho rạp này' });
        }

        res.json(screenings);
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
        }).populate('movieId roomId theaterId createdBy approvedBy');

        if (!screenings.length) {
            return res.status(404).json({ message: 'Không tìm thấy suất chiếu nào cho phim này' });
        }

        res.json(screenings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};