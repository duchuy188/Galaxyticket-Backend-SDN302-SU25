const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Theater name is required'],
        trim: true,
        minlength: [2, 'Theater name must be at least 2 characters'],
        maxlength: [100, 'Theater name cannot exceed 100 characters']
    },
    address: {
        type: String,
        required: [true, 'Theater address is required'],
        trim: true,
        minlength: [10, 'Address must be at least 10 characters'],
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                const cleanPhone = v.replace(/\s/g, '');
                return /^[0-9]{4,10}$/.test(cleanPhone);
            },
            message: 'Invalid phone number format'
        }
    },
    description: {
        type: String,
        required: [true, 'Theater description is required'],
        trim: true,
        minlength: [50, 'Description must be at least 50 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
        type: Boolean,
        default: true,
        required: [true, 'Theater status is required']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Theater', theaterSchema);