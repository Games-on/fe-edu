// ULTIMATE FIX for Java LocalDateTime compatibility
export const formatDateForBackend = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date for backend formatting:', date);
      return null;
    }
    
    // CRITICAL FIX: Java LocalDateTime DEFAULT format is YYYY-MM-DDTHH:mm:ss
    // WITHOUT milliseconds and WITHOUT timezone
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    // SIMPLEST FORMAT THAT WORKS WITH JAVA LocalDateTime
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    
    console.log('🕐 Simple Date formatting for Java LocalDateTime:');
    console.log('  Original:', date);
    console.log('  Date object:', dateObj);
    console.log('  Formatted:', formattedDate);
    
    return formattedDate;
  } catch (error) {
    console.error('Error formatting date for backend:', error, 'Date:', date);
    return null;
  }
};

// Alternative format with space separator for some Java configurations
export const formatDateForBackendAlt = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    
    // Format: YYYY-MM-DD HH:mm:ss (space separator - sometimes works better)
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error in alternative date formatting:', error);
    return null;
  }
};

// Array format - sometimes Java expects this for LocalDateTime
export const formatDateForBackendArray = (date) => {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    
    // Array format: [year, month, day, hour, minute, second]
    return [
      dateObj.getFullYear(),
      dateObj.getMonth() + 1, // JavaScript months are 0-indexed
      dateObj.getDate(),
      dateObj.getHours(),
      dateObj.getMinutes(),
      dateObj.getSeconds()
    ];
  } catch (error) {
    console.error('Error in array date formatting:', error);
    return null;
  }
};

export const safeDateParse = (dateString) => {
  if (!dateString) return null;
  
  try {
    let date;
    
    if (typeof dateString === 'string') {
      // Remove timezone info if present (Z suffix)
      const cleanDateString = dateString.replace('Z', '');
      date = new Date(cleanDateString);
    } else {
      date = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Could not parse date:', dateString);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing date:', error, 'Input:', dateString);
    return null;
  }
};

export const formatLocalDateTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = safeDateParse(date);
    if (!dateObj) return '';
    
    // Format for display: DD/MM/YYYY HH:mm
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting local date time:', error);
    return '';
  }
};

export default {
  formatDateForBackend,
  formatDateForBackendAlt,
  formatDateForBackendArray,
  safeDateParse,
  formatLocalDateTime
};