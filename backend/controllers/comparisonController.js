const Comparison = require('../models/Comparison');
const Audit = require('../models/Audit');

// 🧠 UPGRADED LOGIC AGENT
const generateSmartInsight = (a, b) => {
    const visA = a.aiResults.summary.visibility_score;
    const visB = b.aiResults.summary.visibility_score;
    const distA = a.aiResults.summary.distraction_rate;
    const distB = b.aiResults.summary.distraction_rate;
    
    let winner = visB > visA ? "B" : "A";
    let loser = winner === "B" ? "A" : "B";
    const gap = Math.abs(visB - visA);
    
    let reasons = [];

    // 1. Visibility & Placement
    if (gap > 15) {
        reasons.push(`superior ${winner === "B" ? b.aiResults.summary.placement : a.aiResults.summary.placement} positioning`);
    }

    // 2. Brand Clarity (OCR Check)
    const brandA = a.aiResults.summary.brand_text !== "None";
    const brandB = b.aiResults.summary.brand_text !== "None";
    if (winner === "B" && brandB && !brandA) reasons.push("clearer brand text recognition");
    if (winner === "A" && brandA && !brandB) reasons.push("clearer brand text recognition");

    // 3. Distraction (Vampire Effect)
    if (Math.abs(distA - distB) > 10) {
        reasons.push(`significantly lower distraction rates (${winner === "A" ? distA : distB}%)`);
    }

    const mainReason = reasons.length > 0 ? reasons.join(" and ") : "more consistent visual presence";
    
    return `Asset ${winner} is the strategic winner (+${gap.toFixed(1)} pts). It offers ${mainReason}, which directly correlates to higher brand recall compared to Asset ${loser}.`;
};

// @desc Compare two audits
exports.createComparison = async (req, res) => {
    try {
        if (req.user?.role === 'admin') {
            return res.status(403).json({ message: 'Admins cannot perform comparisons' });
        }
        const { auditA_id, auditB_id } = req.body;

        const [auditA, auditB] = await Promise.all([
            Audit.findById(auditA_id),
            Audit.findById(auditB_id)
        ]);

        if (!auditA || !auditB) return res.status(404).json({ message: 'Audit records not found' });
        
        if (auditA.status !== 'completed' || auditB.status !== 'completed') {
            return res.status(400).json({ message: 'Only completed audits can be compared.' });
        }

        const insight = generateSmartInsight(auditA, auditB);

        const comparison = await Comparison.create({
            user: req.user.id,
            auditA: auditA_id,
            auditB: auditB_id,
            winner: auditA.aiResults.summary.visibility_score > auditB.aiResults.summary.visibility_score ? 'A' : 'B',
            delta: {
                visibility: (auditA.aiResults.summary.visibility_score - auditB.aiResults.summary.visibility_score).toFixed(1),
                distraction: (auditA.aiResults.summary.distraction_rate - auditB.aiResults.summary.distraction_rate).toFixed(1)
            },
            insight
        });

        res.status(201).json(comparison);
    } catch (error) {
        res.status(500).json({ message: 'Comparison engine failed', error: error.message });
    }
};

exports.getComparisons = async (req, res) => {
    try {
        if (req.user?.role === 'admin') {
            return res.status(403).json({ message: 'Admins cannot view user comparisons' });
        }
        const comparisons = await Comparison.find({ user: req.user.id })
            .populate('auditA', 'fileName aiResults.summary')
            .populate('auditB', 'fileName aiResults.summary')
            .sort({ createdAt: -1 });
        res.json(comparisons);
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed' });
    }
};
