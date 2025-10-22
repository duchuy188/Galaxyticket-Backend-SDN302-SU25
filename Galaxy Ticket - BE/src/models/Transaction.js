const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    transactionNo: {
        type: String,
        unique: true,
        sparse: true
    },
    vnpayCode: {
        type: String,
        // keep for backward compatibility; not strictly required if transactionNo is used
        required: false,
        unique: true,
        sparse: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Số tiền không thể âm']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true,
    collection: 'transactions'
});

transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);