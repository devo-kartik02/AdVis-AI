import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, LogOut, LayoutDashboard, Shield, Coins, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase">
            AdVis <span className="text-blue-500">AI</span>
          </span>
        </Link>

        {/* Links Section */}
        <div className="flex items-center gap-6">
          {!user ? (
            // Public Navigation (Guest)
            <>
              <Link to="/" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}>
                Home
              </Link>
              <Link to="/about" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/about') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}>
                About
              </Link>
              <Link to="/contact" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/contact') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}>
                Contact
              </Link>
              <Link to="/subscription" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/subscription') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'}`}>
                Subscription
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  Sign In
                </motion.button>
              </Link>
            </>
          ) : (
            // Protected Navigation (Logged In)
            <>
              {user.role !== 'admin' && (
                <>
                  {/* Credits Badge (SaaS Feel) */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full mr-2">
                    <Coins className="w-3 h-3 text-yellow-500" />
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter">
                      {user.credits} CR
                    </span>
                  </div>
                  
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full mr-2">
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-titter">
                      {user.name?.split(' ')[0]}
                    </span>
                  </div>
                </>
              )}

              {user.role !== 'admin' && (
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isActive('/dashboard') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Overview</span>
                </Link>
              )}

              {/* Page 4: The Dedicated Analysis Lab */}
              {user.role !== 'admin' && (
                <Link
                  to="/analysis"
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isActive('/analysis') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Analysis Engine</span>
                </Link>
              )}

              {user.role !== 'admin' && (
                <Link
                  to="/comparison"
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isActive('/comparison') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compare</span>
                </Link>
              )}

              <Link
                to="/subscription"
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  isActive('/subscription') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Subscription</span>
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                    isActive('/admin') ? 'text-blue-500' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Control</span>
                </Link>
              )}

              <div className="w-px h-4 bg-zinc-800 mx-2" />

              <button
                onClick={logout}
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Simple Icon for Comparison link
const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);
