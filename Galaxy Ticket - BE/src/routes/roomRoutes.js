const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const Room = require('../models/Room');
require('../models/Theater');

// CRUD routes
router.post('/', roomController.createRoom);
router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;