const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  auditA: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  auditB: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  winner: { type: String, enum: ['A', 'B', 'Tie'] },
  delta: {
    visibility: Number,
    distraction: Number
  },
  insight: String // The 50-word AI generated comparison text
}, { timestamps: true });

module.exports = mongoose.model('Comparison', comparisonSchema);