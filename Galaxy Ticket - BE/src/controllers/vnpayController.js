const moment = require('moment');
const crypto = require('crypto');
const querystring = require('querystring');
const vnpayConfig = require('../config/vnpay/vnpay.config');
const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const Seat = require('../models/Seat');

// Debug log for environment variables
console.log('VNPay Environment Variables:', {
    TMN_CODE: process.env.VNP_TMN_CODE,
    HASH_SECRET: process.env.VNP_HASH_SECRET,
    URL: process.env.VNP_URL,
    RETURN_URL: process.env.VNP_RETURN_URL
});

// Debug log for vnpayConfig
console.log('VNPay Config:', vnpayConfig);

// Helper function to sort object by key
function sortObject(obj) {
    let sorted = {};
    const str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

const createPaymentUrl = async(req, res) => {
    try {
        const { amount, bookingId, userId } = req.body;

        if (!amount || !bookingId || !userId) {
            return res.status(400).json({
                code: '97',
                message: 'Missing required fields'
            });
        }

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = moment(date).format('HHmmss');

        const vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan dat ve: ' + bookingId;
        vnp_Params['vnp_OrderType'] = 'billpayment';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = req.ip || '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_BankCode'] = 'NCB';

        const sortedParams = sortObject(vnp_Params);
        const signData = Object.keys(sortedParams)
            .map(key => `${key}=${sortedParams[key]}`)
            .join('&');

        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(signData).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        const paymentUrl = `${vnpayConfig.vnp_Url}?` +
            Object.keys(vnp_Params)
            .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
            .join('&');

        console.log('Debug createPaymentUrl:', {
            signData,
            secretKey: vnpayConfig.vnp_HashSecret,
            signed,
            params: vnp_Params
        });

        return res.status(200).json({
            code: '00',
            data: paymentUrl
        });

    } catch (error) {
        console.error('Error in createPaymentUrl:', error);
        return res.status(500).json({
            code: '99',
            message: 'Error creating payment URL',
            error: error.message
        });
    }
};

const vnpayReturn = async(req, res) => {
    try {
        let vnp_Params = {...req.query };
        const secureHash = vnp_Params['vnp_SecureHash'];

        // Basic validation
        if (!secureHash) {
            console.error('Missing secure hash');
            return res.status(200).json({
                code: '97',
                message: 'Missing secure hash'
            });
        }

        // Remove hash from params
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Convert all values to string and trim
        Object.keys(vnp_Params).forEach(key => {
            if (vnp_Params[key] !== undefined && vnp_Params[key] !== null) {
                vnp_Params[key] = String(vnp_Params[key]).trim();
            }
        });

        // Sort and create signature
        const sortedParams = sortObject(vnp_Params);
        const signData = Object.keys(sortedParams)
            .map(key => `${key}=${sortedParams[key]}`)
            .join('&');

        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(signData).digest('hex');

        console.log('Debug vnpayReturn:', {
            receivedHash: secureHash,
            calculatedHash: signed,
            secretKey: vnpayConfig.vnp_HashSecret,
            signData,
            originalParams: req.query,
            processedParams: vnp_Params,
            sortedParams
        });

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];
            const orderInfo = vnp_Params['vnp_OrderInfo'];
            const bookingId = orderInfo.split(': ')[1];

            if (rspCode === '00') {
                const session = await mongoose.startSession();
                session.startTransaction();

                try {
                    const transaction = await Transaction.findOneAndUpdate({ vnpayCode: vnp_Params['vnp_TransactionNo'] }, {
                        bookingId: bookingId,
                        vnpayCode: vnp_Params['vnp_TransactionNo'],
                        amount: vnp_Params['vnp_Amount'] / 100,
                        status: 'success',
                        userId: req.user ? req.user._id : null
                    }, {
                        upsert: true,
                        new: true,
                        session
                    });

                    await Booking.findByIdAndUpdate(
                        bookingId, {
                            status: 'confirmed',
                            paymentStatus: 'paid',
                            paymentDate: moment(vnp_Params['vnp_PayDate'], 'YYYYMMDDHHmmss').toDate()
                        }, { session }
                    );

                    await session.commitTransaction();

                    return res.status(200).json({
                        code: '00',
                        message: 'Success',
                        data: {
                            orderId: orderId,
                            amount: vnp_Params['vnp_Amount'] / 100,
                            orderInfo: orderInfo,
                            payDate: vnp_Params['vnp_PayDate'],
                            transactionNo: vnp_Params['vnp_TransactionNo'],
                            transactionId: transaction._id
                        }
                    });
                } catch (error) {
                    await session.abortTransaction();
                    throw error;
                } finally {
                    session.endSession();
                }
            } else {
                await Transaction.findOneAndUpdate({ vnpayCode: vnp_Params['vnp_TransactionNo'] }, {
                    bookingId: bookingId,
                    vnpayCode: vnp_Params['vnp_TransactionNo'],
                    amount: vnp_Params['vnp_Amount'] / 100,
                    status: 'failed',
                    userId: req.user ? req.user._id : null
                }, { upsert: true });

                // Cập nhật trạng thái booking về failed/cancelled khi thanh toán thất bại
                await Booking.findByIdAndUpdate(
                    bookingId, { paymentStatus: 'failed', status: 'cancelled' }
                );

                // Nhả ghế khi thanh toán thất bại
                const booking = await Booking.findById(bookingId);
                if (booking) {
                    await Seat.updateMany({
                        screeningId: booking.screeningId,
                        seatNumber: { $in: booking.seatNumbers }
                    }, {
                        status: 'available',
                        reservedAt: null
                    });
                }

                return res.status(200).json({
                    code: rspCode,
                    message: 'Failed',
                    data: {
                        orderId: orderId,
                        amount: vnp_Params['vnp_Amount'] / 100,
                        orderInfo: orderInfo
                    }
                });
            }
        } else {
            console.error('Invalid signature:', {
                received: secureHash,
                calculated: signed,
                params: vnp_Params,
                signData: signData,
                secretKey: vnpayConfig.vnp_HashSecret
            });
            return res.status(200).json({
                code: '97',
                message: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('Error in vnpayReturn:', error);
        return res.status(500).json({
            code: '99',
            message: 'Error processing payment return',
            error: error.message
        });
    }
};

module.exports = {
    createPaymentUrl,
    vnpayReturn
};