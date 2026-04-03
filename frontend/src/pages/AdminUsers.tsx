import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Shield, User, AlertCircle, Coins, Search, RefreshCw, Plus, Minus } from 'lucide-react';
import { api } from '../lib/api';
import { User as UserType } from '../types';
import { Link } from 'react-router-dom';

export const AdminUsers = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to load user database');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredits = async (userId: string, currentCredits: number, amount: number) => {
    setIsUpdating(userId);
    try {
      const newCredits = Math.max(0, currentCredits + amount);
      // 🎯 Matches your backend: router.patch('/user/:id/credits', updateUserCredits)
      await api.patch(`/admin/user/${userId}/credits`, { credits: newCredits });
      
      setUsers(users.map(u => u._id === userId ? { ...u, credits: newCredits } : u));
    } catch (err: any) {
      setError('Failed to update user credits');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('🛑 WARNING: Revoke access? This will permanently delete this user account.')) return;

    try {
      await api.delete(`/admin/user/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to ban user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-6">
        
        <Link to="/admin" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Return to Dashboard</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">User <span className="text-blue-500">Registry</span></h1>
            <p className="text-zinc-500 text-sm font-medium">Monitoring and managing active platform nodes.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text" 
              placeholder="Search Identity or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-xs focus:ring-2 ring-blue-500/20 outline-none transition-all placeholder:text-zinc-800"
            />
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wide">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-zinc-950 border border-zinc-900 rounded-[40px] overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/10">
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Identity Node</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Credentials</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Subscription</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Allocated Credits</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                <AnimatePresence>
                  {filteredUsers.map((u, i) => (
                    <motion.tr 
                      key={u._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${u.role === 'admin' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-zinc-900 border-zinc-800'}`}>
                            <User className={`w-5 h-5 ${u.role === 'admin' ? 'text-blue-500' : 'text-zinc-600'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-bold tracking-tight">{u.name}</p>
                            <p className="text-[10px] text-zinc-600 font-mono uppercase">UID-{u._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs text-zinc-500 font-medium">{u.email}</td>
                      <td className="px-8 py-6">
                        {u.role === 'admin' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <Shield className="w-3 h-3 text-blue-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Supervisor</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Active Client</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        {u.role === 'admin' ? (
                          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Unlimited</span>
                        ) : u.credits > 0 ? (
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Plan</span>
                        ) : (
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">No Plan</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 bg-black border border-zinc-900 px-3 py-2 rounded-xl">
                            <Coins className="w-3 h-3 text-yellow-600" />
                            <span className="text-xs font-black font-mono text-zinc-300 w-8 text-center">{u.credits}</span>
                          </div>
                          {u.role !== 'admin' && (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleUpdateCredits(u._id, u.credits, -5)}
                                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-600 hover:text-red-500 transition-colors"
                                disabled={isUpdating === u._id}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleUpdateCredits(u._id, u.credits, 5)}
                                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-600 hover:text-green-500 transition-colors"
                                disabled={isUpdating === u._id}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-3 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group-hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-6 h-6 text-zinc-800" />
              </div>
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">No matching nodes found in registry</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
