const Seat = require('../models/Seat');
const mongoose = require('mongoose');

// Create seats (single or multiple)
exports.createBulkSeats = async (req, res) => {
    try {
        const { screeningId, seats } = req.body;

        // Validate screeningId format
        if (!mongoose.Types.ObjectId.isValid(screeningId)) {
            return res.status(400).json({ message: 'Invalid screening ID format' });
        }

        // Validate seats array
        if (!Array.isArray(seats)) {
            return res.status(400).json({ message: 'Seats must be an array' });
        }

        // Remove any duplicate seat numbers
        const uniqueSeats = [...new Set(seats)];

        // Prepare seats data
        const seatsData = uniqueSeats.map(seatNumber => ({
            screeningId,
            seatNumber,
            status: 'available'
        }));

        // Insert all seats
        const createdSeats = await Seat.insertMany(seatsData, {
            ordered: false // Continue inserting even if some documents fail
        });

        res.status(201).json({
            message: createdSeats.length === 1 ? 'Seat created successfully' : 'Seats created successfully',
            seats: createdSeats
        });
    } catch (error) {
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Some seats already exist for this screening',
                error: error.message
            });
        }

        res.status(500).json({
            message: 'Error creating seats',
            error: error.message
        });
    }
};

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