import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, BarChart2, UploadCloud, LogOut } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const navLinks = [
    { path: '/upload', label: 'Analyze', icon: UploadCloud },
    { path: '/compare', label: 'Compare', icon: Layers },
    // { path: '/history', label: 'History', icon: BarChart2 }, // Add later
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6">
      <div className="flex items-center gap-1 bg-surface/50 backdrop-blur-xl border border-white/10 px-2 py-2 rounded-full shadow-2xl shadow-black/50">
        
        {/* Logo Area */}
        <div className="px-4 font-bold tracking-tight flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center text-white">
            <Layers size={18} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            AdVis.ai
          </span>
        </div>

        {/* Links */}
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} className="relative px-4 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              {isActive && (
                <motion.div 
                  layoutId="nav-pill" 
                  className="absolute inset-0 bg-white/10 rounded-full border border-white/5"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <link.icon size={16} /> {link.label}
              </span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-2" />

        {/* Logout (Simple Icon) */}
        <button className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-full transition-colors text-zinc-500">
          <LogOut size={18} />
        </button>

      </div>
    </nav>
  );
};

export default Navbar;