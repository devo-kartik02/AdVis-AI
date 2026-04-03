const express = require('express');
const router = express.Router();
const { 
    createAudit, 
    getAudit, 
    getUserAudits, 
    getDashboardStats, 
    getTrendingAudits 
} = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Moved Multer to separate file

/**
 * PAGE 1: Home Page
 * @route GET /api/audits/trending
 * @desc Get recently analyzed trending videos
 */
router.get('/trending', getTrendingAudits);

/**
 * PAGE 4: Analysis Page
 * @route POST /api/audits/
 * @desc Upload file and trigger Python AI Engine
 */
router.post('/', protect, upload.single('file'), createAudit);

/**
 * PAGE 6: Dashboard Page
 * @route GET /api/audits/dashboard/stats
 * @desc Get aggregate analytics (total videos, avg visibility, etc.)
 */
router.get('/dashboard/stats', protect, getDashboardStats);

/**
 * PAGE 6: Dashboard Page (History)
 * @route GET /api/audits/my/history
 * @desc Get current user's past audit records
 */
router.get('/my/history', protect, getUserAudits);

/**
 * PAGE 7: Report Page
 * @route GET /api/audits/:id
 * @desc Get full metrics and LLM verdict for a specific audit
 */
router.get('/:id', getAudit);

module.exports = router;