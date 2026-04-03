const mongoose = require('mongoose');

const PricingSchema = new mongoose.Schema({
  starterPrice: { type: Number, default: 499 },
  starterCredits: { type: Number, default: 10 },
  proPrice: { type: Number, default: 1999 },
  proCredits: { type: Number, default: 75 },
  enterprisePrice: { type: Number, default: 0 }, 
  enterpriseCredits: { type: Number, default: 300 },
}, { timestamps: true });

module.exports = mongoose.model('Pricing', PricingSchema);
