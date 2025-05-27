import apiClient from './apiClient';

export const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    console.log('📊 [DashboardService] Getting dashboard statistics');
    try {
      const response = await apiClient.get('/api/v1/dashboard/stats');
      console.log('✅ [DashboardService] Dashboard stats success:', response);
      return response;
    } catch (error) {
      console.error('❌ [DashboardService] Dashboard stats failed:', error);
      throw error;
    }
  },
};

export default dashboardService;
