const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  
  // Professional Role-Based Access
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  // Page 6/8: Usage Tracking
  credits: { type: Number, default: 5 },
  totalAudits: { type: Number, default: 0 },
  
  // Page 8: Admin Security
  lastLogin: { type: Date },
  isSuspended: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);