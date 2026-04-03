import React, { useState } from 'react';
import { Eye, Flame, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const HeatmapPlayer = ({ originalSrc, heatmapSrc, isImage }) => {
  const [mode, setMode] = useState('heatmap'); // 'original' or 'heatmap'

  return (
    <div className="relative w-full h-full min-h-[400px] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
      
      {/* 1. The Media Layer */}
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
        {mode === 'original' ? (
          isImage ? (
            <img src={originalSrc} alt="Original" className="w-full h-full object-contain" />
          ) : (
            <video src={originalSrc} controls className="w-full h-full object-contain" />
          )
        ) : (
          // Heatmap Mode
          isImage ? (
             <img src={heatmapSrc} alt="Heatmap" className="w-full h-full object-contain" />
          ) : (
             <video src={heatmapSrc} autoPlay loop muted className="w-full h-full object-contain opacity-90" />
          )
        )}
      </div>

      {/* 2. The Floating Controller (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center bg-black/60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-xl">
          <button
            onClick={() => setMode('original')}
            className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              mode === 'original' 
                ? 'bg-white text-black shadow-lg scale-105' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye size={14} className="mr-2" /> Original
          </button>
          
          <button
            onClick={() => setMode('heatmap')}
            className={`flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              mode === 'heatmap' 
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame size={14} className="mr-2" /> AI Heatmap
          </button>
        </div>
      </div>

      {/* 3. Badge (Top Left) */}
      <div className="absolute top-6 left-6 z-20">
         <div className="px-3 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
            {isImage ? "Static Analysis" : "Video Analysis"}
         </div>
      </div>
    </div>
  );
};

export default HeatmapPlayer;