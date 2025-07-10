const mongoose = require('mongoose');

const promotionUsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    usedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Tạo unique compound index để đảm bảo mỗi user chỉ có thể sử dụng một promotion một lần
promotionUsageSchema.index({ userId: 1, promotionId: 1 }, { unique: true });

module.exports = mongoose.model('PromotionUsage', promotionUsageSchema); 