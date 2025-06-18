const Promotion = require('../models/Promotion');
const ApprovalRequest = require('../models/ApprovalRequest');

// Lấy tất cả promotion
exports.getAllPromotions = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { isActive: true }; // Thêm isActive filter như movie
        
        if (status) query.status = status;

        const promotions = await Promotion.find(query)
            .sort({ createdAt: -1 }); // Thêm sort như movie

        res.status(200).json({
            success: true,
            message: 'Get all promotions successfully',
            data: promotions,
            count: promotions.length
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Lấy promotion theo ID
exports.getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findOne({
            _id: req.params.id,
            isActive: true
        });
        
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Get promotion successfully',
            data: promotion
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Tạo promotion mới
exports.createPromotion = async (req, res) => {
    try {
        if (req.body._id) {
            delete req.body._id;
        }
        // Ép kiểu ngày
        if (req.body.startDate) req.body.startDate = new Date(req.body.startDate);
        if (req.body.endDate) req.body.endDate = new Date(req.body.endDate);

        // Tạo promotion với status pending
        const promotion = await Promotion.create({
            ...req.body,
            status: 'pending'
        });

        // Tạo approval request
        await ApprovalRequest.create({
            staffId: req.body.createdBy,
            type: 'promotion',
            requestData: promotion.toObject(),
            referenceId: promotion._id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Promotion created and pending approval',
            data: promotion
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors).map(err => err.message).join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Cập nhật promotion
exports.updatePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }

        const updateData = { ...req.body };
        if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
        if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);

        // Nếu promotion đã được approve, tạo approval request mới
        if (promotion.status === 'approved') {
            updateData.status = 'pending';
            updateData.approvedBy = null;
            updateData.rejectionReason = null;

            // Tạo approval request mới
            await ApprovalRequest.create({
                staffId: promotion.createdBy,
                type: 'promotion',
                requestData: { ...promotion.toObject(), ...updateData },
                referenceId: promotion._id,
                status: 'pending'
            });
        } else if (promotion.status === 'rejected') {
            updateData.status = 'pending';
            updateData.rejectionReason = null;

            // Tạo approval request mới
            await ApprovalRequest.create({
                staffId: promotion.createdBy,
                type: 'promotion',
                requestData: { ...promotion.toObject(), ...updateData },
                referenceId: promotion._id,
                status: 'pending'
            });
        }

        const updatedPromotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: promotion.status === 'pending' ? 
                'Promotion updated successfully' : 
                'Promotion update submitted for approval',
            data: updatedPromotion
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors).map(err => err.message).join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Xóa promotion (soft delete)
exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Promotion deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Kiểm tra mã giảm giá
exports.validatePromotionCode = async (req, res) => {
    try {
        const { code } = req.body;
        const now = new Date();
        console.log('now:', now);

        // Tìm promotion theo code
        const promotion = await Promotion.findOne({ code: code.toUpperCase() });
        if (!promotion) {
            console.log('Không tìm thấy promotion với code:', code.toUpperCase());
            return res.status(404).json({ message: 'Invalid or expired promotion code' });
        }
        console.log('Promotion tìm được:', promotion);

        // Kiểm tra từng điều kiện
        if (!promotion.isActive) {
            console.log('Promotion không active');
            return res.status(404).json({ message: 'Invalid or expired promotion code' });
        }
        if (promotion.status !== 'approved') {
            console.log('Promotion chưa được duyệt');
            return res.status(404).json({ message: 'Invalid or expired promotion code' });
        }
        if (promotion.startDate > now) {
            console.log('Promotion chưa bắt đầu');
            return res.status(404).json({ message: 'Invalid or expired promotion code' });
        }
        if (promotion.endDate < now) {
            console.log('Promotion đã hết hạn');
            return res.status(404).json({ message: 'Invalid or expired promotion code' });
        }

        // Nếu qua hết các điều kiện
        res.json(promotion);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};