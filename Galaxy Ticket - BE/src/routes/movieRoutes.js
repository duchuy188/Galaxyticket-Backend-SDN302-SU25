const express = require('express');
const router = express.Router();
const { upload } = require('../services/uploadService');
const { getAllMovies, getMovieById, createMovie, deleteMovie, updateMovie, approveMovie } = require('../controllers/movieController');

router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', upload.single('poster'), createMovie);
router.delete('/:id', deleteMovie);
router.put('/:id', updateMovie);
router.put('/:id/approve', approveMovie);
module.exports = router;