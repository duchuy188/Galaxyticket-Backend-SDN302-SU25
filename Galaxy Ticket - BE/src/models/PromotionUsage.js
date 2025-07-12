const mongoose = require('mongoose');

const promotionUsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid User ID'
        }
    },
    promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion',
        required: [true, 'Promotion ID is required'],
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid Promotion ID'
        }
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking ID is required'],
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid Booking ID'
        }
    },
    usedAt: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function(v) {
                if (!v) return true;
                const now = new Date();
                return v <= now;
            },
            message: 'Used date cannot be in the future'
        }
    }
}, {
    timestamps: true
});

// Tạo unique compound index để đảm bảo mỗi user chỉ có thể sử dụng một promotion một lần
promotionUsageSchema.index({ userId: 1, promotionId: 1 }, { unique: true });

module.exports = mongoose.model('PromotionUsage', promotionUsageSchema);