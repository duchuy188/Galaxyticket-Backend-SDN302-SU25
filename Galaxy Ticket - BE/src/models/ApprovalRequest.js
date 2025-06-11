const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    type: {
        type: String,
        enum: ['movie', 'promotion', 'screening'],
        required: true
    },
    requestData: {
        type: mongoose.Schema.Types.Mixed,  
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: null
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);
