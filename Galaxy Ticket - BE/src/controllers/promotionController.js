const Promotion = require('../models/Promotion');
const ApprovalRequest = require('../models/ApprovalRequest');

// Lấy tất cả promotion
exports.getAllPromotions = async (req, res) => {
    try {
        const { status } = req.query;
        let query = { isActive: true };
        // Nếu không phải staff/manager thì chỉ trả về promotion đã duyệt
        if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'manager')) {
            query.status = 'approved';
        } else if (status) {
            query.status = status;
        }

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
        let query = {
            _id: req.params.id,
            isActive: true
        };
        // Nếu không phải staff/manager thì chỉ trả về promotion đã duyệt
        if (!req.user || (req.user.role !== 'staff' && req.user.role !== 'manager')) {
            query.status = 'approved';
        }
        const promotion = await Promotion.findOne(query);
        
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
        console.log('Create promotion request body:', req.body);
        console.log('Authenticated user:', req.user);
        
        if (req.body._id) {
            delete req.body._id;
        }
        // Ép kiểu ngày
        if (req.body.startDate) req.body.startDate = new Date(req.body.startDate);
        if (req.body.endDate) req.body.endDate = new Date(req.body.endDate);        // Kiểm tra và lấy ID người dùng
        let createdBy;
        // Sử dụng userId từ req.user (theo cách JWT được tạo trong auth.controller.js)
        if (req.user) {
            createdBy = req.user.userId;
            console.log('User from JWT token:', req.user);
        } 
        
        // Nếu không có createdBy, báo lỗi
        if (!createdBy) {
            return res.status(400).json({
                success: false,
                message: "createdBy field is required"
            });
        }
        
        console.log('Using createdBy:', createdBy);

        // Tạo promotion với status pending
        const promotion = await Promotion.create({
            ...req.body,
            createdBy,
            status: 'pending'
        });        // Tạo approval request
        await ApprovalRequest.create({
            staffId: req.user.userId,
            type: 'promotion',
            requestData: promotion.toObject(),
            referenceId: promotion._id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Promotion created and pennding approval',
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
        console.log('Update promotion request body:', req.body);
        console.log('Authenticated user:', req.user);

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

        // Lấy userId từ thông tin đăng nhập
        const staffId = req.user.userId;

        // Nếu promotion đang pending, cập nhật approval request hiện tại
        if (promotion.status === 'pending') {
            const existingRequest = await ApprovalRequest.findOne({
                referenceId: promotion._id,
                status: 'pending'
            });

            if (existingRequest) {
                existingRequest.requestData = { ...promotion.toObject(), ...updateData };
                await existingRequest.save();
            } else {
                await ApprovalRequest.create({
                    staffId: staffId,
                    type: 'promotion',
                    requestData: { ...promotion.toObject(), ...updateData },
                    referenceId: promotion._id,
                    status: 'pending'
                });
            }
        } else if (promotion.status === 'approved') {
            updateData.status = 'pending';
            updateData.approvedBy = null;
            updateData.rejectionReason = null;

            await ApprovalRequest.create({
                staffId: staffId,
                type: 'promotion',
                requestData: { ...promotion.toObject(), ...updateData },
                referenceId: promotion._id,
                status: 'pending'
            });
        } else if (promotion.status === 'rejected') {
            updateData.status = 'pending';
            updateData.rejectionReason = null;

            await ApprovalRequest.create({
                staffId: staffId,
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
            message: 'Promotion update submitted for approval',
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

// Xóa promotion (chuyển sang pending để duyệt lại)
exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        
        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promotion not found'
            });
        }

        // Nếu promotion đang ở trạng thái approved
        if (promotion.status === 'approved') {
            // Tạo approval request mới
            await ApprovalRequest.create({
                staffId: req.user.userId,
                type: 'promotion',
                requestData: {
                    ...promotion.toObject(),
                    status: 'pending',
                    approvedBy: null,
                    rejectionReason: null
                },
                referenceId: promotion._id,
                status: 'pending'
            });

            // Cập nhật promotion về trạng thái pending
            const updatedPromotion = await Promotion.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'pending',
                    approvedBy: null,
                    rejectionReason: null
                },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: 'Promotion has been set to pending for re-approval',
                data: updatedPromotion
            });
        } else {
            // Nếu không phải approved thì thực hiện soft delete như cũ
            const deletedPromotion = await Promotion.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                message: 'Promotion deleted successfully',
                data: deletedPromotion
            });
        }
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