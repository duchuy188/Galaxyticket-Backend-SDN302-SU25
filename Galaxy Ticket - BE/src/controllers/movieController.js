const Movie = require("../models/Movie");
const ApprovalRequest = require("../models/ApprovalRequest");
const { uploadImage } = require("../services/uploadService");

const getAllMovies = async (req, res) => {
  try {
    const { genre, status, showingStatus } = req.query;
    let query = { isActive: true };

    if (genre) query.genre = genre;
    if (status) query.status = status;
    if (showingStatus) query.showingStatus = showingStatus;

    
    if (req.user && (req.user.role === "staff" || req.user.role === "manager")) {
      
      if (req.query.includeInactive === "true") {
        delete query.isActive;
      }
    } else {
      
      query.status = "approved";
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Get all movies successfully",
      data: movies,
      count: movies.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // Nếu không phải staff/manager và phim chưa approved hoặc không active
    if (
      (!req.user || (req.user.role !== "staff" && req.user.role !== "manager")) && 
      (movie.status !== "approved" || !movie.isActive)
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this movie",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get movie successfully",
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createMovie = async (req, res) => {
  try {
    let {
      title,
      description,
      genre,
      duration,
      releaseDate,
      country,
      trailerUrl,
      showingStatus,
      producer,
      directors,
      actors
    } = req.body;

  
    if (directors && typeof directors === 'string') {
      try {
        directors = JSON.parse(directors);
      } catch (e) {
        directors = [directors]; 
      }
    }
    
    if (actors && typeof actors === 'string') {
      try {
        actors = JSON.parse(actors);
      } catch (e) {
        actors = [actors];
      }
    }


    if (directors && !Array.isArray(directors)) {
      directors = [directors];
    }
    
    if (actors && !Array.isArray(actors)) {
      actors = [actors];
    }

    if (
      !title ||
      !description ||
      !genre ||
      !duration ||
      !releaseDate ||
      !country ||
      !producer ||
      !directors ||
      !actors
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate arrays
    if (!directors || directors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one director is required",
      });
    }

    if (!actors || actors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one actor is required",
      });
    }

    // Check if poster file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Poster image is required",
      });
    }

    // Validate trailerUrl if provided
    if (trailerUrl) {
      try {
        new URL(trailerUrl);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid URL format for trailer URL",
        });
      }
    }

    // Upload poster to cloud
    const posterUrl = await uploadImage(req.file);

    const movie = await Movie.create({
      title,
      description,
      genre,
      duration: Number(duration),
      posterUrl,
      trailerUrl,
      releaseDate,
      country,
      showingStatus: showingStatus || "coming-soon",
      status: "pending",
      createdBy: req.user.userId,
      producer,
      directors,
      actors
    });

    // Tạo approval request
    await ApprovalRequest.create({
      staffId: req.user.userId,
      type: 'movie',
      requestData: movie.toObject(),
      referenceId: movie._id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: "Movie created and pending approval",
      data: movie,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update movie
const updateMovie = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Parse directors and actors if they are JSON strings
    if (updateData.directors && typeof updateData.directors === 'string') {
      try {
        updateData.directors = JSON.parse(updateData.directors);
      } catch (e) {
        updateData.directors = [updateData.directors]; 
      }
    }
    
    if (updateData.actors && typeof updateData.actors === 'string') {
      try {
        updateData.actors = JSON.parse(updateData.actors);
      } catch (e) {
        updateData.actors = [updateData.actors]; 
      }
    }

  
    if (updateData.directors && !Array.isArray(updateData.directors)) {
      updateData.directors = [updateData.directors];
    }
    
    if (updateData.actors && !Array.isArray(updateData.actors)) {
      updateData.actors = [updateData.actors];
    }
    
    if (req.file) {
      updateData.posterUrl = await uploadImage(req.file);
    }

    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    if (updateData.showingStatus) {
      const currentStatus = movie.showingStatus;
      const newStatus = updateData.showingStatus;
      
      if (currentStatus === 'now-showing' && newStatus === 'coming-soon') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change status from now-showing back to coming-soon'
        });
      }
      
      if (currentStatus === 'ended' && 
          (newStatus === 'coming-soon' || newStatus === 'now-showing')) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change status from ended to any previous status'
        });
      }

      if (currentStatus === 'coming-soon' && newStatus === 'ended') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change status directly from coming-soon to ended. Must go through now-showing first'
        });
      }
    }

  
    if (movie.status === 'approved') {

      await ApprovalRequest.create({
        staffId: movie.createdBy,
        type: 'movie',
        requestData: { ...movie.toObject(), ...updateData },
        referenceId: movie._id,
        status: 'pending'
      });

      return res.status(200).json({
        success: true,
        message: 'Update request has been submitted and waiting for approval',
        data: movie 
      });
    }
 
    if (movie.status === 'rejected') {
      updateData.status = 'pending';
      updateData.rejectionReason = null;
      
      await ApprovalRequest.create({
        staffId: movie.createdBy,
        type: 'movie',
        requestData: { ...movie.toObject(), ...updateData },
        referenceId: movie._id,
        status: 'pending'
      });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Movie update submitted for approval',
      data: updatedMovie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
