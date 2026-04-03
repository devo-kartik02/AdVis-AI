const { runAIEngine } = require('./utils/pythonBridge');
const path = require('path');

// Test with a sample image/video already in your folders
const testFile = path.resolve(__dirname, '../ai_engine/public/uploads/1769864609792-WhatsApp_Video_2026-01-31_at_18.04.19_heatmap.mp4');

runAIEngine(testFile, 'cosmetic')
    .then(data => console.log("✅ Bridge Working! AI Output:", data))
    .catch(err => console.error("❌ Bridge Failed:", err.message));
