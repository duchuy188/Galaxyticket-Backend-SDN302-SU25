const Movie = require('../models/Movie');
const ApprovalRequest = require('../models/ApprovalRequest');
const { uploadImage } = require('../services/uploadService');


const getAllMovies = async (req, res) => {
    try {
        const { genre, status, showingStatus } = req.query;
        let query = {};
        
        if (genre) query.genre = genre;
        if (status) query.status = status;
        if (showingStatus) query.showingStatus = showingStatus;

        const movies = await Movie.find(query)
            .sort({ createdAt: -1 }); 

        res.status(200).json({
            success: true,
            message: 'Get all movies successfully',
            data: movies,
            count: movies.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Get movie successfully',
            data: movie
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


const createMovie = async (req, res) => {
    try {
        const { 
            title, description, genre, duration, 
            releaseDate, country, trailerUrl, showingStatus 
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Poster image is required'
            });
        }

        const posterUrl = await uploadImage(req.file);

        // Tạo movie với status pending
        const movie = await Movie.create({
            title,
            description,
            genre,
            duration: Number(duration),
            posterUrl,
            trailerUrl,
            releaseDate,
            country,
            showingStatus: showingStatus || 'coming_soon',
            status: 'pending',
            createdBy: req.body.createdBy // Tạm thời nhận từ body
        });

        // Tạo approval request
        await ApprovalRequest.create({
            staffId: req.body.createdBy, // Tạm thời nhận từ body
            type: 'movie',
            requestData: movie.toObject(),
            referenceId: movie._id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Movie created and pending approval',
            data: movie
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map(err => err.message).join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update movie
const updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        const updateData = { ...req.body };
        if (req.file) {
            updateData.posterUrl = await uploadImage(req.file);
        }

        // Nếu đang approved và update, set lại status pending
        if (movie.status === 'approved') {
            updateData.status = 'pending';
            updateData.approvedBy = null;
            updateData.rejectionReason = null;

            // Tạo approval request mới
            await ApprovalRequest.create({
                staffId: movie.createdBy, // Dùng createdBy của movie
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
            message: movie.status === 'approved' ? 
                'Movie update submitted for approval' : 
                'Movie updated successfully',
            data: updatedMovie
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Approve/reject movie
const approveMovie = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found'
            });
        }

        if (movie.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Movie is not pending approval'
            });
        }

        movie.status = status;
        movie.approvedBy = req.body.managerId; // Tạm thời nhận từ body
        if (status === 'rejected') {
            movie.rejectionReason = rejectionReason;
        }

        await movie.save();

        // Update approval request
        await ApprovalRequest.findOneAndUpdate(
            { referenceId: movie._id, status: 'pending' },
            { 
                status,
                managerId: req.body.managerId, // Tạm thời nhận từ body
                rejectionReason: status === 'rejected' ? rejectionReason : null
            }
        );

        res.status(200).json({
            success: true,
            message: `Movie ${status} successfully`,
            data: movie
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
                message: 'Movie not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Movie deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
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
    approveMovie,
    deleteMovie
};