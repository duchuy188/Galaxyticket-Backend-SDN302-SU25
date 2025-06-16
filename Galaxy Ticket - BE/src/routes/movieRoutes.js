const express = require("express");
const router = express.Router();
const { upload } = require("../services/uploadService");
const { updateMovieShowingStatus } = require("../middlewares/movieStatus.middleware");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");
const Movie = require("../models/Movie");
const {
  getAllMovies,
  getMovieById,
  createMovie,
  deleteMovie,
  updateMovie,
} = require("../controllers/movieController");

// Route công khai - ai cũng xem được phim đã approved
router.get("/public", updateMovieShowingStatus, async (req, res) => {
  try {
    const { genre, showingStatus } = req.query;
    let query = { 
      status: "approved", 
      isActive: true 
    };


    if (genre) query.genre = genre;
    if (showingStatus) query.showingStatus = showingStatus;

    const movies = await Movie.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Get public movies successfully",
      data: movies,
      count: movies.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Route cho member - xem được phim đã approved
router.get("/member", authenticate, authorizeRoles("member"), updateMovieShowingStatus, async (req, res) => {
  try {
    // Chỉ hiển thị phim đã approved và đang active
    const movies = await Movie.find({ 
      status: "approved", 
      isActive: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Get member movies successfully",
      data: movies,
      count: movies.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Route cho staff và manager - xem được tất cả phim (kể cả pending, rejected)
router.get("/", authenticate, authorizeRoles("staff", "manager"), updateMovieShowingStatus, getAllMovies);
router.get("/:id", authenticate, authorizeRoles("staff", "manager"), updateMovieShowingStatus, getMovieById);

// Route để tạo và cập nhật phim - chỉ staff mới được phép
router.post("/", authenticate, authorizeRoles("staff"), upload.single("poster"), createMovie);
router.put("/:id", authenticate, authorizeRoles("staff"), upload.single("poster"), updateMovie);

// Route để xóa phim - chỉ manager mới được phép
router.delete("/:id", authenticate, authorizeRoles("manager"), deleteMovie);

module.exports = router;
