const express = require('express');
const router = express.Router();
const approvalRequestController = require('../controllers/approvalRequestController');

router.get('/', approvalRequestController.getAllRequests);


router.get('/:id', approvalRequestController.getRequestById);

router.put('/:id', approvalRequestController.updateRequest);

module.exports = router;