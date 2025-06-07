const Seat = require('../models/Seat');
const mongoose = require('mongoose');

// Reserve a seat
exports.reserveSeat = async (req, res) => {
    try {
        const { screeningId, seatNumber } = req.body;

        // Validate screeningId format
        if (!mongoose.Types.ObjectId.isValid(screeningId)) {
            return res.status(400).json({ message: 'Invalid screening ID format' });
        }

        // Find and update the seat
        const seat = await Seat.findOneAndUpdate(
            {
                screeningId,
                seatNumber,
                status: 'available'
            },
            {
                status: 'reserved',
                reservedAt: new Date()
            },
            { new: true }
        );

        if (!seat) {
            return res.status(404).json({
                message: 'Seat not found or already reserved/booked'
            });
        }

        res.status(200).json({
            message: 'Seat reserved successfully',
            seat
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error reserving seat',
            error: error.message
        });
    }
};

// Check seat status
exports.checkSeatStatus = async (req, res) => {
    try {
        const { screeningId, seatNumber } = req.query;

        // Validate screeningId format
        if (!mongoose.Types.ObjectId.isValid(screeningId)) {
            return res.status(400).json({ message: 'Invalid screening ID format' });
        }

        const seat = await Seat.findOne({ screeningId, seatNumber });

        if (!seat) {
            return res.status(404).json({ message: 'Seat not found' });
        }

        res.status(200).json({
            message: 'Seat status retrieved successfully',
            status: seat.status
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error checking seat status',
            error: error.message
        });
    }
};

// Release expired seats
exports.releaseExpiredSeats = async (req, res) => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        // Find all reserved seats that were reserved more than 5 minutes ago
        const result = await Seat.updateMany(
            {
                status: 'reserved',
                reservedAt: { $lt: fiveMinutesAgo }
            },
            {
                status: 'available',
                reservedAt: null
            }
        );

        res.status(200).json({
            message: 'Expired seats released successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error releasing expired seats',
            error: error.message
        });
    }
};

// Get all seats for a screening
exports.getScreeningSeats = async (req, res) => {
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