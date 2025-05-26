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
    const response = await apiClient.get('/api/tournaments', { params });
    if (response.data && response.data.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination || {
          currentPage: params.page || 1,
          totalPages: Math.ceil((response.data.data?.length || 0) / (params.limit || 10)),
          totalItems: response.data.data?.length || 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }

    return response.data;
  },

  // Get tournament by ID
  getTournamentById: async (id) => {
    const response = await apiClient.get(`/api/tournaments/${id}`);
    return response.data;
  },

  // Create tournament
  createTournament: async (tournamentData) => {
    const response = await apiClient.post('/api/tournaments', tournamentData);
    return response.data;
  },

  // Update tournament
  updateTournament: async (id, tournamentData) => {
    const response = await apiClient.put(`/api/tournaments/${id}`, tournamentData);
    return response.data;
  },

  // Delete tournament
  deleteTournament: async (id) => {
    const response = await apiClient.delete(`/api/tournaments/${id}`);
    return response.data;
  },

  // Start tournament
  startTournament: async (id) => {
    const response = await apiClient.post(`/api/tournaments/${id}/start`);
    return response.data;
  },
};

// ==================== TOURNAMENT KNOCKOUT SERVICE ====================
export const tournamentKnockoutService = {
  // Generate tournament bracket
  generateBracket: async (tournamentId, bracketData) => {
    const response = await apiClient.post(`/api/tournaments/${tournamentId}/generate-bracket`, bracketData);
    return response.data;
  },

  // Start knockout tournament
  startKnockout: async (tournamentId) => {
    const response = await apiClient.post(`/api/tournaments/${tournamentId}/start-knockout`);
    return response.data;
  },

  // Advance to next round
  advanceRound: async (tournamentId) => {
    const response = await apiClient.post(`/api/tournaments/${tournamentId}/advance-round`);
    return response.data;
  },

  // Complete tournament
  completeTournament: async (tournamentId) => {
    const response = await apiClient.post(`/api/tournaments/${tournamentId}/complete`);
    return response.data;
  },
};

// ==================== TEAM SERVICE ====================
export const teamService = {
  
  // Get teams by tournament
  getTeamsByTournament: async (tournamentId) => {
    const response = await apiClient.get(`/api/tournaments/${tournamentId}/teams`);
    return response.data;
  },

  // Get team by ID
  getTeamById: async (id) => {
    const response = await apiClient.get(`/api/teams/${id}`);
    return response.data;
  },

  registerTeam: async ({ tournamentId, ...teamData }) => { 
    const response = await apiClient.post(`/api/tournaments/${tournamentId}/register`, teamData);
    return response.data;
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


  getAllTournamentsForDropdown: async () => {
    const response = await tournamentService.getAllTournaments({ limit: 9999 });
    return response.data; 
  }
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
    const response = await apiClient.get('/api/v1/news/${id}');
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

// ==================== USER SERVICE (for current user/profile) ====================
export const userService = {
  getCurrentUser: async () => {
    return authService.getAccount();
  },
};


// ==================== SYSTEM/ADMIN SERVICE ====================

export const systemService = {

};

// ==================== DEBUG SERVICE ====================
export const debugService = {
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
  // team: teamService, // Đã cập nhật
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

export const adminService = systemService;

export default apiServices;