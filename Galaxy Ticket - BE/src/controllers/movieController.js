const Movie = require('../models/Movie');
const ApprovalRequest = require('../models/ApprovalRequest');
const { uploadImage } = require('../services/uploadService');


const getAllMovies = async (req, res) => {
    try {
        const { genre, status, showingStatus } = req.query;
        let query = { isActive: true }; 
        
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
        const movie = await Movie.findOne({
            _id: req.params.id,
            isActive: true 
        });

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
            releaseDate, country, trailerUrl, showingStatus,
            producer, directors, actors  // Thêm các trường mới
        } = req.body;

        if (trailerUrl) {
            try {
                new URL(trailerUrl);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid URL format for trailer URL'
                });
            }
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Poster image is required'
            });
        }

        // Validate các trường mới
        if (!producer || !directors || !directors.length || !actors || !actors.length) {
            return res.status(400).json({
                success: false,
                message: 'Producer, directors and actors are required'
            });
        }

        const posterUrl = await uploadImage(req.file);

        // Tạo movie với validated data
        const movie = await Movie.create({
            title,
            description,
            genre,
            duration: Number(duration),
            posterUrl,
            trailerUrl,
            releaseDate,
            country,
            showingStatus: showingStatus || 'coming-soon',
            status: 'pending',
            createdBy: req.body.createdBy,
            producer,           // Thêm producer
            directors,         // Thêm directors
            actors            // Thêm actors
        });

        // Tạo approval request
        await ApprovalRequest.create({
            staffId: req.body.createdBy,
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

        
        if (movie.status === 'approved') {
          
            updateData.status = 'pending';
            updateData.approvedBy = null;
            updateData.rejectionReason = null;

            // Tạo approval request mới
            await ApprovalRequest.create({
                staffId: movie.createdBy,
                type: 'movie',
                requestData: { ...movie.toObject(), ...updateData },
                referenceId: movie._id,
                status: 'pending'
            });
        } else if (movie.status === 'rejected') {
           
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
            message: movie.status === 'pending' ? 
                'Movie updated successfully' : 
                'Movie update submitted for approval',
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
            { isActive: false },
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
    deleteMovie
};