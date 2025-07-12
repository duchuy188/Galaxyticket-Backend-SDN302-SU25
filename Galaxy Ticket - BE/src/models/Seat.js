const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    screeningId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screening',
        required: [true, 'Screening ID is required'],
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid Screening ID'
        }
    },
    seatNumber: {
        type: String,
        required: [true, 'Seat number is required'],
        trim: true,
        minLength: [1, 'Seat number must be at least 1 character'],
        maxLength: [10, 'Seat number cannot exceed 10 characters']
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['available', 'reserved', 'booked'],
            message: 'Invalid seat status'
        },
        default: 'available'
    },
    reservedAt: {
        type: Date,
        default: null,
        validate: {
            validator: function(v) {
                if (!v) return true;
                const now = new Date();
                return v >= now;
            },
            message: 'Reserved date must be in the future'
        }
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Room ID is required'],
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid Room ID'
        }
    }
});

seatSchema.index({ screeningId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);