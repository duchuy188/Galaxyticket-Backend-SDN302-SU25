const mongoose = require('mongoose')

const screeningSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return this.startTime && value > this.startTime;
            },
            message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
        }
    },
    status: {
        type: Boolean,
        default: true
    },
    ticketPrice: {
        type: Number,
        required: true,
        min: [0, 'Giá vé không thể âm']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Screening', screeningSchema);