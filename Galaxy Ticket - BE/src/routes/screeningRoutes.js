const express = require('express');
const router = express.Router();
const screeningController = require('../controllers/screeningController');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');
const Screening = require('../models/Screening');


// Lấy danh sách suất chiếu công khai (public)
router.get('/public', async (req, res) => {
    try {
        const { movieId, theaterId, startTime } = req.query;
        let query = { status: 'approved', isActive: true };

        if (movieId) query.movieId = movieId;
        if (theaterId) query.theaterId = theaterId;
        if (startTime) query.startTime = { $gte: new Date(startTime) };

        const screenings = await Screening.find(query)
            .populate('movieId roomId createdBy approvedBy')
            .sort({ startTime: 1 });

        res.status(200).json({
            success: true,
            message: 'Get public screenings successfully',
            data: screenings,
            count: screenings.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Lấy danh sách suất chiếu cho member (cần đăng nhập, role member)
router.get('/member', authenticate, authorizeRoles('member'), async (req, res) => {
    try {
        let query = { status: 'approved', isActive: true };

        const screenings = await Screening.find(query)
            .populate('movieId roomId createdBy approvedBy')
            .sort({ startTime: 1 });

        res.status(200).json({
            success: true,
            message: 'Get member screenings successfully',
            data: screenings,
            count: screenings.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// Lấy tất cả suất chiếu
router.get('/', authenticate, screeningController.getAllScreenings);

// Lấy tất cả suất chiếu theo rạp
router.get('/theater/:theaterId', authenticate, screeningController.getScreeningsByTheater);

// Lấy tất cả suất chiếu theo phim
router.get('/movie/:movieId', authenticate, screeningController.getScreeningsByMovie);

// Lấy chi tiết 1 suất chiếu
router.get('/:id', authenticate, screeningController.getScreeningById);

// Tạo suất chiếu mới
router.post('/', authenticate, authorizeRoles('staff'), screeningController.createScreening);

// Cập nhật suất chiếu
router.put('/:id', authenticate, authorizeRoles('staff'), screeningController.updateScreening);

// Xóa (deactivate) suất chiếu
router.delete('/:id', authenticate, authorizeRoles('manager', 'staff'), screeningController.deleteScreening);


module.exports = router;