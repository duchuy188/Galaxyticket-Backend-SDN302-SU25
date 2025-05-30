const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
        uppercase: true  
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['percent', 'fixed']
    },
    value: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                if (this.type === 'percent') {
                    return value > 0 && value <= 100;
                }
                return value > 0;
            },
            message: 'Giá trị không hợp lệ. Đối với phần trăm giảm giá phải từ 1-100%, đối với giá trị cố định phải lớn hơn 0'
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value > this.startDate;
            },
            message: 'Ngày kết thúc phải sau ngày bắt đầu'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
});


promotionSchema.index({ code: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ isActive: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);