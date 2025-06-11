const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/', bookingController.createBooking);

// Cancel a booking
router.put('/:bookingId/cancel', bookingController.cancelBooking);

// Update a booking
router.put('/:bookingId', bookingController.updateBooking);

module.exports = router; 