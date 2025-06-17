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

   
        if (!status || !managerId) {
            return res.status(400).json({
                success: false,
                message: 'Status and managerId are required'
            });
        }

        if (status === 'rejected' && !rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required when rejecting a request'
            });
        }

    
        switch(request.type) {
            case 'movie':
                const updatedMovie = await Movie.findByIdAndUpdate(
                    request.referenceId, 
                    {
                        status: status,
                        approvedBy: managerId,
                        rejectionReason: status === 'rejected' ? rejectionReason : null
                    },
                    { new: true }
                );

                if (!updatedMovie) {
                    return res.status(404).json({
                        success: false,
                        message: 'Referenced movie not found'
                    });
                }

                request.status = status;
                request.managerId = managerId;
                request.rejectionReason = status === 'rejected' ? rejectionReason : null;
                request.requestData = updatedMovie;
                break;

            // 6. Chuẩn bị cho tương lai khi thêm các loại request khác
            case 'promotion':
                const Promotion = require('../models/Promotion');
                const updatedPromotion = await Promotion.findByIdAndUpdate(
                    request.referenceId,
                    {
                        status: status,
                        approvedBy: managerId,
                        rejectionReason: status === 'rejected' ? rejectionReason : null
                    },
                    { new: true }
                );
            
                if (!updatedPromotion) {
                    return res.status(404).json({
                        success: false,
                        message: 'Referenced promotion not found'
                    });
                }
            
                request.status = status;
                request.managerId = managerId;
                request.rejectionReason = status === 'rejected' ? rejectionReason : null;
                request.requestData = updatedPromotion;
                break;

            case 'screening':
                const Screening = require('../models/Screening');
                const updatedScreening = await Screening.findByIdAndUpdate(
                    request.referenceId,
                    {
                        status: status,
                        approvedBy: managerId,
                        rejectionReason: status === 'rejected' ? rejectionReason : null
                    },
                    { new: true }
                );
            
                if (!updatedScreening) {
                    return res.status(404).json({
                        success: false,
                        message: 'Referenced screening not found'
                    });
                }
            
                request.status = status;
                request.managerId = managerId;
                request.rejectionReason = status === 'rejected' ? rejectionReason : null;
                request.requestData = updatedScreening;
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request type'
                });
        }


        await request.save();

  
        res.status(200).json({
            success: true,
            message: `Request ${status} successfully`,
            data: request
        });

    } catch (error) {
        console.error('Error in updateRequest:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
};

module.exports = {
    getAllRequests,
    getRequestById,
    updateRequest
};