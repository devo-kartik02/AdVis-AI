const Audit = require('../models/Audit');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

const AI_ENGINE_PATH = path.join(__dirname, '..', '..', 'ai_engine'); 

// Normalize any file path or absolute URL to a web URL under /public/*
const toPublicUrl = (p) => {
    if (!p) return null;
    let s = String(p).replace(/\\/g, '/');
    // If already an absolute URL, keep as-is to work in dev/prod across ports
    if (/^https?:\/\//i.test(s)) return s;
    const idx = s.toLowerCase().lastIndexOf('/public/');
    if (idx !== -1) {
        s = s.slice(idx);
    } else if (!s.startsWith('/public/')) {
        if (s.startsWith('public/')) s = '/' + s;
        else s = '/public/' + s.replace(/^\/+/, '');
    }
    return s;
};

const findFfmpeg = () => {
    const candidates = [
        path.join(AI_ENGINE_PATH, 'venv', 'Lib', 'site-packages', 'imageio_ffmpeg', 'binaries', 'ffmpeg.exe'),
        path.join(AI_ENGINE_PATH, 'venv', 'lib', 'python3.11', 'site-packages', 'imageio_ffmpeg', 'binaries', 'ffmpeg'),
        path.resolve(__dirname, '..', '..', 'venv', 'Lib', 'site-packages', 'imageio_ffmpeg', 'binaries', 'ffmpeg.exe'),
        path.resolve(__dirname, '..', '..', 'venv', 'lib', 'python3.11', 'site-packages', 'imageio_ffmpeg', 'binaries', 'ffmpeg'),
        'ffmpeg'
    ];
    for (const p of candidates) {
        try {
            if (p === 'ffmpeg') return p;
            if (fs.existsSync(p)) return p;
        } catch {}
    }
    return null;
};

// Convert a possibly non-browser-friendly MP4 to H.264 MP4
const convertToH264 = (inputPath) => new Promise((resolve) => {
    try {
        if (!inputPath || !fs.existsSync(inputPath)) return resolve(null);
        const ffmpeg = findFfmpeg();
        if (!ffmpeg) return resolve(null);

        const dir = path.dirname(inputPath);
        const base = path.basename(inputPath, path.extname(inputPath));
        const outPath = path.join(dir, `${base}_h264.mp4`);

        const args = ['-y', '-i', inputPath, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', outPath];
        const proc = spawn(ffmpeg, args);
        proc.on('close', (code) => {
            if (code === 0 && fs.existsSync(outPath)) {
                resolve(outPath);
            } else {
                resolve(null);
            }
        });
        proc.on('error', () => resolve(null));
    } catch {
        resolve(null);
    }
});

// ---------------------------------------------------------
// PAGE 4: ANALYSIS - Create Audit
// ---------------------------------------------------------
const createAudit = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user ? req.user.id : null; 

        if (userId) {
            const u = await User.findById(userId);
            if (!u) return res.status(401).json({ message: 'Unauthorized' });
            if (u.role === 'admin') {
                return res.status(403).json({ message: 'Admins cannot create audits' });
            }
            if (u.credits <= 0) return res.status(403).json({ message: 'Insufficient credits' });
            await User.findByIdAndUpdate(userId, { $inc: { credits: -1, totalAudits: 1 } });
        }

        const newAudit = await Audit.create({
            user: userId, 
            fileName: req.file.originalname,
            fileType: req.file.mimetype.startsWith('image') ? 'image' : 'video',
            category: req.body.category || 'cosmetic',
            originalUrl: `/public/uploads/${req.file.filename}`,
            status: 'processing',
        });

        // Respond immediately to allow UI to show "Processing" spinner
        res.status(201).json(newAudit);

        // Run Python logic in background
        runPythonAnalysis(newAudit._id, req.file.path, req.body.category || 'cosmetic');

    } catch (error) {
        console.error("Analysis Trigger Error:", error);
        res.status(500).json({ message: 'Server Error during analysis initiation' });
    }
};

