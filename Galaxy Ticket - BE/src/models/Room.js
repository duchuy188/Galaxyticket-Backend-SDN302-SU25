const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true
    },
    name: {
        type: String,
        require: true,
        trim: true
    },
    totalSeats: {
        type: Number,
        required: true,
        min: [1, 'Số ghế phải lớn hơn 0']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema)