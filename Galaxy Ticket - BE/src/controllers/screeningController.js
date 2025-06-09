const Screening = require('../models/Screening');
require('../models/User');
require('../models/Movie');
require('../models/Room');

// Lấy tất cả suất chiếu
exports.getAllScreenings = async (req, res) => {
    try {
        const screenings = await Screening.find().populate('movieId roomId createdBy approvedBy');
        res.json(screenings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy chi tiết 1 suất chiếu
exports.getScreeningById = async (req, res) => {
    try {
        const screening = await Screening.findById(req.params.id).populate('movieId roomId createdBy approvedBy');
        if (!screening) return res.status(404).json({ message: 'Screening not found' });
        res.json(screening);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        if (await isTimeOverlap(roomId, startTime, endTime)) {
            return res.status(400).json({ message: 'Thời gian chiếu bị trùng với suất chiếu khác trong phòng này.' });
        }
        const screening = new Screening({
            movieId, roomId, startTime, endTime, ticketPrice, createdBy
        });
        await screening.save();
        res.status(201).json(screening);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Cập nhật suất chiếu
exports.updateScreening = async (req, res) => {
    try {
        const { movieId, roomId, startTime, endTime, ticketPrice, status, rejectionReason, approvedBy, isActive } = req.body;
        const screening = await Screening.findById(req.params.id);
        if (!screening) return res.status(404).json({ message: 'Screening not found' });

        // Kiểm tra trùng giờ nếu có thay đổi thời gian hoặc phòng
        if ((roomId && roomId !== screening.roomId.toString()) ||
            (startTime && startTime !== screening.startTime.toISOString()) ||
            (endTime && endTime !== screening.endTime.toISOString())) {
            if (await isTimeOverlap(roomId || screening.roomId, startTime || screening.startTime, endTime || screening.endTime, screening._id)) {
                return res.status(400).json({ message: 'Thời gian chiếu bị trùng với suất chiếu khác trong phòng này.' });
            }
        }

        // Cập nhật các trường
        if (movieId) screening.movieId = movieId;
        if (roomId) screening.roomId = roomId;
        if (startTime) screening.startTime = startTime;
        if (endTime) screening.endTime = endTime;
        if (ticketPrice !== undefined) screening.ticketPrice = ticketPrice;
        if (status) screening.status = status;
        if (rejectionReason !== undefined) screening.rejectionReason = rejectionReason;
        if (approvedBy) screening.approvedBy = approvedBy;
        if (isActive !== undefined) screening.isActive = isActive;

        await screening.save();
        res.json(screening);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Xóa (deactivate) suất chiếu
exports.deleteScreening = async (req, res) => {
    try {
        const screening = await Screening.findById(req.params.id);
        if (!screening) return res.status(404).json({ message: 'Screening not found' });
        screening.isActive = false;
        await screening.save();
        res.json({ message: 'Screening deactivated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};