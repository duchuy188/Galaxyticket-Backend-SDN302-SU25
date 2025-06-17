const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");
const {
    getAllTheaters,
    getTheaterById,
    createTheater,
    updateTheater,
    deleteTheater
} = require('../controllers/theaterController');


router.get('/', getAllTheaters);

router.get('/:id', getTheaterById);


router.post('/', authenticate, authorizeRoles("staff"), createTheater);


router.put('/:id', authenticate, authorizeRoles("staff"), updateTheater);


router.delete('/:id', authenticate, authorizeRoles("manager","staff"), deleteTheater);

module.exports = router;
