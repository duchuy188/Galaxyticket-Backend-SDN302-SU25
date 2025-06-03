const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, 'Tên rạp phải có ít nhất 2 ký tự']
    },
    address: {
        type: String,
        required: true,
        trim: true
     },
     phone: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'],
        unique: true 

     },
     status: {
        type: Boolean,
        default: true
     }
}, {
    timestamps: true
});

module.exports = mongoose.model('Theater', theaterSchema);