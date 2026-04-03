import React, { useState, useEffect } from 'react';
import { getHistory, compareAudits } from '../api'; // Use API helper
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Trophy, BarChart2 } from 'lucide-react';

const Compare = () => {
  const [history, setHistory] = useState([]);
  const [selectedA, setSelectedA] = useState('');
  const [selectedB, setSelectedB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await getHistory();
        setHistory(data);
      } catch (err) { console.error(err); }
    };
    fetchHistory();
  }, []);

  const handleCompare = async () => {
    if (!selectedA || !selectedB) return;
    setLoading(true);
    try {
      const { data } = await compareAudits({ auditA_id: selectedA, auditB_id: selectedB });
      setResult(data);
    } catch (err) { alert("Comparison Failed"); } 
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto min-h-[80vh]">
        <h1 className="text-4xl font-bold text-center text-white mb-12">A/B Performance Analysis</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-surface p-6 rounded-3xl border border-white/10">
            <label className="text-zinc-400 mb-2 block">Asset A</label>
            <select className="w-full bg-black/50 p-3 rounded-xl text-white border border-white/10" onChange={(e) => setSelectedA(e.target.value)}>
              <option value="">Select Asset...</option>
              {history.map(h => <option key={h._id} value={h._id}>{h.fileName}</option>)}
            </select>
          </div>
          <div className="bg-surface p-6 rounded-3xl border border-white/10">
            <label className="text-zinc-400 mb-2 block">Asset B</label>
            <select className="w-full bg-black/50 p-3 rounded-xl text-white border border-white/10" onChange={(e) => setSelectedB(e.target.value)}>
              <option value="">Select Asset...</option>
              {history.map(h => <option key={h._id} value={h._id}>{h.fileName}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <button onClick={handleCompare} disabled={loading} className="px-8 py-3 bg-primary text-white rounded-full font-bold flex items-center gap-2">
            {loading ? "Analyzing..." : "Run Comparison"} <BarChart2 size={20} />
          </button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-4 text-green-400">
              <Trophy size={32} />
              <h2 className="text-2xl font-bold text-white">Winner: Asset {result.winner}</h2>
            </div>
            <p className="text-zinc-300 text-lg">{result.insight}</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Compare;