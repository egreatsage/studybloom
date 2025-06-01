'use client';

import { FaSpinner } from 'react-icons/fa';

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const LoadingSpinner = ({ size = 'md' }) => {
  return (
    <FaSpinner 
      className={`animate-spin text-blue-600 ${sizes[size]}`} 
    />
  );
};

export default LoadingSpinner;
