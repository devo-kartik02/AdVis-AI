const express = require('express');
const router = express.Router();
const { createComparison, getComparisons } = require('../controllers/comparisonController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createComparison);
router.get('/', protect, getComparisons);

module.exports = router;