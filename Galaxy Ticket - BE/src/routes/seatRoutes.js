const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Create seats (single or multiple)
router.post('/create-bulk', seatController.createBulkSeats);

// Reserve a seat
router.post('/reserve', seatController.reserveSeat);

// Check seat status
router.get('/status', seatController.checkSeatStatus);

// Release expired seats
router.post('/release-expired', seatController.releaseExpiredSeats);

// Get all seats for a screening
router.get('/screening/:screeningId', seatController.getScreeningSeats);

module.exports = router; 