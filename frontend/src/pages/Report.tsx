import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Eye, Target, Zap, Clock, Download, AlertCircle, MapPin, Timer, ScanSearch, Type, Mic, RefreshCw, BarChart3 } from 'lucide-react';
import { api, getAssetUrl } from '../lib/api';
import { Audit } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const Report = () => {
  const { id } = useParams();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchAudit();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id]);

  // Polling logic for "processing" status
  useEffect(() => {
    if (audit?.status === 'processing') {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(fetchAudit, 3000);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [audit?.status]);

  const fetchAudit = async () => {
    try {
      const { data } = await api.get(`/audits/${id}`);
      setAudit(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching audit:', err);
      setError(err.response?.data?.message || 'Failed to load audit');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !audit) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${audit.fileName}_AdVisAI_Audit.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase">Initializing Report...</p>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">{error || 'Audit not found'}</h2>
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-400 font-bold uppercase tracking-widest text-xs">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const aiResults = audit.aiResults;
  const summary = aiResults?.summary;
  const heatmapRaw = aiResults?.heatmapUrl;
  const peakRaw = aiResults?.peakFrameUrl;
  const heatmapUrl = heatmapRaw ? getAssetUrl(heatmapRaw) : '';
  const peakFrameUrl = peakRaw ? getAssetUrl(peakRaw) : '';
  
  const visibilityScore = summary?.visibility_score ?? 0;

  const metrics = [
    { label: 'Distraction Rate', value: `${summary?.distraction_rate ?? 0}%`, icon: Target, color: 'text-red-400' },
    { label: 'Confidence', value: `${summary?.avg_confidence ?? 0}%`, icon: ScanSearch, color: 'text-blue-400' },
    { label: 'Clarity', value: summary?.recognizability || 'N/A', icon: Eye, color: 'text-green-400' },
  ];

  const infoItems = [
    { label: 'Placement', value: summary?.placement || 'N/A', icon: MapPin },
    { label: 'Duration', value: summary?.duration || 'N/A', icon: Timer },
    { label: 'Brand Text', value: summary?.brand_text || 'None detected', icon: Type },
    { label: 'Audio', value: summary?.audio_text || 'N/A', icon: Mic },
  ];

  // Logic to parse the LLM verdict into Signal, Noise, and Recommendations
  // Final AdVis AI Precision Parser
  const verdictText = summary?.llm_verdict || '';
  let signalText = 'Analyzing signals...';
  let noiseText = 'Analyzing noise...';
  let recommendationsText = 'Generating roadmap...';

  if (verdictText) {
    // 1. Initial cleanup of Markdown and normalizing spaces
    const cleanText = verdictText.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

    // 2. Identify the indices of keywords
    const lowerText = cleanText.toLowerCase();
    const noiseIdx = lowerText.indexOf('noise:');
    const recIdx = Math.max(lowerText.indexOf('recommendation'), lowerText.indexOf('recommendations:'));

    // 3. Robust Cleaning Function
    const polish = (str: string) => {
      return str
        .replace(/^[0-9.]+\s*/, '')           // Remove leading "1.", "2." at start
        .replace(/^(signal|noise|recommendations|recommendation|analysis):?\s*/i, '') // Remove keywords
        .replace(/\s+[0-9.]+$/, '')           // Remove trailing " 2." or " 3." at the very end
        .replace(/^s:\s*/i, '')               // Remove that "S:" you're seeing in recommendations
        .trim();
    };

    // 4. Execute the Cuts
    if (noiseIdx !== -1 && recIdx !== -1) {
      signalText = polish(cleanText.substring(0, noiseIdx));
      noiseText = polish(cleanText.substring(noiseIdx, recIdx));
      recommendationsText = polish(cleanText.substring(recIdx));
    } else if (recIdx !== -1) {
      signalText = polish(cleanText.substring(0, recIdx));
      recommendationsText = polish(cleanText.substring(recIdx));
    } else {
      signalText = polish(cleanText);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
          </Link>
          
          {audit.status === 'completed' && (
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              {downloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? 'Generating PDF...' : 'Download Full Audit'}
            </button>
          )}
        </div>

        <div ref={reportRef} className="space-y-8">
          {/* Title Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">{audit.fileName}</h1>
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                  <span>{new Date(audit.createdAt).toLocaleString()}</span>
                  <span className="text-zinc-800">|</span>
                  <span className="uppercase text-blue-500 font-black">{audit.category} AD ANALYSIS</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div className={`w-2 h-2 rounded-full ${audit.status === 'completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                <span className="text-xs font-bold uppercase tracking-widest">{audit.status}</span>
              </div>
            </div>
          </div>

          {audit.status === 'processing' ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-20 text-center">
              <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-8" />
              <h2 className="text-3xl font-bold mb-2">Analysis in Progress</h2>
              <p className="text-zinc-500 max-w-sm mx-auto">AdVis AI is tracking brand assets and calculating gaze saliency maps. Please wait.</p>
            </div>
          ) : (
            <>
              {/* Primary Visualization & Score */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden relative min-h-[400px]">
                  {heatmapUrl ? (
                    <video
                      src={heatmapUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      crossOrigin="anonymous"
                      className="w-full h-full max-h-[600px] object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={peakFrameUrl}
                      className="w-full h-full max-h-[600px] object-contain bg-black"
                      alt="Heatmap"
                    />
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest border border-blue-500/20">
                    AI Saliency Heatmap
                  </div>
                </div>

                <div className="bg-blue-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(37,99,235,0.2)]">
                  <BarChart3 className="w-8 h-8 text-white/40 mb-6" />
                  <span className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Visibility Score</span>
                  <div className="text-9xl font-black text-white tracking-tighter mb-2">
                    {visibilityScore.toFixed(0)}
                  </div>
                  <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {metrics.map((m) => (
                  <div key={m.label} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 hover:border-zinc-800 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{m.label}</span>
                      <m.icon className={`w-5 h-5 ${m.color}`} />
                    </div>
                    <div className="text-4xl font-bold tracking-tight">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Metadata Table */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden">
                <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-900">
                  {infoItems.map((item) => (
                    <div key={item.label} className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <item.icon className="w-3 h-3 text-zinc-600" />
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-300 line-clamp-2 uppercase tracking-tight">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Audit Synthesis Section */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                          AIAudit Engine
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl font-bold tracking-tight">AI Diagnostic Synthesis</h2>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Signal Box */}
                    <div className="bg-black/60 border border-zinc-800 p-6 rounded-2xl group hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                        <Eye className="w-4 h-4" />
                        <span>Signal / Analysis</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed min-h-[100px]">
                        {signalText}
                      </p>
                    </div>

                    {/* Noise Box */}
                    <div className="bg-black/60 border border-zinc-800 p-6 rounded-2xl group hover:border-amber-500/30 transition-colors">
                      <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                        <Target className="w-4 h-4" />
                        <span>Suppressed Noise</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed min-h-[100px]">
                        {noiseText}
                      </p>
                    </div>

                    {/* Recommendations Box */}
                    <div className="bg-black/60 border border-zinc-800 p-6 rounded-2xl group hover:border-blue-500/30 transition-colors">
                      <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                        <Zap className="w-4 h-4" />
                        <span>Recommendations</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-relaxed min-h-[100px]">
                        {recommendationsText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};