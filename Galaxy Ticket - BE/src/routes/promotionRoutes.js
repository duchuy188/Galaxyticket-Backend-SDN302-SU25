const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const { upload } = require('../services/uploadService');

router.get('/', authenticate, promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', authenticate, authorizeRoles('staff'), upload.single('poster'), promotionController.createPromotion);
router.put('/:id', authenticate, authorizeRoles('staff'), upload.single('poster'), promotionController.updatePromotion);
router.delete('/:id', authenticate, authorizeRoles('manager', 'staff'), promotionController.deletePromotion);

// Kiểm tra mã giảm giá
router.post('/validate', promotionController.validatePromotionCode);

module.exports = router;