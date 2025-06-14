const Room = require('../models/Room');

// Create a new room
exports.createRoom = async (req, res) => {
    try {
        const { theaterId, name, totalSeats } = req.body;
        const room = new Room({ theaterId, name, totalSeats });
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all rooms
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('theaterId');
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single room by ID
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('theaterId');
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a room
exports.updateRoom = async (req, res) => {
    try {
        const { theaterId, name, totalSeats } = req.body;
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { theaterId, name, totalSeats },
            { new: true, runValidators: true }
        );
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};