const Booking = require('../models/Booking');
const Screening = require('../models/Screening');
const Seat = require('../models/Seat');
const Promotion = require('../models/Promotion');
const mongoose = require('mongoose');

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { userId, screeningId, seatNumbers, code } = req.body;

        // Validate required fields
        if (!userId || !screeningId || !seatNumbers) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate if screening exists
        const screening = await Screening.findById(screeningId);
        if (!screening) {
            return res.status(404).json({ message: 'Screening not found' });
        }

        // Validate if seats are available
        const seats = await Seat.find({
            screeningId,
            seatNumber: { $in: seatNumbers }
        });

        if (seats.length !== seatNumbers.length) {
            return res.status(400).json({ message: 'One or more seats not found' });
        }

        // Check if seats are already booked
        const existingBookings = await Booking.find({
            screeningId,
            seatNumbers: { $in: seatNumbers },
            paymentStatus: { $in: ['pending', 'paid'] }
        });

        if (existingBookings.length > 0) {
            return res.status(400).json({ message: 'One or more seats are already booked' });
        }

        // Calculate total price based on screening's ticketPrice and number of seats
        let totalPrice = screening.ticketPrice * seatNumbers.length;

        const bookingData = {
            userId,
            screeningId,
            seatNumbers,
            totalPrice,
            paymentStatus: 'pending'
        }

        // Handle promotion code
        if (code !== undefined && code !== null && code.trim() !== '') {
            const promotionCode = code.trim().toUpperCase();
            const promotion = await Promotion.findOne({
                code: promotionCode,
                isActive: true,
                status: 'approved',
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            if (!promotion) {
                return res.status(400).json({ message: 'Mã khuyến mãi không hợp lệ' });
            }

            bookingData.code = promotionCode;
            // Apply discount based on promotion type
            if (promotion.type === 'percent') {
                totalPrice = totalPrice * (1 - promotion.value / 100);
            } else if (promotion.type === 'fixed') {
                totalPrice = Math.max(0, totalPrice - promotion.value);
            }
            bookingData.totalPrice = totalPrice;
        }

        const booking = new Booking(bookingData);
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
            return res.status(404).json({ message: 'Không tìm thấy đặt vé' });
        }

        // Only allow cancellation of pending bookings
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Chỉ có thể hủy đặt vé đang chờ thanh toán' });
        }

        booking.paymentStatus = 'cancelled';
        await booking.save();
        res.json({ message: 'Hủy đặt vé thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a booking
exports.updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { seatNumbers, code } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only allow updates to pending bookings
        if (booking.paymentStatus !== 'pending') {
            return res.status(400).json({ message: 'Can only update pending bookings' });
        }

        // If updating seats, validate availability and recalculate totalPrice
        if (seatNumbers) {
            const seats = await Seat.find({
                screeningId: booking.screeningId,
                seatNumber: { $in: seatNumbers }
            });

            if (seats.length !== seatNumbers.length) {
                return res.status(400).json({ message: 'One or more seats not found' });
            }

            const existingBookings = await Booking.find({
                screeningId: booking.screeningId,
                seatNumbers: { $in: seatNumbers },
                _id: { $ne: bookingId },
                paymentStatus: { $in: ['pending', 'paid'] }
            });

            if (existingBookings.length > 0) {
                return res.status(400).json({ message: 'One or more seats are already booked' });
            }

            booking.seatNumbers = seatNumbers;

            // Recalculate totalPrice if seatNumbers are updated
            const screening = await Screening.findById(booking.screeningId);
            if (screening) {
                let newTotalPrice = screening.ticketPrice * seatNumbers.length;

                // Reapply promotion if exists
                if (booking.code) {
                    const promotion = await Promotion.findOne({
                        code: booking.code,
                        isActive: true,
                        status: 'approved',
                        startDate: { $lte: new Date() },
                        endDate: { $gte: new Date() }
                    });

                    if (promotion) {
                        if (promotion.type === 'percent') {
                            newTotalPrice = newTotalPrice * (1 - promotion.value / 100);
                        } else if (promotion.type === 'fixed') {
                            newTotalPrice = Math.max(0, newTotalPrice - promotion.value);
                        }
                    }
                }

                booking.totalPrice = newTotalPrice;
            } else {
                return res.status(500).json({ message: 'Screening not found for booking' });
            }
        }

        if (code !== undefined) {
            const newCode = code ? code.trim().toUpperCase() : null;
            if (newCode !== booking.code) {
                booking.code = newCode;

                // Recalculate price with new promotion code
                const screening = await Screening.findById(booking.screeningId);
                if (screening) {
                    let newTotalPrice = screening.ticketPrice * booking.seatNumbers.length;

                    if (newCode) {
                        const promotion = await Promotion.findOne({
                            code: newCode,
                            isActive: true,
                            status: 'approved',
                            startDate: { $lte: new Date() },
                            endDate: { $gte: new Date() }
                        });

                        if (promotion) {
                            if (promotion.type === 'percent') {
                                newTotalPrice = newTotalPrice * (1 - promotion.value / 100);
                            } else if (promotion.type === 'fixed') {
                                newTotalPrice = Math.max(0, newTotalPrice - promotion.value);
                            }
                        } else {
                            return res.status(400).json({ message: 'Mã khuyến mãi không hợp lệ' });
                        }
                    }

                    booking.totalPrice = newTotalPrice;
                }
            }
        }

        await booking.save();
        res.json(booking);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: error.message });
    }
};
