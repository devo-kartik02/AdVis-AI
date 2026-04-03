import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Play, ArrowRight, AlertCircle, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { Audit, Comparison as ComparisonType } from '../types';
import { useAuth } from '../context/AuthContext';

export const Comparison = () => {
  const { user } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<ComparisonType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const { data } = await api.get('/audits/my/history');
      setAudits(data.filter((a: Audit) => a.status === 'completed'));
    } catch (err: any) {
      console.error('Error fetching audits:', err);
      setError(err.response?.data?.message || 'Failed to load audit history');
    }
  };

  const getScore = (audit: Audit) => audit.aiResults?.summary?.visibility_score ?? 0;

  const handleCompare = async () => {
    if (!selectedA || !selectedB || !user) return;

    setComparing(true);
    setError(null);

    try {
      const { data } = await api.post('/compare', {
        auditA_id: selectedA,
        auditB_id: selectedB,
      });
      setResult(data);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err.response?.data?.message || 'AI comparison failed. Please try again.');
    } finally {
      setComparing(false);
    }
  };

  const auditA = audits.find(a => a._id === selectedA);
  const auditB = audits.find(a => a._id === selectedB);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };
  const handleSelectA = (value: string) => {
    setSelectedA(value);
    const nextA = audits.find(a => a._id === value);
    if (nextA && selectedB) {
      const b = audits.find(a => a._id === selectedB);
      if (b && b.category !== nextA.category) {
        setSelectedB('');
        showToast('Category mismatch: Comparison restricted to identical asset classes.');
      }
    }
  };
  const handleSelectB = (value: string) => {
    if (!value) { setSelectedB(''); return; }
    const a = audits.find(x => x._id === selectedA);
    const b = audits.find(x => x._id === value);
    if (a && b && a.category !== b.category) {
      showToast('Category mismatch: Comparison restricted to identical asset classes.');
      return;
    }
    setSelectedB(value);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {toast && (
          <div className="fixed top-6 right-6 z-50">
            <div className="px-4 py-3 rounded-xl bg-amber-500 text-black text-xs font-black uppercase tracking-[0.2em] shadow-lg">
              {toast}
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            Performance Benchmarking
          </motion.div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tighter">
            α/β <span className="text-blue-500">Intelligence</span>
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto font-medium">
            Side-by-side creative auditing. Select two processed assets to identify the statistically superior version.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-zinc-500 hover:text-white transition-colors">
              <Minus className="w-4 h-4" />
            </button>
          </div>
        )}

        {!result ? (
          <>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Selector Card A */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -ml-16 -mt-16" />
                <h2 className="text-xl font-bold mb-6 text-zinc-300">Variant α</h2>
                <select
                  value={selectedA}
                  onChange={(e) => handleSelectA(e.target.value)}
                  className="w-full px-4 py-4 bg-black border border-zinc-800 rounded-xl text-sm focus:ring-2 ring-blue-500/20 transition-all outline-none mb-8"
                >
                  <option value="">Choose first asset...</option>
                  {audits.filter(a => a._id !== selectedB).map(audit => (
                    <option key={audit._id} value={audit._id}>{audit.fileName}</option>
                  ))}
                </select>

                {auditA && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                      <img src={auditA.aiResults?.peakFrameUrl} alt="Thumbnail A" className="w-full h-full object-cover opacity-60" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Base Visibility</span>
                      <span className="text-3xl font-black text-blue-400">{getScore(auditA).toFixed(0)}%</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Selector Card B */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                <h2 className="text-xl font-bold mb-6 text-zinc-300">Variant β</h2>
                <select
                  value={selectedB}
                  onChange={(e) => handleSelectB(e.target.value)}
                  className="w-full px-4 py-4 bg-black border border-zinc-800 rounded-xl text-sm focus:ring-2 ring-blue-500/20 transition-all outline-none mb-8"
                >
                  <option value="">Choose second asset...</option>
                  {audits.filter(a => a._id !== selectedA && (!auditA || a.category === auditA.category)).map(audit => (
                    <option key={audit._id} value={audit._id}>{audit.fileName}</option>
                  ))}
                </select>

                {auditB && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                      <img src={auditB.aiResults?.peakFrameUrl} alt="Thumbnail B" className="w-full h-full object-cover opacity-60" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Base Visibility</span>
                      <span className="text-3xl font-black text-blue-400">{getScore(auditB).toFixed(0)}%</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            <div className="text-center">
              <button
                onClick={handleCompare}
                disabled={!selectedA || !selectedB || comparing}
                className="px-12 py-4 bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-blue-600 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-30 flex items-center gap-3 mx-auto"
              >
                {comparing ? 'Processing...' : 'Execute Comparison'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            {/* Winner Spotlight */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-[40px] p-12 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
               <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-6 fill-yellow-500/20" />
               <h2 className="text-5xl font-black tracking-tighter mb-4">
                 {result.winner === 'Tie' ? "STALEMATE" : `VARIANT ${result.winner} IS SUPERIOR`}
               </h2>
               <div className="max-w-2xl mx-auto p-6 bg-black/40 border border-zinc-800 rounded-2xl">
                 <p className="text-zinc-400 text-sm leading-relaxed italic">"{result.insight}"</p>
               </div>
            </div>

            {/* Delta Analysis Table */}
            <div className="grid md:grid-cols-2 gap-8">
               {/* Version A Result */}
               <div className={`p-8 rounded-3xl border ${result.winner === 'A' ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-zinc-900 bg-zinc-950/50'}`}>
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Variant Alpha</span>
                    {result.winner === 'A' && <span className="px-2 py-1 bg-blue-500 text-[8px] font-black rounded uppercase">Winner</span>}
                  </div>
                  <div className="text-7xl font-black mb-8">{getScore(auditA!).toFixed(0)}%</div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 uppercase font-bold">Distraction</span>
                      <span className="font-mono">{auditA?.aiResults?.summary?.distraction_rate}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 uppercase font-bold">Placement</span>
                      <span className="font-mono text-blue-400">{auditA?.aiResults?.summary?.placement}</span>
                    </div>
                  </div>
               </div>

               {/* Version B Result */}
               <div className={`p-8 rounded-3xl border ${result.winner === 'B' ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_40px_rgba(59,130,246,0.1)]' : 'border-zinc-900 bg-zinc-950/50'}`}>
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Variant Beta</span>
                    {result.winner === 'B' && <span className="px-2 py-1 bg-blue-500 text-[8px] font-black rounded uppercase">Winner</span>}
                  </div>
                  <div className="text-7xl font-black mb-8">{getScore(auditB!).toFixed(0)}%</div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 uppercase font-bold">Distraction</span>
                      <span className="font-mono">{auditB?.aiResults?.summary?.distraction_rate}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 uppercase font-bold">Placement</span>
                      <span className="font-mono text-blue-400">{auditB?.aiResults?.summary?.placement}</span>
                    </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={() => setResult(null)}
              className="w-full py-4 rounded-2xl bg-zinc-900 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Reset Comparison
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
