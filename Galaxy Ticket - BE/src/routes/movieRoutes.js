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


router.get("/member", authenticate, authorizeRoles("member"), updateMovieShowingStatus, async (req, res) => {
  try {

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


router.get("/", authenticate, authorizeRoles("staff", "manager"), updateMovieShowingStatus, getAllMovies);


router.get("/:id", updateMovieShowingStatus, getMovieById);


router.post("/", authenticate, authorizeRoles("staff"), upload.single("poster"), createMovie);
router.put("/:id", authenticate, authorizeRoles("staff"), upload.single("poster"), updateMovie);


router.delete("/:id", authenticate, authorizeRoles("manager","staff"), deleteMovie);

module.exports = router;
