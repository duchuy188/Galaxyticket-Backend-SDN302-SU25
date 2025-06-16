const Movie = require("../models/Movie");
const ApprovalRequest = require("../models/ApprovalRequest");
const { uploadImage } = require("../services/uploadService");

const getAllMovies = async (req, res) => {
  try {
    const { genre, status, showingStatus } = req.query;
    let query = {};

    if (genre) query.genre = genre;
    if (status !== undefined) query.status = status === "true";
    if (showingStatus) query.showingStatus = showingStatus;

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
    const {
      title,
      description,
      genre,
      duration,
      releaseDate,
      country,
      trailerUrl,
      showingStatus,
    } = req.body;

    // Check required fields
    if (
      !title ||
      !description ||
      !genre ||
      !duration ||
      !releaseDate ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if poster file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Poster image is required",
      });
    }

    // Upload poster to cloud
    const posterUrl = await uploadImage(req.file);

    const movie = await Movie.create({
      title,
      description,
      genre,
      duration: Number(duration),
      posterUrl, // Chỉ lấy từ file upload
      trailerUrl,
      releaseDate,
      country,
      showingStatus: showingStatus || "coming-soon",
    });

    res.status(201).json({
      success: true,
      message: "Create film successfully",
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

    // Kiểm tra tính hợp lệ của showingStatus
    if (updateData.showingStatus) {
        const currentStatus = movie.showingStatus;
        const newStatus = updateData.showingStatus;
        
        const validTransitions = {
            'coming-soon': ['now-showing'],   
            'now-showing': ['ended'],         
            'ended': []                       
        };

        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from '${currentStatus}' to '${newStatus}'`
            });
        }
    }

    // Nếu phim đã approved
    if (movie.status === 'approved') {
        // Tạo approval request mới
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
            data: movie // Trả về phim gốc
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
        message: 'Movie updated successfully',
        data: updatedMovie
    });
  } catch (error) {
    res.status(500).json({
        success: false,
        message: error.message
    });
  }
};

// Delete movie (soft delete)
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { status: false },
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
