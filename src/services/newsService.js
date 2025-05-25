// src/services/newsService.js
import apiClient from './apiClient'; // Import apiClient từ file apiClient.js của bạn
import { createFileUploadConfig } from './apiClient'; // Import helper cho upload

// Đường dẫn cơ sở cho API News
const API_BASE_PATH = '/api/v1/news';

const newsService = {
  // Get all news articles
  getAllNews: async () => {
    try {
      // apiClient.get đã trả về response.data.
      // Dựa trên các log trước đó, API này trả về một mảng tin tức trực tiếp.
      const newsList = await apiClient.get(API_BASE_PATH);
      return newsList;
    } catch (error) {
      console.error("Error fetching all news:", error);
      throw error; // Ném lỗi để component có thể bắt và xử lý
    }
  },

  // Get news by ID
  getNewsById: async (id) => {
    try {
      const newsArticle = await apiClient.get(`${API_BASE_PATH}/${id}`);
      return newsArticle;
    } catch (error) {
      console.error(`Error fetching news with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new news article
  // Hàm này sẽ trả về response từ backend, bao gồm ID của tin tức vừa tạo.
  createNews: async (newsData) => {
    try {
      const response = await apiClient.post(API_BASE_PATH, newsData);
      // Backend của bạn có thể trả về:
      // 1. `{ id: ..., name: ..., ... }` trực tiếp
      // 2. `{ success: true, message: "...", data: { id: ..., ... } }`
      // Chúng ta sẽ trả về toàn bộ `response` từ apiClient, và để component xử lý.
      // Tuy nhiên, để nhất quán, chúng ta sẽ cố gắng trả về `data` nếu có, hoặc toàn bộ `response`
      return response.data || response;
    } catch (error) {
      console.error("Error creating news:", error);
      throw error;
    }
  },

  // Update a news article
  updateNews: async (id, newsData) => {
    try {
      const response = await apiClient.put(`${API_BASE_PATH}/${id}`, newsData);
      return response;
    } catch (error) {
      console.error(`Error updating news with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a news article
  deleteNews: async (id) => {
    try {
      const response = await apiClient.delete(`${API_BASE_PATH}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting news with ID ${id}:`, error);
      throw error;
    }
  },

  // Upload attachments for a news article (Chỉ 1 file như Angular cũ của bạn)
  // Backend API của bạn nhận FormData với key 'files', chấp nhận nhiều file.
  // Ở đây chúng ta sẽ gửi chỉ 1 file.
  uploadNewsAttachments: async (newsId, file, onUploadProgress) => { // Tham số là 'file' (số ít)
    try {
      const formData = new FormData();
      // Đảm bảo key là 'files' như backend của bạn mong đợi
      formData.append('files', file); // Append một file duy nhất

      const config = createFileUploadConfig(onUploadProgress);
      const response = await apiClient.post(`${API_BASE_PATH}/uploads/${newsId}`, formData, config);
      return response;
    } catch (error) {
      console.error(`Error uploading attachment for news ID ${newsId}:`, error);
      throw error;
    }
  },

  // Get image by name (for displaying attachments)
  getImageUrl: (imageName) => {
    // Sử dụng process.env.REACT_APP_API_URL hoặc fallback về localhost
    // Đường dẫn này phải khớp với cách backend phục vụ file ảnh
    // Ví dụ: http://localhost:8080/api/v1/news/image/image_name.jpg
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${API_BASE_PATH}/image/${imageName}`;
  }
};

export default newsService;