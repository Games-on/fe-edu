// src/utils/axiosInstance.js
import axios from 'axios';

// Đảm bảo BASE_URL này khớp với base URL của backend API của bạn
// Ví dụ: Nếu API đăng nhập của bạn là http://localhost:8080/api/v1/auth/login, thì baseURL là http://localhost:8080/api/v1
const API_BASE_URL = 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thêm timeout 10 giây
});

// Thêm interceptor để đính kèm Authorization header cho mỗi yêu cầu
// Điều này là cần thiết nếu các API của bạn yêu cầu JWT Token sau khi đăng nhập
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token'); // Giả sử bạn lưu token trong localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Bạn có thể thêm interceptor cho response để xử lý lỗi tập trung, ví dụ
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Ví dụ xử lý khi token hết hạn
        if (error.response && error.response.status === 401) {
            // Điều hướng về trang đăng nhập hoặc refresh token
            console.error("Unauthorized - Token expired or invalid. Please re-login.");
            // window.location.href = '/login'; // Ví dụ
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;