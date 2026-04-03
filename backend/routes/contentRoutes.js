const express = require('express');
const router = express.Router();
const { 
    getPageContent, 
    submitInquiry, 
    updatePageContent, 
    getInquiries,
    updateInquiryStatus,
    getPricingPublic
} = require('../controllers/contentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Routes
router.get('/:page', getPageContent);
router.post('/inquiry', submitInquiry);
router.get('/pricing/public', getPricingPublic);

// Admin Routes
router.put('/:page', protect, adminOnly, updatePageContent);
router.get('/admin/inquiries', protect, adminOnly, getInquiries);
router.patch('/admin/inquiries/:id/status', protect, adminOnly, updateInquiryStatus);

module.exports = router;
