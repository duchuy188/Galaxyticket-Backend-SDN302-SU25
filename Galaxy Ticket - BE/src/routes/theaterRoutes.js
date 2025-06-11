const express = require('express');
const router = express.Router();
const {
    getAllTheaters,
    getTheaterById,
    createTheater,
    updateTheater,
    deleteTheater
} = require('../controllers/theaterController');


router.get('/', getAllTheaters);
router.post('/', createTheater);
router.get('/:id', getTheaterById);
router.put('/:id', updateTheater);
router.delete('/:id', deleteTheater);

module.exports = router;
