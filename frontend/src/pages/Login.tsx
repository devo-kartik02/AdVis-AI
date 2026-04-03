import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

declare global {}

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AdVis <span className="text-blue-500">AI</span></span>
          </Link>

          <h1 className="text-4xl font-bold mb-3">Welcome Back</h1>
          <p className="text-zinc-400 mb-8">Sign in to continue to your dashboard</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all hover:shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          

          <p className="text-center text-zinc-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent border-l border-zinc-900 items-center justify-center p-12"
      >
        <div className="max-w-lg">
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Predict Success
            <br />
            <span className="text-blue-400">Before Launch</span>
          </h2>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Join thousands of marketers using AI to optimize their creative and maximize ROI.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
