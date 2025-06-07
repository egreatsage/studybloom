'use client';

import { toast } from 'react-hot-toast';

export const handleError = (error, customMessage = '') => {
  console.error(error);
  const message = customMessage || error.message || 'An unexpected error occurred';
  toast.error(message, { duration: 3000 });
};

export const handleSuccess = (message) => {
  toast.success(message, { duration: 3000 });
};

export const handleAPIResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to complete the request');
  }
  return response.json();
};

export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a PDF or Word document');
  }

  return true;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateProgress = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
