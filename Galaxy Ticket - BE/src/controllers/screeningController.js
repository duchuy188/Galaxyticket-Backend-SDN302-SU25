const Screening = require('../models/Screening');
const ApprovalRequest = require('../models/ApprovalRequest');
require('../models/User');
require('../models/Movie');
require('../models/Room');

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
        const { movieId, roomId, startTime, endTime, ticketPrice, createdBy } = req.body;
        
        // Kiểm tra trùng giờ
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