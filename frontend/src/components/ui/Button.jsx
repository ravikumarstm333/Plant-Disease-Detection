import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-gradient-primary text-white shadow-card hover:shadow-hover',
    secondary: 'bg-secondary-100 text-primary-700 shadow-card hover:shadow-hover',
    outline: 'border-2 border-primary-500 text-primary-700 hover:bg-primary-50',
    ghost: 'text-primary-700 hover:bg-primary-50',
    danger: 'bg-red-500 text-white shadow-card hover:shadow-hover',
    success: 'bg-green-500 text-white shadow-card hover:shadow-hover',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {children}
    </motion.button>
  );
};

export default Button;
