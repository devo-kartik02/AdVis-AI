const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  page: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['home', 'about'] // Restricts to your 8-page scope
  },
  data: {
    type: Object,
    required: true
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);