import apiClient from '../api';

// ==================== TOURNAMENT SERVICE FIXED ====================
export const tournamentServiceFixed = {
  // Get all tournaments - FIXED VERSION
  getAllTournaments: async (params = {}) => {
    console.log('🏟️ [TournamentService] Getting all tournaments with params:', params);
    try {
      const response = await apiClient.get('/api/tournaments', { params });
      console.log('✅ [TournamentService] Raw response:', response);
      
      // Backend trả về format theo tài liệu API:
      // {
      //   "data": [...],
      //   "page": 1,
      //   "limit": 10,
      //   "total": 25,
      //   "totalPages": 3
      // }
      
      // Kiểm tra xem response có phải là format mong đợi không
      if (response && Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: {
            currentPage: response.page || params.page || 1,
            totalPages: response.totalPages || 1,
            totalItems: response.total || response.data.length,
            hasNext: response.page < response.totalPages,
            hasPrev: response.page > 1,
            limit: response.limit || params.limit || 10
          }
        };
      }
      
      // Fallback cho trường hợp response.data không phải array
      // Có thể backend trả về trực tiếp array
      if (Array.isArray(response)) {
        return {
          data: response,
          pagination: {
            currentPage: params.page || 1,
            totalPages: 1,
            totalItems: response.length,
            hasNext: false,
            hasPrev: false,
            limit: params.limit || 10
          }
        };
      }
      
      // Fallback cuối cùng - trả về empty state
      console.warn('⚠️ [TournamentService] Unexpected response format:', response);
      return {
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false,
          limit: params.limit || 10
        }
      };
      
    } catch (error) {
      console.error('❌ [TournamentService] Get all tournaments failed:', error);
      
      // Log thêm thông tin để debug
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      throw error;
    }
  },

  // Get tournament by ID
  getTournamentById: async (id) => {
    console.log('🏟️ [TournamentService] Getting tournament by ID:', id);
    try {
      const response = await apiClient.get(`/api/tournaments/${id}`);
      console.log('✅ [TournamentService] Get tournament by ID success:', response);
      
      // Backend trả về format:
      // {
      //   "success": true,
      //   "message": null,
      //   "data": { tournament object }
      // }
      
      if (response.success && response.data) {
        return response.data;
      }
      
      // Fallback
      return response;
    } catch (error) {
      console.error('❌ [TournamentService] Get tournament by ID failed:', error);
      throw error;
    }
  },

  // Create tournament
  createTournament: async (tournamentData) => {
    console.log('🏟️ [TournamentService] Creating tournament with data:', tournamentData);
    try {
      const response = await apiClient.post('/api/tournaments', tournamentData);
      console.log('✅ [TournamentService] Create tournament success:', response);
      
      // Backend trả về format:
      // {
      //   "success": true,
      //   "message": "Tournament created successfully",
      //   "data": { created tournament }
      // }
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('❌ [TournamentService] Create tournament failed:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Update tournament
  updateTournament: async (id, tournamentData) => {
    console.log('🏟️ [TournamentService] Updating tournament:', id, tournamentData);
    try {
      const response = await apiClient.put(`/api/tournaments/${id}`, tournamentData);
      console.log('✅ [TournamentService] Update tournament success:', response);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('❌ [TournamentService] Update tournament failed:', error);
      throw error;
    }
  },

  // Delete tournament
  deleteTournament: async (id) => {
    console.log('🏟️ [TournamentService] Deleting tournament:', id);
    try {
      const response = await apiClient.delete(`/api/tournaments/${id}`);
      console.log('✅ [TournamentService] Delete tournament success:', response);
      
      if (response.success) {
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('❌ [TournamentService] Delete tournament failed:', error);
      throw error;
    }
  },

  // Start tournament
  startTournament: async (id) => {
    console.log('🏟️ [TournamentService] Starting tournament:', id);
    try {
      const response = await apiClient.post(`/api/tournaments/${id}/start`);
      console.log('✅ [TournamentService] Start tournament success:', response);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return response;
    } catch (error) {
      console.error('❌ [TournamentService] Start tournament failed:', error);
      throw error;
    }
  },
};

export default tournamentServiceFixed;
