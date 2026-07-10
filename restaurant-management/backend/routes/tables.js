const express = require('express');
const router = express.Router();
const { getTables, updateTableStatus } = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/auth');
router.get('/', protect, getTables);
router.put('/:id', protect, authorize('admin', 'staff'), updateTableStatus);
module.exports = router;
