const express = require('express');
const router = express.Router();
const { createPaymentUrl, vnpayReturn } = require('../controllers/vnpayController');
const { authenticate } = require('../middlewares/auth.middleware');

// Create payment URL
router.post('/create_payment_url', authenticate, createPaymentUrl);

// VNPay return URL
router.get('/vnpay_return', vnpayReturn);

module.exports = router;