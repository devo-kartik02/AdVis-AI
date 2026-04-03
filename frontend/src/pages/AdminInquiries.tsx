import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { Filter, Mail, User2, Clock4, Check, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

type Inquiry = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
};

export const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      const { data } = await api.get('/content/admin/inquiries');
      setInquiries(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
    const id = setInterval(fetchInquiries, 15000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return inquiries
      .filter(i => filter === 'all' ? true : i.status === filter)
      .filter(i => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return i.name.toLowerCase().includes(q) ||
               i.email.toLowerCase().includes(q) ||
               i.message.toLowerCase().includes(q);
      });
  }, [inquiries, filter, search]);

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      await api.patch(`/content/admin/inquiries/${id}/status`, { status });
      setInquiries(prev => prev.map(i => i._id === id ? { ...i, status } : i));
    } catch (err) {
      // noop
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-20 flex items-center justify-center">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Loading Inquiries…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Inbox className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Admin Inquiries</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Communications <span className="text-blue-500">Hub</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="px-5 py-3 rounded-2xl bg-zinc-950 border border-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] hover:border-zinc-700"
            >
              Back to Control
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500" />
              <div className="flex gap-2">
                {(['all','new','read','replied'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                      filter === s ? 'bg-blue-500 text-white border-blue-500' : 'bg-black border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email or message…"
              className="w-full md:w-80 px-4 py-2 rounded-xl bg-black border border-zinc-800 text-sm outline-none"
            />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-[32px] divide-y divide-zinc-900 overflow-hidden">
          {filtered.map(inq => (
            <motion.div
              key={inq._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <User2 className="w-4 h-4 text-zinc-600" />
                    <span className="text-sm font-bold">{inq.name}</span>
                    <span className="text-xs text-zinc-500">{inq.email}</span>
                  </div>
                  <p className="text-sm text-zinc-300 whitespace-pre-line">{inq.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
                    <Clock4 className="w-3 h-3" />
                    <span>{new Date(inq.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(inq._id, 'new')}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${
                      inq.status === 'new' ? 'bg-blue-500 text-white border-blue-500' : 'bg-black text-zinc-300 border-zinc-800'
                    }`}
                    title="Mark as New"
                  >
                    New
                  </button>
                  <button
                    onClick={() => updateStatus(inq._id, 'read')}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${
                      inq.status === 'read' ? 'bg-amber-500 text-black border-amber-500' : 'bg-black text-zinc-300 border-zinc-800'
                    }`}
                    title="Mark as Read"
                  >
                    Read
                  </button>
                  <button
                    onClick={() => updateStatus(inq._id, 'replied')}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${
                      inq.status === 'replied' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-black text-zinc-300 border-zinc-800'
                    }`}
                    title="Mark as Replied"
                  >
                    Replied
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-zinc-500">No inquiries match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
};
