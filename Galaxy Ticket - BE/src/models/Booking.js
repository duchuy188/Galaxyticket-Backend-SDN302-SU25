const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    screeningId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screening',
        required: true
    },
    seatIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true
    }],
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Tổng tiền không thể âm']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        default: null
    }
}, {
    timestamps: true  
});


bookingSchema.path('seatIds').validate(function(value) {
    return value && value.length > 0;
}, 'Phải chọn ít nhất 1 ghế');

module.exports = mongoose.model('Booking', bookingSchema);