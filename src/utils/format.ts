import { CURRENCY_FORMAT } from './constants';

/**
 * Format currency to Indonesian Rupiah format
 */
export const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return 'Rp 0';
  
  return new Intl.NumberFormat(CURRENCY_FORMAT.LOCALE, {
    style: 'currency',
    currency: CURRENCY_FORMAT.CURRENCY,
    minimumFractionDigits: CURRENCY_FORMAT.MINIMUM_FRACTION_DIGITS,
    maximumFractionDigits: CURRENCY_FORMAT.MAXIMUM_FRACTION_DIGITS,
  }).format(numericAmount);
};

/**
 * Format date to readable format
 */
export const formatDate = (date: string | Date, includeTime = false): string => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '-';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Format time to HH:MM format
 */
export const formatTime = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

/**
 * Format date and time separately
 */
export const formatDateTime = (date: string | Date) => {
  if (!date) return { date: '-', time: '-' };
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return { date: '-', time: '-' };
  
  return {
    date: formatDate(dateObj),
    time: formatTime(dateObj),
  };
};

/**
 * Get relative time (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(Math.abs(diffInSeconds) / seconds);
    
    if (interval >= 1) {
      const suffix = diffInSeconds < 0 ? `in ${interval}` : `${interval}`;
      const unitText = interval === 1 ? unit : `${unit}s`;
      return diffInSeconds < 0 ? `${suffix} ${unitText}` : `${suffix} ${unitText} ago`;
    }
  }
  
  return '';
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Format phone number (Indonesian format)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle Indonesian phone numbers
  if (cleaned.startsWith('62')) {
    // International format: +62
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)}-${cleaned.substring(5, 9)}-${cleaned.substring(9)}`;
  } else if (cleaned.startsWith('0')) {
    // Local format: 0xxx
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
  }
  
  return phoneNumber;
};

/**
 * Format NIK (Indonesian National ID)
 */
export const formatNIK = (nik: string): string => {
  if (!nik) return '';
  
  const cleaned = nik.replace(/\D/g, '');
  
  if (cleaned.length === 16) {
    return `${cleaned.substring(0, 6)}-${cleaned.substring(6, 12)}-${cleaned.substring(12)}`;
  }
  
  return nik;
};

/**
 * Parse formatted currency back to number
 */
export const parseCurrency = (formattedAmount: string): number => {
  if (!formattedAmount) return 0;
  
  // Remove currency symbol, spaces, and dots (thousands separator)
  const cleaned = formattedAmount
    .replace(/[Rp\s]/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  
  return parseFloat(cleaned) || 0;
};

/**
 * Validate Indonesian NIK format
 */
export const validateNIK = (nik: string): boolean => {
  if (!nik) return false;
  
  const cleaned = nik.replace(/\D/g, '');
  return cleaned.length === 16;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indonesian phone number
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Indonesian phone numbers: 10-13 digits, starting with 08 or 628
  return /^(08|628)\d{8,11}$/.test(cleaned);
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return parts.map(part => part.charAt(0).toUpperCase()).join('').substring(0, 2);
};

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: string | Date): number => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  if (isNaN(birth.getTime())) return 0;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate random color for avatars
 */
export const generateColorFromString = (str: string): string => {
  if (!str) return '#6366f1'; // Default indigo
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if date is in the past
 */
export const isDatePast = (date: string | Date): boolean => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

/**
 * Check if date is today
 */
export const isDateToday = (date: string | Date): boolean => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Get days between two dates
 */
export const getDaysBetween = (startDate: string | Date, endDate: string | Date): number => {
  if (!startDate || !endDate) return 0;
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};