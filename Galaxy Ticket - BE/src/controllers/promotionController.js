const Promotion = require('../models/Promotion');

// Lấy tất cả promotion
exports.getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find();
        res.json(promotions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy promotion theo ID
exports.getPromotionById = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);
        if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
        res.json(promotion);
    } catch (err) {
        res.status(500).json({ message: err.message });
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

        console.log('startDate:', req.body.startDate, 'endDate:', req.body.endDate);
        const promotion = new Promotion(req.body);
        await promotion.save();
        res.status(201).json(promotion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Cập nhật promotion
exports.updatePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
        res.json(promotion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Xóa promotion
exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
        res.json({ message: 'Promotion deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
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