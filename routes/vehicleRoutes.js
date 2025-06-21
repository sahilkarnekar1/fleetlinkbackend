const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addVehicle, getAvailableVehicles, getMyAddedVehicles } = require('../controllers/vehicleController');

// Admin only
router.post('/', authMiddleware, addVehicle);
router.get('/available', authMiddleware, getAvailableVehicles);
router.get('/myVehicles', authMiddleware, getMyAddedVehicles);

module.exports = router;
