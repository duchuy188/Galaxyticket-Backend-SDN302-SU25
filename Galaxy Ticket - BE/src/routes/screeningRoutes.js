const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

// Lấy tất cả suất chiếu
router.get('/', authenticate, screeningController.getAllScreenings);

// Lấy tất cả suất chiếu theo rạp
router.get('/theater/:theaterId', authenticate, screeningController.getScreeningsByTheater);

// Lấy tất cả suất chiếu theo phim
router.get('/movie/:movieId', authenticate, screeningController.getScreeningsByMovie);

// Lấy chi tiết 1 suất chiếu
router.get('/:id', screeningController.getScreeningById);

// Tạo suất chiếu mới
router.post('/', authenticate, authorizeRoles('staff'), screeningController.createScreening);

// Cập nhật suất chiếu
router.put('/:id', authenticate, authorizeRoles('staff'), screeningController.updateScreening);

// Xóa (deactivate) suất chiếu
router.delete('/:id', authenticate, authorizeRoles('manager', 'staff'), screeningController.deleteScreening);

module.exports = router;