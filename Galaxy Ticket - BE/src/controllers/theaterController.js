const Theater = require('../models/Theater');

// Get all theaters
const getAllTheaters = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        
        if (status !== undefined) {
            query.status = status;
        }
        
        const theaters = await Theater.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: theaters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get theater by ID
const getTheaterById = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }
        res.json({
            success: true,
            data: theater
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create new theater
const createTheater = async (req, res) => {
    try {
        const theater = new Theater(req.body);
        const newTheater = await theater.save();
        res.status(201).json({
            success: true,
            message: 'Theater created successfully',
            data: newTheater
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update theater
const updateTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        Object.assign(theater, req.body);
        const updatedTheater = await theater.save();
        res.json({
            success: true,
            message: 'Theater updated successfully',
            data: updatedTheater
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete theater
const deleteTheater = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (!theater) {
            return res.status(404).json({
                success: false,
                message: 'Theater not found'
            });
        }

        theater.status = false;
        await theater.save();
        res.json({
            success: true,
            message: 'Theater deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllTheaters,
    getTheaterById,
    createTheater,
    updateTheater,
    deleteTheater
};
