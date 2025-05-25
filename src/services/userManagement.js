// Import the enhanced API client
import apiClient from './api';

// ==================== USER MANAGEMENT SERVICE ====================
export const userManagementService = {
  // Admin user management APIs
  admin: {
    // Get all users with pagination and filtering
    getAllUsers: async (params = {}) => {
      const response = await apiClient.get('/api/v1/admin/users', { params });
      return response;
    },

    // Get user by ID  
    getUserById: async (id) => {
      const response = await apiClient.get(`/api/v1/admin/users/${id}`);
      return response;
    },

    // Create new user
    createUser: async (userData) => {
      const response = await apiClient.post('/api/v1/admin/users', userData);
      return response;
    },

    // Update user
    updateUser: async (id, userData) => {
      const response = await apiClient.put(`/api/v1/admin/users/${id}`, userData);
      return response;
    },

    // Delete user (soft delete)
    deleteUser: async (id) => {
      const response = await apiClient.delete(`/api/v1/admin/users/${id}`);
      return response;
    },

    // Toggle user status
    toggleUserStatus: async (id, isActive) => {
      const response = await apiClient.patch(`/api/v1/admin/users/${id}/status`, null, {
        params: { isActive }
      });
      return response;
    },

    // Assign roles to user
    assignRoles: async (id, roles) => {
      const response = await apiClient.patch(`/api/v1/admin/users/${id}/roles`, roles);
      return response;
    },

    // Reset user password
    resetUserPassword: async (id, newPassword) => {
      const response = await apiClient.patch(`/api/v1/admin/users/${id}/reset-password`, null, {
        params: { newPassword }
      });
      return response;
    },

    // Get user statistics
    getUserStatistics: async () => {
      const response = await apiClient.get('/api/v1/admin/users/statistics');
      return response;
    },

    // Bulk delete users
    bulkDeleteUsers: async (userIds) => {
      const response = await apiClient.delete('/api/v1/admin/users/bulk', {
        data: userIds
      });
      return response;
    },

    // Export users to CSV
    exportUsers: async (params = {}) => {
      const response = await apiClient.get('/api/v1/admin/users/export', { 
        params,
        responseType: 'text'
      });
      return response;
    },
  },

  // User profile management
  profile: {
    // Get current user profile
    getProfile: async () => {
      const response = await apiClient.get('/api/v1/user/profile');
      return response;
    },

    // Update profile
    updateProfile: async (profileData) => {
      const response = await apiClient.put('/api/v1/user/profile', profileData);
      return response;
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
      const response = await apiClient.patch('/api/v1/user/profile/change-password', null, {
        params: { currentPassword, newPassword }
      });
      return response;
    },

    // Upload avatar
    uploadAvatar: async (file, onUploadProgress) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/api/v1/user/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      });
      return response;
    },

    // Delete avatar
    deleteAvatar: async () => {
      const response = await apiClient.delete('/api/v1/user/profile/avatar');
      return response;
    },

    // Deactivate account
    deactivateAccount: async () => {
      const response = await apiClient.patch('/api/v1/user/profile/deactivate');
      return response;
    },
  },

  // Password reset
  passwordReset: {
    // Send forgot password email
    forgotPassword: async (email) => {
      const response = await apiClient.post('/api/v1/auth/password/forgot', null, {
        params: { email }
      });
      return response;
    },

    // Verify reset token
    verifyResetToken: async (token) => {
      const response = await apiClient.get('/api/v1/auth/password/reset/verify', {
        params: { token }
      });
      return response;
    },

    // Reset password with token
    resetPassword: async (token, newPassword) => {
      const response = await apiClient.post('/api/v1/auth/password/reset', null, {
        params: { token, newPassword }
      });
      return response;
    },
  },

  // Role management
  roles: {
    // Get all roles
    getAllRoles: async () => {
      const response = await apiClient.get('/api/v1/admin/roles');
      return response;
    },

    // Get role statistics
    getRoleStatistics: async () => {
      const response = await apiClient.get('/api/v1/admin/roles/statistics');
      return response;
    },

    // Get users by role
    getUsersByRole: async (roleName) => {
      const response = await apiClient.get(`/api/v1/admin/roles/${roleName}/users`);
      return response;
    },
  },
};

// Export for backward compatibility
export const adminUserService = userManagementService.admin;
export const userProfileService = userManagementService.profile;
export const passwordResetService = userManagementService.passwordReset;
export const roleManagementService = userManagementService.roles;
