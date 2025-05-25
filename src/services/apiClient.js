// src/services/apiClient.js
import axios from 'axios';
import toast from 'react-hot-toast';
import { STORAGE_KEYS } from '../utils/constants.safe'; // Đã điều chỉnh import theo file của bạn

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json', // Mặc định là JSON
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      headers: { ...config.headers, Authorization: config.headers.Authorization ? 'Bearer <TOKEN>' : undefined } // Mask token in logs
    });

    return config;
  },
  (error) => {
    console.error('[API Request Interceptor Error]', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });

    // **Thay đổi quan trọng ở đây:**
    // Trả về trực tiếp `response.data`.
    // Tầng service (`newsService.js`) hoặc component (`NewsManagement.js`)
    // sẽ chịu trách nhiệm kiểm tra cấu trúc của `response.data` (ví dụ: có `success` hay `data` không).
    // Điều này giúp apiClient trở nên "agnostic" hơn về cấu trúc payload của backend.
    return response.data;
  },
  (error) => {
    const { config, response } = error;

    console.error(`[API Error] ${config?.method?.toUpperCase()} ${config?.url}`, {
      status: response?.status,
      data: response?.data,
      message: error.message
    });

    // Handle specific status codes with unique toast IDs
    if (response) {
      switch (response.status) {
        case 401: // Unauthorized
          console.log('[API Error] 401 Unauthorized for:', config?.url);
          if (!config?.url?.includes('/auth/login') && !config?.url?.includes('/auth/register')) {
            console.log('Invalid token, clearing storage and redirecting');
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN); // Assuming you use refresh token
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', { id: 'auth-expired-error' });
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;
        case 403: // Forbidden
          toast.error(response.data?.message || 'Bạn không có quyền thực hiện hành động này.', { id: 'permission-denied' });
          break;
        case 404: // Not Found
          toast.error(response.data?.message || 'Không tìm thấy tài nguyên yêu cầu.', { id: 'resource-not-found' });
          break;
        case 422: // Unprocessable Entity - Validation errors
          toast.error(response.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.', { id: 'validation-error' });
          break;
        case 500: // Internal Server Error
          toast.error(response.data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau.', { id: 'server-internal-error' });
          break;
        default:
          toast.error(response.data?.message || `Lỗi không xác định: ${response.status}`, { id: 'unknown-http-error' });
      }
    } else if (error.code === 'ECONNABORTED') { // Timeout
      toast.error('Yêu cầu quá thời gian. Vui lòng thử lại.', { id: 'request-timeout' });
    } else if (!navigator.onLine) { // Network error
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.', { id: 'network-disconnected' });
    } else { // Generic error
      toast.error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.', { id: 'generic-api-error' });
    }

    // Enhance error object (giữ nguyên logic tốt của bạn)
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

// Helper function: for file upload. Axios automatically sets 'Content-Type': 'multipart/form-data'
// when sending FormData, so explicitly setting it might not be necessary or can cause issues.
// We keep it just in case your backend requires it.
export const createFileUploadConfig = (onUploadProgress) => {
  return {
    headers: {
      'Content-Type': 'multipart/form-data', // Axios typically handles this
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

// Helper function to retry failed requests (keeping your good logic)
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      console.log(`Retry attempt ${i + 1}/${maxRetries} failed:`, error.message);
      if (i === maxRetries - 1) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Helper function to cancel requests (keeping your good logic)
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
    return response; // apiClient returns response.data now
  } catch (error) {
    console.error('Health check failed:', error);
    // Error handling done by interceptor, just re-throw or return structured error
    throw error;
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
    return response; // apiClient returns response.data now
  } catch (error) {
    console.error('API connection failed:', error);
    // Error handling done by interceptor, just re-throw or return structured error
    throw error;
  }
};