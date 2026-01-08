import React from 'react';
import { getAvatarColor, getInitials } from '../../utils/helpers';

const Avatar = ({ name, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  return (
    <div 
      className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-bold ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