// ---------------------------------------------------------
// PAGE 6: DASHBOARD - Aggregated Stats
// ---------------------------------------------------------
const getDashboardStats = async (req, res) => {
    try {
        const stats = await Audit.aggregate([
            { $match: { user: req.user._id } }, // Only current user stats
            {
                $group: {
                    _id: null,
                    totalAudits: { $sum: 1 },
                    avgVisibility: { $avg: "$aiResults.summary.visibility_score" },
                    videoCount: { $sum: { $cond: [{ $eq: ["$fileType", "video"] }, 1, 0] } },
                    imageCount: { $sum: { $cond: [{ $eq: ["$fileType", "image"] }, 1, 0] } }
                }
            }
        ]);
        res.json(stats[0] || { totalAudits: 0, avgVisibility: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

// ---------------------------------------------------------
// PAGE 1: HOME - Trending / Recent
// ---------------------------------------------------------
const getTrendingAudits = async (req, res) => {
    try {
        // Fetch 6 most recent successful audits to showcase
        const trending = await Audit.find({ status: 'completed' })
            .sort({ createdAt: -1 })
            .limit(6)
            .select('fileName aiResults originalUrl');
        res.json(trending);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching trending data' });
    }
};

// ---------------------------------------------------------
// PYTHON BRIDGE LOGIC (Asynchronous)
// ---------------------------------------------------------
const runPythonAnalysis = (auditId, filePath, category) => {
    const scriptPath = path.join(AI_ENGINE_PATH, 'processor.py');
    
    // Path to your specific venv (Ensure this is correct for your system)
    const venvPython = path.join(__dirname, '..', '..', 'ai_engine', 'venv', 'Scripts', 'python.exe');
    const pythonExe = fs.existsSync(venvPython) ? venvPython : 'python';

    const pythonProcess = spawn(pythonExe, [scriptPath, filePath, category], { cwd: AI_ENGINE_PATH });
    
    let dataString = '';
    let errString = '';

    pythonProcess.stdout.on('data', (data) => dataString += data.toString());
    pythonProcess.stderr.on('data', (data) => errString += data.toString());

    pythonProcess.on('close', async (code) => {
        if (code !== 0) {
            console.error(`❌ Python Error Code ${code}: ${errString}`);
            return await Audit.findByIdAndUpdate(auditId, { status: 'failed' });
        }
        
        try {
            const aiData = JSON.parse(dataString.substring(dataString.indexOf('{'), dataString.lastIndexOf('}') + 1));
            const heatmapRaw = aiData.heatmap_url || aiData.heatmapVideo || aiData.output_video || aiData.heatmap_path;
            const peakRaw = aiData.peak_frame || aiData.heatmap_image || aiData.peak_frame_url;
            let heatmapUrl = toPublicUrl(heatmapRaw);
            const peakFrameUrl = toPublicUrl(peakRaw);

            // Attempt to re-encode to browser-friendly H.264 if source may be incompatible
            // Map URL /public/uploads/<file> -> filesystem path in ai_engine/public/uploads/<file>
            let inputFsPath = null;
            if (heatmapUrl && /^https?:\/\//i.test(heatmapUrl)) {
                const idx = heatmapUrl.toLowerCase().lastIndexOf('/public/uploads/');
                if (idx !== -1) {
                    const fname = heatmapUrl.slice(idx + '/public/uploads/'.length);
                    inputFsPath = path.join(AI_ENGINE_PATH, 'public', 'uploads', fname);
                }
            } else if (heatmapUrl && heatmapUrl.startsWith('/public/uploads/')) {
                inputFsPath = path.join(AI_ENGINE_PATH, heatmapUrl.replace(/^\//, ''));
            } else if (heatmapRaw && heatmapRaw.toString().toLowerCase().includes('\\public\\uploads\\')) {
                // Windows path coming from engine
                inputFsPath = heatmapRaw;
            }

            if (inputFsPath && fs.existsSync(inputFsPath)) {
                const converted = await convertToH264(inputFsPath);
                if (converted && fs.existsSync(converted)) {
                    const outName = path.basename(converted);
                    heatmapUrl = `/public/uploads/${outName}`;
                }
            }

            await Audit.findByIdAndUpdate(auditId, {
                status: 'completed',
                aiResults: {
                    heatmapUrl,
                    peakFrameUrl,
                    summary: aiData.summary
                }
            });
            console.log(`✅ Audit ${auditId} Processed Successfully`);
        } catch (err) {
            console.error('JSON Parse Error:', err);
            await Audit.findByIdAndUpdate(auditId, { status: 'failed' });
        }
    });
};

// ---------------------------------------------------------
// PAGE 7: REPORT & Page 6: HISTORY
// ---------------------------------------------------------
const getAudit = async (req, res) => {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: 'Audit not found' });
    if (audit.aiResults) {
        // Normalize and prefer H.264 variant if present
        let heatUrl = toPublicUrl(audit.aiResults.heatmapUrl);
        if (heatUrl && heatUrl.startsWith('/public/uploads/')) {
            const base = heatUrl.replace(/\.mp4$/i, '').replace(/_h264$/i, '');
            const h264Name = `${base}_h264.mp4`;
            const h264Fs = path.join(AI_ENGINE_PATH, h264Name.replace(/^\//, ''));
            if (fs.existsSync(h264Fs)) {
                heatUrl = h264Name;
            } else {
                // Attempt lazy conversion for existing records
                const origFs = path.join(AI_ENGINE_PATH, heatUrl.replace(/^\//, ''));
                try {
                    const converted = await convertToH264(origFs);
                    if (converted && fs.existsSync(converted)) {
                        heatUrl = `/public/uploads/${path.basename(converted)}`;
                    }
                } catch {}
            }
        }
        audit.aiResults.heatmapUrl = heatUrl;
        audit.aiResults.peakFrameUrl = toPublicUrl(audit.aiResults.peakFrameUrl);
    }
    res.json(audit);
};

const getUserAudits = async (req, res) => {
    try {
        const audits = await Audit.find({ user: req.user.id }).sort({ createdAt: -1 });
        const normalized = audits.map(a => {
            if (a.aiResults) {
                a.aiResults.heatmapUrl = toPublicUrl(a.aiResults.heatmapUrl);
                a.aiResults.peakFrameUrl = toPublicUrl(a.aiResults.peakFrameUrl);
            }
            return a;
        });
        res.json(normalized);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { 
    createAudit, 
    getAudit, 
    getUserAudits, 
    getDashboardStats, 
    getTrendingAudits 
};
