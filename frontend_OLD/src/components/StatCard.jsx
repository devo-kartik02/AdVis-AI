import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtext, score = 0, type = "neutral", delay = 0 }) => {
  // Dynamic color logic based on "type" or raw score
  const getColor = () => {
    if (type === 'neutral') return 'border-white/10 bg-surface';
    if (type === 'danger') return 'border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]';
    if (type === 'warning') return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]';
    if (type === 'success') return 'border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]';
    return 'border-white/10 bg-surface';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative p-6 rounded-3xl border backdrop-blur-md overflow-hidden flex flex-col justify-between h-full ${getColor()}`}
    >
      <div>
        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight text-white">{value}</span>
        </div>
      </div>
      
      {subtext && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs font-medium text-zinc-400">{subtext}</p>
        </div>
      )}

      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
};

export default StatCard;