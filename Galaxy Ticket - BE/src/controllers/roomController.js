const Room = require('../models/Room');
const Seat = require('../models/Seat');

// Create a new room
exports.createRoom = async(req, res) => {
    try {
        const { theaterId, name, totalSeats } = req.body;
        const normalizedName = name.replace(/\s+/g, '').toLowerCase();
        // Lấy tất cả phòng cùng rạp
        const rooms = await Room.find({ theaterId });
        // Kiểm tra trùng tên
        const roomNamePairs = rooms.map(room => ({
            original: room.name,
            normalized: room.name.replace(/\s+/g, '').toLowerCase()
        }));
        const isDuplicate = roomNamePairs.some(pair => pair.normalized === normalizedName);
        if (isDuplicate) {
            return res.status(400).json({ 
                message: 'Room name already exists in this theater',
                roomNamePairs,
                yourNormalizedName: normalizedName
            });
        }
        const room = new Room({ theaterId, name, totalSeats });
        await room.save();

        // ĐÃ XOÁ: Không tạo ghế tự động cho phòng nữa

        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all rooms
exports.getRooms = async(req, res) => {
    try {
        const rooms = await Room.find().populate('theaterId');
        res.status(200).json({
            success: true,
            message: 'Get all rooms successfully',
            data: rooms
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single room by ID
exports.getRoomById = async(req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('theaterId');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a room
exports.updateRoom = async(req, res) => {
    try {
        const { theaterId, name, totalSeats } = req.body;
        const normalizedName = name.replace(/\s+/g, '').toLowerCase();
        // Lấy tất cả phòng cùng rạp, loại trừ phòng hiện tại
        const rooms = await Room.find({ theaterId, _id: { $ne: req.params.id } });
        const isDuplicate = rooms.some(room => room.name.replace(/\s+/g, '').toLowerCase() === normalizedName);
        if (isDuplicate) {
            return res.status(400).json({ message: 'Room name already exists in this theater' });
        }
        const room = await Room.findByIdAndUpdate(
            req.params.id, { theaterId, name, totalSeats }, { new: true, runValidators: true }
        );
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a room
exports.deleteRoom = async(req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};