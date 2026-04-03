const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

// 1. Add deleteUser to your imports
const { 
    getSystemStats, 
    getAllUsers, 
    toggleUserStatus, 
    updateUserCredits,
    deleteAudit,
    deleteUser,
    simulateTopup,
    getPricing,
    updatePricing
} = require('../controllers/adminController');

// Auth gate for all admin endpoints
router.use(protect, adminOnly);

// System Overview
router.get('/stats', getSystemStats); 

// User Management
router.get('/users', getAllUsers);

// 2. Add the missing User Delete route 🎯
// This matches the URL: /api/admin/user/:id
router.delete('/user/:id', deleteUser); 

// Suspend/Activate User
router.patch('/user/:id/suspend', toggleUserStatus); 

// Credit Management
router.patch('/user/:id/credits', updateUserCredits);
router.post('/credits/topup', simulateTopup);

// Pricing Management
router.get('/pricing', getPricing);
router.put('/pricing', updatePricing);

// Audit Management
router.delete('/audit/:id', deleteAudit);

module.exports = router;
