const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

router.get('/', promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', authenticate, authorizeRoles('staff'), promotionController.createPromotion);
router.put('/:id', authenticate, authorizeRoles('staff'), promotionController.updatePromotion);
router.delete('/:id', authenticate, authorizeRoles('manager', 'staff'), promotionController.deletePromotion);

// Kiểm tra mã giảm giá
router.post('/validate', promotionController.validatePromotionCode);

module.exports = router;