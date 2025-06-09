const express = require('express');
const router = express.Router();
const { upload } = require('../services/uploadService');
const { updateMovieShowingStatus } = require('../middlewares/movieStatus.middleware');
const { getAllMovies, getMovieById, createMovie, deleteMovie, updateMovie } = require('../controllers/movieController');

router.get('/', updateMovieShowingStatus, getAllMovies);
router.get('/:id', updateMovieShowingStatus, getMovieById);
router.post('/', upload.single('poster'), createMovie);
router.delete('/:id', deleteMovie);
router.put('/:id', upload.single('poster'), updateMovie);
module.exports = router;