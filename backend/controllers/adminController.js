const User = require('../models/User');
const Audit = require('../models/Audit');
const Pricing = require('../models/Pricing');

/**
 * PAGE 8: ADMIN DASHBOARD - System-wide Analytics
 * @route GET /api/admin/stats
 */
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAudits = await Audit.countDocuments();
        
        const auditBreakdown = await Audit.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const recentAudits = await Audit.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email credits');

        const categoryBreakdown = await Audit.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const visibilityBuckets = await Audit.aggregate([
            { $match: { "aiResults.summary.visibility_score": { $ne: null } } },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lt: ["$aiResults.summary.visibility_score", 40] }, then: "Low" },
                                { case: { $lt: ["$aiResults.summary.visibility_score", 70] }, then: "Medium" }
                            ],
                            default: "High"
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalUsers,
            totalAudits,
            auditBreakdown,
            recentAudits,
            categoryBreakdown,
            visibilityBuckets,
            serverUptime: process.uptime(),
            memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching admin stats' });
    }
};

/**
 * PAGE 8: USER MANAGEMENT - Full User List
 * @route GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching users' });
    }
};

/**
 * PAGE 8: USER CONTROL - Toggle Suspension (Ban)
 * @route PATCH /api/admin/user/:id/suspend
 */
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isSuspended = !user.isSuspended;
        await user.save();

        res.json({ message: `User ${user.isSuspended ? 'suspended' : 'activated'}`, status: user.isSuspended });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during status toggle' });
    }
};

/**
 * PAGE 8: CREDIT MANAGEMENT - Update User Credits
 * @route PATCH /api/admin/user/:id/credits
 */
const updateUserCredits = async (req, res) => {
    try {
        const { credits } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { credits }, { new: true });
        res.json({ message: 'Credits updated', credits: user.credits });
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating credits' });
    }
};

/**
 * PAGE 8: BILLING - Simulated UPI-style credit top-up
 * @route POST /api/admin/credits/topup
 * @access Admin
 */
const simulateTopup = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const creditsToAdd = Number(amount) || 0;
        if (!userId || creditsToAdd <= 0) {
            return res.status(400).json({ message: 'Invalid top-up request' });
        }
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: { credits: creditsToAdd } },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Credits topped up', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error processing top-up' });
    }
};

/**
 * PAGE 8: AUDIT MANAGEMENT - Delete heavy video/heatmap files
 * @route DELETE /api/admin/audit/:id
 */
const deleteAudit = async (req, res) => {
    try {
        const audit = await Audit.findByIdAndDelete(req.params.id);
        // Add logic here to delete physical files from 'public/uploads' if needed
        res.json({ message: 'Audit record deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * PAGE 8: USER MANAGEMENT - Delete User
 * @route DELETE /api/admin/user/:id
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User account and access revoked successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: 'Server Error during user deletion' });
    }
};

module.exports = { 
    getSystemStats, 
    getAllUsers, 
    toggleUserStatus, 
    updateUserCredits, 
    deleteAudit,
    deleteUser,
    simulateTopup
};

/**
 * ADMIN: Pricing - Get current pricing
 * @route GET /api/admin/pricing
 */
module.exports.getPricing = async (req, res) => {
    try {
        let doc = await Pricing.findOne();
        if (!doc) doc = await Pricing.create({});
        res.json(doc);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching pricing' });
    }
};

/**
 * ADMIN: Pricing - Update pricing
 * @route PUT /api/admin/pricing
 */
module.exports.updatePricing = async (req, res) => {
    try {
        const payload = req.body || {};
        const update = {
            starterPrice: Number(payload.starterPrice ?? 499),
            starterCredits: Number(payload.starterCredits ?? 10),
            proPrice: Number(payload.proPrice ?? 1999),
            proCredits: Number(payload.proCredits ?? 75),
            enterprisePrice: Number(payload.enterprisePrice ?? 0),
            enterpriseCredits: Number(payload.enterpriseCredits ?? 300),
        };
        const doc = await Pricing.findOneAndUpdate({}, update, { new: true, upsert: true });
        res.json({ message: 'Pricing updated', pricing: doc });
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating pricing' });
    }
};
