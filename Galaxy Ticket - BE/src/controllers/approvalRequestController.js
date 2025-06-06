const ApprovalRequest = require('../models/ApprovalRequest');
const Movie = require('../models/Movie');

const getAllRequests = async (req, res) => {
    try {
        const { type, status } = req.query;
        let query = {};
        
        if (type) query.type = type;
        if (status) query.status = status;

        const requests = await ApprovalRequest.find(query)
            .sort({ createdAt: -1 })
            .populate('staffId', 'name email')
            .populate('managerId', 'name email');

        res.status(200).json({
            success: true,
            message: 'Get all approval requests successfully',
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getRequestById = async (req, res) => {
    try {
        const request = await ApprovalRequest.findById(req.params.id)
            .populate('staffId', 'name email')
            .populate('managerId', 'name email');

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Approval request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Get approval request successfully',
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateRequest = async (req, res) => {
    try {
        const { status, rejectionReason, managerId } = req.body;
        const request = await ApprovalRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Approval request not found'
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Request is not pending'
            });
        }

        // Update movie first
        const updatedMovie = await Movie.findByIdAndUpdate(
            request.referenceId, 
            {
                status: status,
                approvedBy: managerId,
                rejectionReason: status === 'rejected' ? rejectionReason : null
            },
            { new: true }
        );

        // Update request including requestData
        request.status = status;
        request.managerId = managerId;
        request.rejectionReason = status === 'rejected' ? rejectionReason : null;
        request.requestData = updatedMovie; // Update requestData với movie mới
        await request.save();

        res.status(200).json({
            success: true,
            message: `Request ${status} successfully`,
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllRequests,
    getRequestById,
    updateRequest
};