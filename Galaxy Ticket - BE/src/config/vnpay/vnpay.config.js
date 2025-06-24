require('dotenv').config();

const config = {
    vnp_TmnCode: "NU8CTA9G",
    vnp_HashSecret: "3D2NVR3HENGTW25POFRQP04FRHXJCIZK",
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_ReturnUrl: "http://localhost:5173/confirmation"
};

module.exports = config;