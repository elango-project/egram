import React from 'react';
import { Hammer } from 'lucide-react';
import { motion } from 'framer-motion';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Hammer size={40} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">System Maintenance</h1>
        <p className="text-lg text-slate-600 mb-8">
          We're currently upgrading Egram to bring you a better experience. We'll be back online shortly. Thank you for your patience!
        </p>
        <div className="text-sm font-semibold text-slate-400">
          Estimated completion: Less than 1 hour
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;
