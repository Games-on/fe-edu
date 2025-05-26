import apiClient from './api';
import { 
  userManagementService, 
  adminUserService, 
  userProfileService, 
  passwordResetService, 
  roleManagementService 
} from './userManagement';

// ==================== AUTH SERVICE ====================
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data;
  },

  // Get current user account
  getAccount: async () => {
    const response = await apiClient.get('/api/v1/auth/account');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiClient.post('/api/v1/auth/refresh');
    return response.data;
  },
};

// ==================== TOURNAMENT SERVICE ====================
export const tournamentService = {
  // Get all tournaments
  getAllTournaments: async (params = {}) => {
    console.log('🏟️ [TournamentService] Getting all tournaments with params:', params);
    try {
      const response = await apiClient.get('/api/tournaments', { params });
      console.log('✅ [TournamentService] Get all tournaments success:', response);
      
      // Backend returns PaginatedResponseDTO format
      // Transform to expected frontend format
      if (response && response.data) {
        return {
          data: response.data,
          pagination: response.pagination || {
            currentPage: params.page || 1,
            totalPages: Math.ceil((response.data?.length || 0) / (params.limit || 10)),
            totalItems: response.data?.length || 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ [TournamentService] Get all tournaments failed:', error);
      throw error;
    }
  },

  // Get tournament by ID
  getTournamentById: async (id) => {
    console.log('🏟️ [TournamentService] Getting tournament by ID:', id);
    try {
      const response = await apiClient.get(`/api/tournaments/${id}`);
      console.log('✅ [TournamentService] Get tournament by ID success:', response);
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
      return response;
    } catch (error) {
      console.error('❌ [TournamentService] Start tournament failed:', error);
      throw error;
    }
  },
};

// ==================== TOURNAMENT KNOCKOUT SERVICE ====================
export const tournamentKnockoutService = {
  // Generate tournament bracket
  generateBracket: async (tournamentId, bracketData) => {
    console.log('🎯 [TournamentKnockout] Generating bracket for tournament:', tournamentId);
    console.log('Data:', bracketData);
    try {
      const response = await apiClient.post(`/api/tournaments/${tournamentId}/generate-bracket`, bracketData);
      console.log('✅ [TournamentKnockout] Generate bracket success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentKnockout] Generate bracket failed:', error);
      throw error;
    }
  },

  // Start knockout tournament
  startKnockout: async (tournamentId) => {
    console.log('🚀 [TournamentKnockout] Starting knockout tournament:', tournamentId);
    try {
      const response = await apiClient.post(`/api/tournaments/${tournamentId}/start-knockout`);
      console.log('✅ [TournamentKnockout] Start knockout success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentKnockout] Start knockout failed:', error);
      throw error;
    }
  },

  // Advance to next round
  advanceRound: async (tournamentId) => {
    console.log('⏭️ [TournamentKnockout] Advancing round for tournament:', tournamentId);
    try {
      const response = await apiClient.post(`/api/tournaments/${tournamentId}/advance-round`);
      console.log('✅ [TournamentKnockout] Advance round success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentKnockout] Advance round failed:', error);
      throw error;
    }
  },

  // Complete tournament
  completeTournament: async (tournamentId) => {
    console.log('🏆 [TournamentKnockout] Completing tournament:', tournamentId);
    try {
      const response = await apiClient.post(`/api/tournaments/${tournamentId}/complete`);
      console.log('✅ [TournamentKnockout] Complete tournament success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TournamentKnockout] Complete tournament failed:', error);
      throw error;
    }
  },
};

// ==================== TEAM SERVICE ====================
export const teamService = {
  // Get teams by tournament
  getTeamsByTournament: async (tournamentId) => {
    console.log('👥 [TeamService] Getting teams by tournament ID:', tournamentId);
    try {
      const response = await apiClient.get(`/api/tournaments/${tournamentId}/teams`);
      console.log('✅ [TeamService] Get teams by tournament success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TeamService] Get teams by tournament failed:', error);
      throw error;
    }
  },

  // Get team by ID
  getTeamById: async (id) => {
    const response = await apiClient.get(`/api/teams/${id}`);
    return response.data;
  },

  // Register team for tournament
  registerTeam: async (tournamentId, teamData) => {
    console.log('🚀 [TeamService] Register team request:');
    console.log('  Tournament ID:', tournamentId);
    console.log('  Team Data:', teamData);
    console.log('  Full URL:', `/api/tournaments/${tournamentId}/register`);
    console.log('  Token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');
    
    try {
      const response = await apiClient.post(`/api/tournaments/${tournamentId}/register`, teamData);
      console.log('✅ [TeamService] Register team success:', response);
      return response;
    } catch (error) {
      console.error('❌ [TeamService] Register team failed:');
      console.error('  Status:', error.response?.status);
      console.error('  Data:', error.response?.data);
      console.error('  Headers:', error.response?.headers);
      console.error('  Request config:', error.config);
      throw error;
    }
  },

  // Update team
  updateTeam: async (id, teamData) => {
    const response = await apiClient.put(`/api/teams/${id}`, teamData);
    return response.data;
  },

  // Delete team
  deleteTeam: async (id) => {
    const response = await apiClient.delete(`/api/teams/${id}`);
    return response.data;
  },
};

// ==================== MATCH SERVICE ====================
export const matchService = {
  // Get matches by tournament
  getMatchesByTournament: async (tournamentId, params = {}) => {
    const response = await apiClient.get(`/api/tournaments/${tournamentId}/matches`, { params });
    return response.data;
  },

  // Get match by ID
  getMatchById: async (id) => {
    const response = await apiClient.get(`/api/matches/${id}`);
    return response.data;
  },

  // Create match
  createMatch: async (tournamentId, matchData) => {
    const response = await apiClient.post(`/api/tournaments/${tournamentId}/matches`, matchData);
    return response.data;
  },

  // Update match score
  updateMatchScore: async (id, scoreData) => {
    const response = await apiClient.put(`/api/matches/${id}/score`, scoreData);
    return response.data;
  },

  // Update match status
  updateMatchStatus: async (id, statusData) => {
    const response = await apiClient.put(`/api/matches/${id}/status`, statusData);
    return response.data;
  },

  // Get tournament bracket
  getTournamentBracket: async (tournamentId) => {
    const response = await apiClient.get(`/api/tournaments/${tournamentId}/bracket`);
    return response.data;
  },
};

// ==================== NEWS SERVICE ====================
export const newsService = {
  // Get all news
  getAllNews: async () => {
    const response = await apiClient.get('/api/v1/news');
    return response.data;
  },

  // Get news by ID
  getNewsById: async (id) => {
    const response = await apiClient.get(`/api/v1/news/${id}`);
    return response.data;
  },

  // Create news
  createNews: async (newsData) => {
    const response = await apiClient.post('/api/v1/news', newsData);
    return response.data;
  },

  // Update news
  updateNews: async (id, newsData) => {
    const response = await apiClient.put(`/api/v1/news/${id}`, newsData);
    return response.data;
  },

  // Delete news
  deleteNews: async (id) => {
    const response = await apiClient.delete(`/api/v1/news/${id}`);
    return response.data;
  },

  // Upload files for news
  uploadFiles: async (newsId, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await apiClient.post(`/api/v1/news/uploads/${newsId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get image
  getImage: async (imageName) => {
    const response = await apiClient.get(`/api/v1/news/image/${imageName}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

// ==================== USER MANAGEMENT SERVICE ====================
// Note: Backend doesn't have dedicated admin/user management endpoints
// These would need to be implemented in backend
export const userService = {
  // Get current user profile (using auth account endpoint)
  getCurrentUser: async () => {
    return authService.getAccount();
  },

  // Note: The following endpoints need to be implemented in backend
  // getAllUsers: async (params = {}) => { /* Backend needs implementation */ },
  // updateUser: async (userId, userData) => { /* Backend needs implementation */ },
  // deleteUser: async (userId) => { /* Backend needs implementation */ },
  // getUserById: async (userId) => { /* Backend needs implementation */ },
};

// ==================== SYSTEM/ADMIN SERVICE ====================
// Note: Backend doesn't have system/admin endpoints
// These would need to be implemented in backend
export const systemService = {
  // Note: The following endpoints need to be implemented in backend
  // getSystemStats: async () => { /* Backend needs implementation */ },
  // getSystemHealth: async () => { /* Backend needs implementation */ },
  // getApplicationLogs: async (params = {}) => { /* Backend needs implementation */ },
};

// ==================== DEBUG SERVICE ====================
// Note: Backend has DebugController but endpoints are not documented
export const debugService = {
  // Note: Check backend DebugController for available endpoints
  // Backend implementation needed for proper debug endpoints
};

// ==================== USER MANAGEMENT SERVICE ====================
export { 
  userManagementService,
  adminUserService,
  userProfileService, 
  passwordResetService,
  roleManagementService
};

// ==================== EXPORT ALL SERVICES ====================
export const apiServices = {
  auth: authService,
  tournament: tournamentService,
  tournamentKnockout: tournamentKnockoutService,
  team: teamService,
  match: matchService,
  news: newsService,
  user: userService,
  userManagement: userManagementService,
  adminUser: adminUserService,
  userProfile: userProfileService,
  passwordReset: passwordResetService,
  roleManagement: roleManagementService,
  system: systemService,
  debug: debugService,
};

// For backward compatibility
export const adminService = systemService;

export default apiServices;
