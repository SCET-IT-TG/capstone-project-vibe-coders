const express = require('express');
const router = express.Router();
const { getReservations, createReservation, updateReservation, deleteReservation } = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');
router.get('/', protect, getReservations);
router.post('/', protect, createReservation);
router.put('/:id', protect, authorize('admin', 'staff'), updateReservation);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteReservation);
module.exports = router;
