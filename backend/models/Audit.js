const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  // Link to the User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Kept as false for initial testing
  },
  
  // File & Source Details
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['image', 'video'], required: true },
  category: { type: String, enum: ['cosmetic', 'food'], required: true }, // Added for Page 4
  originalUrl: { type: String, required: true }, 
  
  // Page 1: Home Page Features
  isTrending: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },

  // Process Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorLog: { type: String }, // To help Admin (Page 8) debug failed runs

  // AI Results (Mirrors your processor.py output)
  aiResults: {
    heatmapUrl: String,
    peakFrameUrl: String,
    summary: {
      visibility_score: Number,
      placement: String,
      duration: String,
      recognizability: String,
      avg_confidence: Number,
      distraction_rate: Number,
      brand_text: String,
      audio_text: String,
      llm_verdict: String // Renamed from llm_prompt for clarity
    }
  },

  // Page 7: Report Metadata
  reportUrl: String // For PDF downloads
}, { 
  timestamps: true // Automatically gives us 'createdAt' for Dashboard stats
});

// Indexing for high-speed Dashboard queries
AuditSchema.index({ status: 1 });
AuditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Audit', AuditSchema);