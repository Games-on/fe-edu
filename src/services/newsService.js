import apiClient from './apiClient'; 
import { createFileUploadConfig } from './apiClient'; 

const API_BASE_PATH = '/api/v1/news';

const newsService = {
  // Get all news articles
  getAllNews: async () => {
    try {
      const response = await apiClient.get(API_BASE_PATH);
      
      // Handle different response structures
      let newsList;
      if (Array.isArray(response)) {
        newsList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        newsList = response.data;
      } else if (response?.content && Array.isArray(response.content)) {
        newsList = response.content;
      } else if (response?.items && Array.isArray(response.items)) {
        newsList = response.items;
      } else {
        newsList = [];
      }
      
      return Array.isArray(newsList) ? newsList : [];
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error; 
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

  createNews: async (newsData) => {
    try {
      const response = await apiClient.post(API_BASE_PATH, newsData);
      return response?.data || response;
    } catch (error) {
      console.error('Error creating news:', error);
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

  uploadNewsAttachments: async (newsId, file, onUploadProgress) => {
    try {
      const formData = new FormData();
      formData.append('files', file); 

      const config = createFileUploadConfig(onUploadProgress);
      const response = await apiClient.post(`${API_BASE_PATH}/uploads/${newsId}`, formData, config);
      return response;
    } catch (error) {
      console.error(`Error uploading attachment for news ID ${newsId}:`, error);
      throw error;
    }
  },

  getImageUrl: (imageName) => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${API_BASE_PATH}/image/${imageName}`;
  }
};

export default newsService;