import React from 'react';

const Badge = ({ variant = 'success', children, className = '' }) => {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };

  return <span className={`badge ${variants[variant]} ${className}`}>{children}</span>;
};

export default Badge;
