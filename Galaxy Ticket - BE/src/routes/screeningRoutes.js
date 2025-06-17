const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');

// Lấy tất cả suất chiếu
router.get('/', screeningController.getAllScreenings);

// Lấy tất cả suất chiếu theo rạp
router.get('/theater/:theaterId', screeningController.getScreeningsByTheater);

// Lấy tất cả suất chiếu theo phim
router.get('/movie/:movieId', screeningController.getScreeningsByMovie);

// Lấy chi tiết 1 suất chiếu
router.get('/:id', screeningController.getScreeningById);

// Tạo suất chiếu mới
router.post('/', screeningController.createScreening);

// Cập nhật suất chiếu
router.put('/:id', screeningController.updateScreening);

// Xóa (deactivate) suất chiếu
router.delete('/:id', screeningController.deleteScreening);

module.exports = router;