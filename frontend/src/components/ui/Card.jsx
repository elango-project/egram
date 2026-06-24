import React from 'react';
import { motion } from 'framer-motion';
import { animations } from '../../theme/animations';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'p-6'
}) => {
  const baseClasses = `bg-white rounded-2xl shadow-sm border border-slate-100 ${padding} ${className}`;
  
  if (hover) {
    return (
      <motion.div 
        variants={animations.hoverScale}
        initial="rest"
        whileHover="hover"
        className={`${baseClasses} transition-shadow hover:shadow-md cursor-pointer`}
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

export default Card;
