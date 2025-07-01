const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    screeningId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screening',
    },
    seatNumber: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['available', 'reserved', 'booked'],
        default: 'available'
    },
    reservedAt: {
        type: Date,
        default: null
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    }
});

seatSchema.index({ screeningId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);