import React from 'react';

const Card = ({ 
  children, 
  className = '',
  onClick,
  hoverable = false,
  ...props 
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-sm';
  const hoverStyles = hoverable ? 'hover:shadow-md transition-shadow cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

export default Card;
