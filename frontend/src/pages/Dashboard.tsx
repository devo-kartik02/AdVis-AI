import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Upload, Play, TrendingUp, Clock, FileVideo, AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, uploadVideo } from '../lib/api';
import { Audit } from '../types';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

export const Dashboard = () => {
  const { user, refresh } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  // Uploads are restricted to Neural Lab only
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial Fetch
  useEffect(() => {
    fetchAudits();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Polling logic: Re-fetch every 3s if any audit is "processing"
  useEffect(() => {
    const hasProcessing = audits.some(a => a.status === 'processing');
    if (hasProcessing) {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(fetchAudits, 3000);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  }, [audits]);

  const fetchAudits = async () => {
    try {
      const { data } = await api.get('/audits/my/history');
      setAudits(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching audits:', err);
      if (!audits.length) {
        setError(err.response?.data?.message || 'Failed to connect to AI server');
      }
    } finally {
      setLoading(false);
    }
  };

  // Uploads moved to Neural Lab; no direct uploads here

  const completedAudits = audits.filter(a => a.status === 'completed');
  const trendData = completedAudits
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(a => ({
      date: new Date(a.createdAt).toLocaleDateString(),
      visibility: a.aiResults?.summary?.visibility_score || 0,
      distraction: a.aiResults?.summary?.distraction_rate || 0,
      confidence: a.aiResults?.summary?.avg_confidence || 0
    }));
  const statusCounts = audits.reduce((acc: any, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value: value as number }));
  const pieColors = ['#60A5FA', '#34D399', '#F87171', '#A78BFA'];

  const categoryCounts = audits.reduce((acc: any, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name: name === 'food' ? 'Food & Beverage' : 'Cosmetics',
    value: value as number
  }));

  const stats = [
    {
      label: 'Total Reports',
      value: audits.length,
      icon: FileVideo,
      color: 'text-blue-400',
    },
    {
      label: 'Avg Visibility',
      value: completedAudits.length > 0
        ? `${Math.round(completedAudits.reduce((acc, a) => acc + (a.aiResults?.summary?.visibility_score || 0), 0) / completedAudits.length)}%`
        : '0%',
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      label: 'Active Tasks',
      value: audits.filter(a => a.status === 'processing').length,
      icon: RefreshCw,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">
              Control <span className="text-blue-500">Center</span>
            </h1>
            <p className="text-zinc-400">Welcome, {user?.name}. Manage your visual audit pipeline.</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-2 rounded-2xl">
            <div className="px-4 py-2 bg-blue-500/10 rounded-xl">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Credits: {user?.credits}</span>
            </div>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm flex-1">{error}</span>
            <button onClick={fetchAudits} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4 text-red-400" />
            </button>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 hover:border-zinc-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4">Visibility Trend</div>
            <div className="h-64">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: 16 }}
                      labelStyle={{ color: '#e5e7eb' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="visibility" name="Visibility" stroke="#60A5FA" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="distraction" name="Distraction" stroke="#F97373" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#34D399" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-600">
                  No completed audits to chart yet
                </div>
              )}
            </div>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4">Task Distribution</div>
            <div className="h-64 flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: 16 }}
                      labelStyle={{ color: '#e5e7eb' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-zinc-600">No tasks to display</div>
              )}
            </div>
          </div>
        </div>

        {/* Uploads moved to Neural Lab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 mb-16 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Neural Lab</h2>
            <p className="text-zinc-500 mb-6 max-w-sm">Uploads are available in the Neural Lab.</p>
            <Link to="/analysis" className="px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors">
              Launch Neural Lab
            </Link>
          </div>
        </motion.div>

        {/* History Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recent Pipeline</h2>
            <button onClick={fetchAudits} className="text-xs font-bold text-zinc-500 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center gap-2">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="aspect-video bg-zinc-900/50 animate-pulse rounded-2xl border border-zinc-800" />)}
            </div>
          ) : audits.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-20 text-center">
              <FileVideo className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No reports found in your pipeline history.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audits.map((audit, idx) => (
                <motion.div
                  key={audit._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link to={`/report/${audit._id}`} className="group block h-full">
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col h-full">
                      
                      {/* Card Thumbnail */}
                      <div className="aspect-video relative bg-zinc-900 flex items-center justify-center">
                        {audit.status === 'completed' && audit.aiResults?.peakFrameUrl ? (
                          <img 
                            src={audit.aiResults.peakFrameUrl} 
                            alt="AI Capture"
                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        ) : audit.status === 'processing' ? (
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Running AI</span>
                          </div>
                        ) : (
                          <div className="bg-zinc-900 w-full h-full flex items-center justify-center">
                             <Play className="w-10 h-10 text-zinc-700" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                           <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${audit.category === 'food' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                              {audit.category}
                           </div>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-sm mb-1 truncate text-zinc-200 group-hover:text-blue-400 transition-colors">{audit.fileName}</h3>
                        <p className="text-[10px] text-zinc-600 font-mono mb-4">{new Date(audit.createdAt).toLocaleString()}</p>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-900">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Status</span>
                            <span className={`text-[11px] font-bold uppercase ${audit.status === 'completed' ? 'text-green-500' : 'text-blue-500'}`}>
                              {audit.status}
                            </span>
                          </div>
                          {audit.status === 'completed' && (
                             <div className="text-right">
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block mb-1">Score</span>
                                <span className="text-xl font-black text-white">{audit.aiResults?.summary?.visibility_score?.toFixed(0)}%</span>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
