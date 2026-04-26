import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', glass = false, hover = true, delay = 0, ...props }) => {
  const baseClass = glass ? 'glass-card' : 'card';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${baseClass} ${hover ? 'hover:shadow-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
