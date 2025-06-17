const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/auth.middleware');

// Get user's bookings
router.get('/my-bookings', authenticate, bookingController.getUserBookings);

// Get all bookings with filters
router.get('/', bookingController.getBookings);

// Create a new booking
router.post('/', bookingController.createBooking);

// Cancel a booking
router.post('/:bookingId/cancel', bookingController.cancelBooking);

// Update a booking
router.put('/:bookingId', bookingController.updateBooking);

// Update booking status after payment
router.post('/:bookingId/status', bookingController.updateBookingStatus);

// Route để gửi email vé
router.post('/:bookingId/send-ticket', authenticate, bookingController.sendTicketEmail);

module.exports = router; 