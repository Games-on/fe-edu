import apiClient from './api';

// TOURNAMENT SERVICE FIXED FOR BACKEND RESPONSE FORMAT
export const tournamentServiceFixed = {
  // Get all tournaments - HANDLES BACKEND FORMAT: { success: true, data: { tournaments: [...] } }
  getAllTournaments: async (params = {}) => {
    console.log('🏟️ [TournamentServiceFixed] Getting all tournaments with params:', params);
    try {
      const response = await apiClient.get('/api/tournaments', { params });
      console.log('✅ [TournamentServiceFixed] Raw response:', response);
      
      // Backend returns format: { success: true, data: { tournaments: [...], pagination: {...} } }
      // We need to extract the tournaments array and pagination
      
      // Case 1: Standard backend format with success wrapper
      if (response && response.success && response.data && response.data.tournaments) {
        console.log('🏆 [TournamentServiceFixed] Found tournaments in response.data.tournaments:', response.data.tournaments.length);
        return {
          data: response.data.tournaments,
          pagination: response.data.pagination || {
            currentPage: params.page || 1,
            totalPages: 1,
            totalItems: response.data.tournaments.length,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      // Case 2: Direct tournaments array (fallback)
      if (response && Array.isArray(response.tournaments)) {
        console.log('🏆 [TournamentServiceFixed] Found tournaments in response.tournaments:', response.tournaments.length);
        return {
          data: response.tournaments,
          pagination: response.pagination || {
            currentPage: params.page || 1,
            totalPages: 1,
            totalItems: response.tournaments.length,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      // Case 3: Response has data.tournaments directly
      if (response && response.data && Array.isArray(response.data.tournaments)) {
        console.log('🏆 [TournamentServiceFixed] Found tournaments in response.data.tournaments (direct):', response.data.tournaments.length);
        return {
          data: response.data.tournaments,
          pagination: response.data.pagination || {
            currentPage: params.page || 1,
            totalPages: 1,
            totalItems: response.data.tournaments.length,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      // Case 4: Legacy format { data: [...] }
      if (response && response.data && Array.isArray(response.data)) {
        console.log('🏆 [TournamentServiceFixed] Found tournaments in response.data (array):', response.data.length);
        return {
          data: response.data,
          pagination: response.pagination || {
            currentPage: params.page || 1,
            totalPages: 1,
            totalItems: response.data.length,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      // Case 5: Direct array response
      if (Array.isArray(response)) {
        console.log('🏆 [TournamentServiceFixed] Found tournaments in response (direct array):', response.length);
        return {
          data: response,
          pagination: {
            currentPage: params.page || 1,
            totalPages: 1,
            totalItems: response.length,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      console.warn('⚠️ [TournamentServiceFixed] Unexpected response format, details:', {
        hasSuccess: !!response?.success,
        hasData: !!response?.data,
        hasTournaments: !!response?.data?.tournaments,
        isArray: Array.isArray(response?.data?.tournaments),
        responseKeys: Object.keys(response || {}),
        dataKeys: Object.keys(response?.data || {})
      });
      
      // Fallback - return empty state
      return {
        data: [],
        pagination: {
          currentPage: params.page || 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        }
      };
      
    } catch (error) {
      console.error('❌ [TournamentServiceFixed] Get all tournaments failed:', error);
      throw error;
    }
  },

  // Get tournament by ID
  getTournamentById: async (id) => {
    console.log('🏟️ [TournamentServiceFixed] Getting tournament by ID:', id);
    try {
      const response = await apiClient.get(`/api/tournaments/${id}`);
      console.log('✅ [TournamentServiceFixed] Get tournament by ID success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentServiceFixed] Get tournament by ID failed:', error);
      throw error;
    }
  },

  // Create tournament
  createTournament: async (tournamentData) => {
    console.log('🏟️ [TournamentServiceFixed] Creating tournament with data:', tournamentData);
    try {
      const response = await apiClient.post('/api/tournaments', tournamentData);
      console.log('✅ [TournamentServiceFixed] Create tournament success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentServiceFixed] Create tournament failed:', error);
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
    console.log('🏟️ [TournamentServiceFixed] Updating tournament:', id, tournamentData);
    try {
      const response = await apiClient.put(`/api/tournaments/${id}`, tournamentData);
      console.log('✅ [TournamentServiceFixed] Update tournament success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentServiceFixed] Update tournament failed:', error);
      throw error;
    }
  },

  // Delete tournament
  deleteTournament: async (id) => {
    console.log('🏟️ [TournamentServiceFixed] Deleting tournament:', id);
    try {
      const response = await apiClient.delete(`/api/tournaments/${id}`);
      console.log('✅ [TournamentServiceFixed] Delete tournament success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentServiceFixed] Delete tournament failed:', error);
      throw error;
    }
  },

  // Start tournament
  startTournament: async (id) => {
    console.log('🏟️ [TournamentServiceFixed] Starting tournament:', id);
    try {
      const response = await apiClient.post(`/api/tournaments/${id}/start`);
      console.log('✅ [TournamentServiceFixed] Start tournament success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentServiceFixed] Start tournament failed:', error);
      throw error;
    }
  },
};

export default tournamentServiceFixed;