import React from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0 opacity-20" />

      <Navbar />

      <main className="relative z-10 pt-32 px-6 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;