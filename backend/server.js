const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// 1. Initialization
dotenv.config();
connectDB();

const app = express();

// 2. Security & Parsing Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AI_PUBLIC_PATH = path.resolve(__dirname, '..', 'ai_engine', 'public');
const BACKEND_PUBLIC_PATH = path.resolve(__dirname, 'public');

app.use('/public', express.static(AI_PUBLIC_PATH));

if (fs.existsSync(BACKEND_PUBLIC_PATH)) {
  app.use('/public', express.static(BACKEND_PUBLIC_PATH));
}

// 4. 🔗 Route Index (Connecting your 8 Pages)
// Note: We use a modular approach so server.js stays small
app.use('/api/auth', require('./routes/authRoutes'));       // Pages 8 (Login)
app.use('/api/audits', require('./routes/auditRoutes'));    // Pages 1, 4, 6, 7
app.use('/api/compare', require('./routes/comparisonRoutes')); // Page 5
app.use('/api/content', require('./routes/contentRoutes')); // Pages 1, 2, 3 (About/Contact)
app.use('/api/admin', require('./routes/adminRoutes'));     // Page 8 (Management)

// Lightweight health endpoint for uptime checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// 5. 🛠️ 404 Handler (For undefined routes)
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// 6. 🔥 Global Error Handler (Centralized)
// This catches async errors and Python bridge crashes
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.stack);
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AdVis AI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
