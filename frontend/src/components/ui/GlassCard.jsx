import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  dark = false,
  animated = false 
}) => {
  const baseClasses = `${dark ? 'glass-dark text-white' : 'glass'} rounded-2xl p-6 ${className}`;

  if (animated) {
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className={baseClasses}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};

export default GlassCard;
