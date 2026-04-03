import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, FileVideo, Server, TrendingUp, AlertCircle, ShieldCheck, Cpu, Database, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAudits: 0,
    serverStatus: 'checking',
    uptime: '0h',
    memory: '0MB'
  });
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<any>({ starterPrice: 499, starterCredits: 10, proPrice: 1999, proCredits: 75, enterprisePrice: 0, enterpriseCredits: 300 });
  const [savingPricing, setSavingPricing] = useState(false);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');

      const uptimeSeconds = data.serverUptime || 0;
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      let uptimeLabel = '0m';
      if (hours > 0) uptimeLabel = `${hours}h ${minutes}m`;
      else uptimeLabel = `${minutes}m`;

      setStats({
        totalUsers: data.totalUsers || 0,
        totalAudits: data.totalAudits || 0,
        serverStatus: 'online',
        uptime: uptimeLabel,
        memory: data.memoryUsage ? `${Math.round(data.memoryUsage)}MB` : '124MB'
      });

      setRecentAudits(data.recentAudits || []);
      setChartData(processChartData(data.recentAudits || []));

      try {
        const inquiryResp = await api.get('/content/admin/inquiries');
        setInquiries(inquiryResp.data || []);
      } catch {
        setInquiries([]);
      }
      try {
        const p = await api.get('/admin/pricing');
        setPricing({
          starterPrice: p.data?.starterPrice ?? 499,
          starterCredits: p.data?.starterCredits ?? 10,
          proPrice: p.data?.proPrice ?? 1999,
          proCredits: p.data?.proCredits ?? 75,
          enterprisePrice: p.data?.enterprisePrice ?? 0,
          enterpriseCredits: p.data?.enterpriseCredits ?? 300,
        });
      } catch {}
      setError(null);
    } catch (err: any) {
      console.error('Admin Fetch Error:', err);
      setStats(prev => ({ ...prev, serverStatus: 'offline' }));
      setError(err.response?.data?.message || 'Unauthorized: Admin access required');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (audits: any[]) => {
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = audits.filter(a => new Date(a.createdAt).toDateString() === d.toDateString()).length;
      result.push({ date: dateStr, uploads: count });
    }
    return result;
  };


  const statCards = [
    { label: 'Platform Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total AI Audits', value: stats.totalAudits, icon: FileVideo, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Server Instance', value: stats.serverStatus, icon: Server, color: stats.serverStatus === 'online' ? 'text-green-400' : 'text-red-400', bg: stats.serverStatus === 'online' ? 'bg-green-500/10' : 'bg-red-500/10' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Server className="w-10 h-10 text-blue-500 animate-pulse mx-auto mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Initializing Admin Session</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Node Configuration: Root Admin</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">System <span className="text-blue-500">Control</span></h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/subscription" className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-zinc-800">
              View Subscription
            </Link>
            <Link to="/admin/users" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
              Manage User Access
            </Link>
            <Link to="/admin/inquiries" className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-zinc-800">
              Inquiries
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Top Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-950 border border-zinc-900 p-8 rounded-[32px] hover:border-zinc-700 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tighter uppercase italic">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Secondary Resources & Graph Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-[40px] p-8"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black uppercase tracking-tight">Neural Traffic</h2>
              <TrendingUp className="w-5 h-5 text-zinc-700" />
            </div>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: '16px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area type="monotone" dataKey="uploads" stroke="#3b82f6" strokeWidth={4} fill="url(#colorUploads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

            {/* System Health Widget */}
            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-900 rounded-[40px] p-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-8 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> Resource Monitor
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-4 h-4 text-zinc-700" />
                    <span className="text-xs font-bold text-zinc-400">Node Uptime</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-500">{stats.uptime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-zinc-700" />
                    <span className="text-xs font-bold text-zinc-400">Heap Memory</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-500">{stats.memory}</span>
                </div>
              </div>
              </div>

              {/* Recent Logs List */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-[40px] p-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">Recent Events</h2>
              <div className="space-y-4">
                {recentAudits.slice(0, 3).map((audit, idx) => (
                  <div key={idx} className="flex items-center gap-3 pb-4 border-b border-zinc-900 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-300 truncate w-40">
                        {audit.fileName || audit.filename || 'inference_job.mp4'}
                      </p>
                      <p className="text-[8px] text-zinc-600 uppercase font-black tracking-tighter">
                        Status: {audit.status || 'Success'}
                      </p>
                      {audit.user && (
                        <p className="text-[9px] text-zinc-500">
                          {audit.user.name} • {audit.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

              {/* Latest Inquiries */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-[40px] p-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6">
                  Latest Inquiries
                </h2>
                <div className="space-y-4">
                  {inquiries.slice(0, 3).map((inq, idx) => (
                    <div
                      key={inq._id || idx}
                      className="pb-4 border-b border-zinc-900 last:border-0"
                    >
                      <p className="text-[10px] font-bold text-zinc-300">
                        {inq.name} • <span className="text-zinc-500">{inq.email}</span>
                      </p>
                      <p className="text-[9px] text-zinc-500 line-clamp-2">
                        {inq.message}
                      </p>
                    </div>
                  ))}
                  {inquiries.length === 0 && (
                    <p className="text-[10px] text-zinc-600">No inquiries received yet</p>
                  )}
                </div>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
};
