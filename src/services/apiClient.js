import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants.safe';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle response and errors
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    
    // Normalize response format
    // Backend returns: { success: true, message: "...", data: {...} }
    if (response.data && typeof response.data === 'object') {
      // If has success field, this is standard backend response
      if (response.data.hasOwnProperty('success')) {
        return response.data; // Return { success, message, data }
      }
      // If no success field, wrap response
      return {
        success: true,
        data: response.data,
        message: 'Success'
      };
    }
    
    // Fallback for non-object response
    return {
      success: true,
      data: response.data,
      message: 'Success'
    };
  },
  (error) => {
    const { config, response } = error;
    
    // Log error for debugging
    console.error(`API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
      status: response?.status,
      data: response?.data,
      message: error.message
    });
    
    // Handle specific status codes
    if (response?.status === 401) {
      console.log('401 Unauthorized for:', config?.url);
      
      // Don't auto-logout for login/register endpoints
      if (!config?.url?.includes('/auth/login') && !config?.url?.includes('/auth/register')) {
        console.log('Invalid token, clearing storage and redirecting');
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        // Show toast notification
        toast.error('Phien dang nhap da het han. Vui long dang nhap lai.');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (response?.status === 403) {
      toast.error('Ban khong co quyen thuc hien hanh dong nay.');
    } else if (response?.status === 404) {
      toast.error('Khong tim thay tai nguyen yeu cau.');
    } else if (response?.status === 422) {
      // Validation errors
      const errorMessage = response?.data?.message || 'Du lieu khong hop le.';
      toast.error(errorMessage);
    } else if (response?.status >= 500) {
      toast.error('Loi may chu. Vui long thu lai sau.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Ket noi qua cham. Vui long thu lai.');
    } else if (!response) {
      // Network error
      toast.error('Khong the ket noi den may chu. Vui long kiem tra ket noi mang.');
    }
    
    // Enhance error object with detailed info
    const enhancedError = {
      ...error,
      statusCode: response?.status,
      errorMessage: response?.data?.message || error.message,
      errorData: response?.data,
      isNetworkError: !response,
      isAuthError: response?.status === 401,
      isValidationError: response?.status === 422,
      isServerError: response?.status >= 500
    };
    
    return Promise.reject(enhancedError);
  }
);

// Helper function for file upload
export const createFileUploadConfig = (onUploadProgress) => {
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    },
  };
};

// Helper function to retry failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`Retry attempt ${i + 1}/${maxRetries} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Helper function to cancel requests
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

// Export axios instance
export default apiClient;

// Export additional utilities
export {
  API_BASE_URL,
  axios
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { healthy: false, error: error.message };
  }
};

// Function to test API connection
export const testConnection = async () => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    const response = await apiClient.get('/api/tournaments', {
      params: { page: 1, limit: 1 }
    });
    console.log('API connection successful');
    return { success: true, data: response };
  } catch (error) {
    console.error('API connection failed:', error);
    return { success: false, error: error.message };
  }
};
