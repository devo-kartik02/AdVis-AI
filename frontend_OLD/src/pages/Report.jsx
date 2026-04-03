import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { checkAuditStatus, getAssetUrl } from '../api'; // Use the named exports we fixed
import { ArrowLeft, CheckCircle2, AlertTriangle, Download, Eye, Zap } from 'lucide-react';

const Report = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchData = async () => {
      try {
        const result = await checkAuditStatus(id);
        setData(result.data); // Axios response wrapper
        
        if (result.data.status === 'completed' || result.data.status === 'failed') {
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Poll Error:", err);
        setLoading(false);
      }
    };

    fetchData();
    interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading || (data && data.status === 'processing')) return (
    <Layout>
      <div className="flex h-[80vh] items-center justify-center text-white flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="animate-pulse text-zinc-400">Analyzing heatmaps...</p>
      </div>
    </Layout>
  );

  if (!data || data.status === 'failed') return (
    <Layout>
      <div className="flex h-[50vh] flex-col items-center justify-center text-red-400">
        <AlertTriangle size={48} className="mb-4" />
        <h2 className="text-2xl font-bold">Analysis Failed</h2>
        <Link to="/upload" className="mt-6 px-6 py-2 bg-white/10 rounded-full text-white">Try Again</Link>
      </div>
    </Layout>
  );

  const summary = data.aiResults?.summary || {};

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
             <Link to="/upload" className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white"><ArrowLeft size={20} /></Link>
             <h1 className="text-3xl font-bold text-white">{data.fileName}</h1>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-white flex items-center gap-2 hover:bg-blue-600 transition-colors">
            <Download size={18} /> Export
          </button>
        </header>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* VIDEO PLAYER (Left) */}
          <div className="md:col-span-8 bg-black rounded-3xl overflow-hidden border border-white/10 relative min-h-[400px] flex items-center justify-center">
             {data.aiResults?.heatmapUrl ? (
               <video 
                 src={getAssetUrl(data.aiResults.heatmapUrl)} 
                 controls 
                 className="w-full h-full max-h-[600px] object-contain" 
               />
             ) : (
               <div className="text-zinc-500">Video not found</div>
             )}
          </div>

          {/* STATS (Right) */}
          <div className="md:col-span-4 space-y-6">
             {/* Visibility Card */}
             <div className="p-6 bg-surface border border-white/10 rounded-2xl">
               <div className="flex items-center gap-2 text-zinc-400 mb-2"><Eye size={18}/> Visibility Score</div>
               <div className={`text-4xl font-bold ${summary.visibility_score > 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                 {summary.visibility_score ? summary.visibility_score.toFixed(1) : 0}
               </div>
             </div>
             
             {/* Distraction Card */}
             <div className="p-6 bg-surface border border-white/10 rounded-2xl">
               <div className="flex items-center gap-2 text-zinc-400 mb-2"><Zap size={18}/> Distraction Rate</div>
               <div className={`text-4xl font-bold ${summary.distraction_rate < 15 ? 'text-green-400' : 'text-red-400'}`}>
                 {summary.distraction_rate ? summary.distraction_rate.toFixed(1) : 0}%
               </div>
             </div>

             {/* AI Verdict */}
             <div className="p-6 bg-gradient-to-br from-blue-900/20 to-surface border border-white/10 rounded-2xl">
               <div className="flex items-center gap-2 text-primary mb-3"><CheckCircle2 size={18}/> Strategic Verdict</div>
               <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
                 {summary.llm_prompt?.split("TASK:")[1] || "Analysis complete."}
               </p>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Report;