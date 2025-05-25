import { format, parseISO, isValid, differenceInDays, differenceInHours } from 'date-fns';
import { 
  STATUS_COLORS, 
  SPORT_TYPE_LABELS, 
  TOURNAMENT_STATUS_LABELS,
  MATCH_STATUS_LABELS,
  TEAM_STATUS_LABELS,
  USER_ROLE_LABELS,
  DATE_FORMATS,
  FILE_UPLOAD
} from './constants';

// ==================== DATE HELPERS ====================
export const formatDate = (dateString, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, formatStr) : dateString;
  } catch (error) {
    console.warn('Date formatting error:', error);
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, DATE_FORMATS.DISPLAY_WITH_TIME);
};

export const formatDateForInput = (dateString) => {
  return formatDate(dateString, DATE_FORMATS.INPUT);
};

export const formatDateTimeForInput = (date) => {
  if (!date) return '';
  
  try {
    let dateObj;
    
    // Handle different date formats
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Handle ISO string with timezone info
      if (date.includes('T') && date.includes('Z')) {
        dateObj = new Date(date);
      } else {
        // Try to parse as ISO
        dateObj = parseISO(date);
      }
    } else {
      dateObj = new Date(date);
    }
    
    // Check if date is valid
    if (!dateObj || isNaN(dateObj.getTime()) || !isValid(dateObj)) {
      console.warn('Invalid date for input formatting:', date);
      return '';
    }
    
    // Format to YYYY-MM-DDTHH:MM format for datetime-local input
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.warn('DateTime formatting error:', error, 'for date:', date);
    return '';
  }
};

export const getTimeUntil = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const now = new Date();
    const days = differenceInDays(date, now);
    const hours = differenceInHours(date, now);
    
    if (days > 0) {
      return `${days} ngày nữa`;
    } else if (hours > 0) {
      return `${hours} giờ nữa`;
    } else {
      return 'Sắp diễn ra';
    }
  } catch (error) {
    return '';
  }
};

// ==================== TEXT HELPERS ====================
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(capitalizeFirst).join(' ');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// ==================== COLOR HELPERS ====================
export const generateColor = (index) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];
  return colors[index % colors.length];
};

export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

export const getRandomGradient = () => {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-yellow-500 to-orange-600',
    'from-red-500 to-pink-600',
    'from-indigo-500 to-purple-600'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

// ==================== LABEL HELPERS ====================
export const getSportTypeLabel = (sportType) => {
  return SPORT_TYPE_LABELS[sportType] || sportType;
};

export const getTournamentStatusLabel = (status) => {
  return TOURNAMENT_STATUS_LABELS[status] || status;
};

export const getMatchStatusLabel = (status) => {
  return MATCH_STATUS_LABELS[status] || status;
};

export const getTeamStatusLabel = (status) => {
  return TEAM_STATUS_LABELS[status] || status;
};

export const getUserRoleLabel = (role) => {
  return USER_ROLE_LABELS[role] || role;
};

// ==================== VALIDATION HELPERS ====================
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateFileSize = (file, maxSizeMB = FILE_UPLOAD.MAX_SIZE_MB) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateImageFile = (file) => {
  return FILE_UPLOAD.ALLOWED_IMAGES.includes(file.type);
};

// ==================== FORMAT HELPERS ====================
export const formatNumber = (num) => {
  if (typeof num !== 'number') return num;
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatCurrency = (amount, currency = 'VND') => {
  if (typeof amount !== 'number') return amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') return value;
  return `${(value * 100).toFixed(decimals)}%`;
};

// ==================== ARRAY HELPERS ====================
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const uniqueBy = (array, key) => {
  return array.filter((item, index, self) => 
    index === self.findIndex(t => t[key] === item[key])
  );
};

// ==================== URL HELPERS ====================
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl, window.location.origin);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

export const getQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams) {
    params[key] = value;
  }
  return params;
};

// ==================== STORAGE HELPERS ====================
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Error writing to localStorage:', error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Error removing from localStorage:', error);
    return false;
  }
};

// ==================== DEBOUNCE HELPER ====================
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

// ==================== COPY TO CLIPBOARD ====================
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// ==================== DOWNLOAD HELPER ====================
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ==================== TOURNAMENT HELPERS ====================
export const calculateTournamentProgress = (tournament) => {
  if (!tournament.startDate || !tournament.endDate) return 0;
  
  const now = new Date();
  const start = new Date(tournament.startDate);
  const end = new Date(tournament.endDate);
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return Math.round((elapsed / total) * 100);
};

export const canRegisterForTournament = (tournament) => {
  if (!tournament) return false;
  
  const now = new Date();
  const registrationDeadline = new Date(tournament.registrationDeadline);
  
  return (
    tournament.status === 'REGISTRATION_OPEN' &&
    now < registrationDeadline &&
    tournament.currentTeams < tournament.maxTeams
  );
};

// ==================== EXPORT DEFAULT ====================
export default {
  formatDate,
  formatDateTime,
  formatDateForInput,
  formatDateTimeForInput,
  getTimeUntil,
  capitalizeFirst,
  capitalizeWords,
  truncateText,
  slugify,
  generateColor,
  getStatusColor,
  getRandomGradient,
  getSportTypeLabel,
  getTournamentStatusLabel,
  getMatchStatusLabel,
  getTeamStatusLabel,
  getUserRoleLabel,
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
  validateFileSize,
  validateImageFile,
  formatNumber,
  formatCurrency,
  formatPercentage,
  groupBy,
  sortBy,
  uniqueBy,
  buildUrl,
  getQueryParams,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  debounce,
  copyToClipboard,
  downloadFile,
  calculateTournamentProgress,
  canRegisterForTournament
};