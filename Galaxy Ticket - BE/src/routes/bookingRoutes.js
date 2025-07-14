const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, adminMiddleware, requireRole, verifyToken } = require('../middlewares/auth.middleware');

// Get user's bookings
router.get('/user', authenticate, bookingController.getUserBookings);
// Route cho admin lấy tất cả booking và lọc trạng thái
router.get('/admin', verifyToken, requireRole('admin'), bookingController.adminGetBookings);
// Get all bookings with filters
router.get('/', bookingController.getBookings);

// Create a new booking
router.post('/', authenticate, bookingController.createBooking);

// Cancel a booking
router.post('/:bookingId/cancel', bookingController.cancelBooking);

// Update a booking
router.put('/:bookingId', bookingController.updateBooking);

// Update booking status after payment
router.post('/:bookingId/status', bookingController.updateBookingStatus);

// Route để gửi email vé
router.post('/:bookingId/send-ticket', authenticate, bookingController.sendTicketEmail);

module.exports = router;