const mongoose = require('mongoose');
const Content = require('../models/Content');
const Inquiry = require('../models/Inquiry');
const Pricing = require('../models/Pricing');

// ---------------------------------------------------------
// PUBLIC METHODS (Home, About, Contact)
// ---------------------------------------------------------

exports.getPageContent = async (req, res) => {
    try {
        const content = await Content.findOne({ page: req.params.page });
        if (!content) return res.status(404).json({ message: "Content not found" });
        res.json(content.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching page content" });
    }
};

exports.submitInquiry = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        // Verify models are defined before calling
        const inquiry = await Inquiry.create({ name, email, message });
        res.status(201).json({ message: "Inquiry sent successfully", id: inquiry._id });
    } catch (error) {
        res.status(500).json({ message: "Failed to send inquiry" });
    }
};

// ---------------------------------------------------------
// ADMIN METHODS (Page 8)
// ---------------------------------------------------------

exports.updatePageContent = async (req, res) => {
    try {
        const { data } = req.body;
        const updated = await Content.findOneAndUpdate(
            { page: req.params.page },
            { data },
            { upsert: true, new: true }
        );
        res.json({ message: "Content updated successfully", updated });
    } catch (error) {
        res.status(500).json({ message: "Admin content update failed" });
    }
};

// Public Pricing
exports.getPricingPublic = async (req, res) => {
    try {
        let doc = await Pricing.findOne();
        if (!doc) doc = await Pricing.create({});
        res.json({
            starter: { price: doc.starterPrice, credits: doc.starterCredits },
            pro: { price: doc.proPrice, credits: doc.proCredits },
            enterprise: { price: doc.enterprisePrice, credits: doc.enterpriseCredits },
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching pricing" });
    }
};
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: "Error fetching inquiries" });
    }
};

exports.updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['new', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const updated = await Inquiry.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.json({ message: 'Status updated', inquiry: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status' });
    }
};
