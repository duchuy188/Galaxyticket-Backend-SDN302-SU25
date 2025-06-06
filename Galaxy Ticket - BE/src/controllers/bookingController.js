const Booking = require('../models/Booking');
const Screening = require('../models/Screening');
const Seat = require('../models/Seat');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userId, screeningId, seatIds, totalPrice } = req.body;

        // Validate if screening exists
        const screening = await Screening.findById(screeningId);
        if (!screening) {
            return res.status(404).json({ message: 'Screening not found' });
        }

        // Validate if seats are available
        const seats = await Seat.find({ _id: { $in: seatIds } });
        if (seats.length !== seatIds.length) {
            return res.status(400).json({ message: 'One or more seats not found' });
        }

        // Check if seats are already booked
        const existingBookings = await Booking.find({
            screeningId,
            seatIds: { $in: seatIds },
            paymentStatus: { $in: ['pending', 'paid'] }
        });

        if (existingBookings.length > 0) {
            return res.status(400).json({ message: 'One or more seats are already booked' });
        }

        const booking = new Booking({
            userId,
            screeningId,
            seatIds,
            totalPrice,
            paymentStatus: 'pending'
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow cancellation of pending bookings
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Can only cancel pending bookings' });
        }

        booking.paymentStatus = 'failed';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { seatIds, totalPrice } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow updates to pending bookings
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Can only update pending bookings' });
        }

        // If updating seats, validate availability
        if (seatIds) {
            const seats = await Seat.find({ _id: { $in: seatIds } });
            if (seats.length !== seatIds.length) {
                return res.status(400).json({ message: 'One or more seats not found' });
            }

            const existingBookings = await Booking.find({
                screeningId: booking.screeningId,
                seatIds: { $in: seatIds },
                _id: { $ne: bookingId },
                paymentStatus: { $in: ['pending', 'paid'] }
            });

            if (existingBookings.length > 0) {
                return res.status(400).json({ message: 'One or more seats are already booked' });
            }

            booking.seatIds = seatIds;
        }

        if (totalPrice !== undefined) {
            booking.totalPrice = totalPrice;
        }

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 