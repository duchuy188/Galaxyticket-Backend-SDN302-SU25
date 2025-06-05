const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');

// Tạo suất chiếu mới
router.post('/', screeningController.createScreening);

// Lấy danh sách suất chiếu
router.get('/', screeningController.getAllScreenings);

// Lấy chi tiết suất chiếu theo ID
router.get('/:id', screeningController.getScreeningById);

// Cập nhật suất chiếu
router.put('/:id', screeningController.updateScreening);

// Xóa suất chiếu
router.delete('/:id', screeningController.deleteScreening);

module.exports = router;
