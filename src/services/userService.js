import api from './api'; 
const userService = {
  getAllUsers: async ({ searchTerm, roleFilter, statusFilter }) => {

    const params = {};
    if (searchTerm) {
      params.search = searchTerm;
    }
    if (roleFilter) {
      params.role = roleFilter;
    }
    if (statusFilter) {
      params.status = statusFilter;
    }
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  toggleUserStatus: async (id, newStatus) => {
    const response = await api.patch(`/users/${id}/status`, { status: newStatus });
    return response.data;
  },
};

export default userService;