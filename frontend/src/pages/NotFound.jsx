import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Compass size={48} />
        </div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Page not found</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <Link to="/">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg px-8 py-3">
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
