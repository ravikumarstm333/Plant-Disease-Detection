import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-4 border-primary-100 border-t-primary-600 rounded-full`}
      />
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );
};

export default Loading;
