import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/upload');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-white font-sans">
      {/* Visual Side */}
      <div className="hidden lg:flex w-1/2 bg-surface relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="relative z-20 p-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 mb-6">
             <Sparkles size={12} className="text-yellow-400" />
             <span>AI-Powered Insights</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">See what your audience sees.</h1>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-zinc-400">Enter your credentials to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 bg-surface border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {error && <div className="text-red-400 text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-3 px-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-medium transition-all">
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'} <ArrowRight size={18} className="ml-2" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;