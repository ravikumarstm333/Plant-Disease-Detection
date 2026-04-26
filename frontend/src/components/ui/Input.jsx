import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  icon: Icon,
  required = false,
  disabled = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = {
    sm: 'input-field text-sm',
    md: 'input-field',
    lg: 'input-field-lg',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="label-float">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`${sizeClasses[size]} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
