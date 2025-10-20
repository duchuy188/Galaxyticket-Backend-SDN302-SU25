const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Thiếu userId']
    },
    screeningId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screening',
        required: [true, 'Thiếu screeningId']
    },
    seatNumbers: [{
        type: String,
        required: [true, 'Phải chọn ít nhất 1 ghế'],
        trim: true,
        minLength: [1, 'Mã ghế phải có ít nhất 1 ký tự'],
        maxLength: [10, 'Mã ghế không vượt quá 10 ký tự']
    }],
    totalPrice: {
        type: Number,
        required: [true, 'Thiếu tổng tiền'],
        min: [0, 'Tổng tiền không thể âm'],
        max: [100000000, 'Tổng tiền quá lớn']
    },
    paymentStatus: {
        type: String,
        required: [true, 'Thiếu trạng thái thanh toán'],
        enum: {
            values: ['pending', 'paid', 'failed', 'cancelled'],
            message: 'Trạng thái thanh toán không hợp lệ'
        },
        default: 'pending'
    },
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        default: null
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: [0, 'Số tiền giảm giá không thể âm'],
        max: [100000000, 'Số tiền giảm giá quá lớn']
    },
    code: {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
        minLength: [1, 'Mã code phải có ít nhất 1 ký tự'],
        maxLength: [20, 'Mã code không vượt quá 20 ký tự'],
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        trim: true,
        default: null
    },
    checkInStatus: {
        type: String,
        enum: {
            values: ['not_checked_in', 'checked_in'],
            message: 'Trạng thái check-in không hợp lệ'
        },
        default: 'not_checked_in'
    },
    checkedInAt: {
        type: Date,
        default: null
    },
    checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

bookingSchema.path('seatNumbers').validate(function (value) {
    return value && value.length > 0;
}, 'Phải chọn ít nhất 1 ghế');

module.exports = mongoose.model('Booking', bookingSchema);