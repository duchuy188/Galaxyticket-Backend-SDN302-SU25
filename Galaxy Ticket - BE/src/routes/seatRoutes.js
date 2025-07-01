const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');

// Get all seats for a screening
router.get('/screening/:screeningId', seatController.getScreeningSeats);

module.exports = router;