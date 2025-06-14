<<<<<<< HEAD

const express = require('express');
const router = express.Router();
const { upload } = require('../services/uploadService');
const { getAllMovies, getMovieById, createMovie, deleteMovie, updateMovie } = require('../controllers/movieController');

router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', upload.single('poster'), createMovie);
router.delete('/:id', deleteMovie);
router.put('/:id', updateMovie);
=======
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
>>>>>>> 2bc10c14e6a88c5905d9d713f4f3832713cbcb85
module.exports = router;