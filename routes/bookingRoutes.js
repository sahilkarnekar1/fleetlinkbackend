const express = require('express');
const router = express.Router();
const { bookVehicle, getMyBookings, deleteMyBooking } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookVehicle);
router.get('/my', authMiddleware, getMyBookings); // ✅ New route
router.delete('/deleteMyBooking/:bookingId', authMiddleware, deleteMyBooking); // ✅ New route


module.exports = router;
