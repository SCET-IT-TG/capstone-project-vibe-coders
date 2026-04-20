const express = require('express');
const router = express.Router();
const { getBill, processPayment, getRevenueSummary } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');
router.get('/summary', protect, authorize('admin'), getRevenueSummary);
router.get('/:orderId', protect, getBill);
router.post('/:orderId/pay', protect, authorize('admin', 'staff'), processPayment);
module.exports = router;
