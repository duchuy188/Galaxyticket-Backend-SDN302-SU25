const Seat = require('../models/Seat');
const mongoose = require('mongoose');

// Get all seats for a screening
exports.getScreeningSeats = async(req, res) => {
    try {
        const { screeningId } = req.params;

        // Validate screeningId format
        if (!mongoose.Types.ObjectId.isValid(screeningId)) {
            return res.status(400).json({ message: 'Invalid screening ID format' });
        }

        const seats = await Seat.find({ screeningId });

        res.status(200).json({
            message: 'Seats retrieved successfully',
            seats
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving seats',
            error: error.message
        });
    }
};