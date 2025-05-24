import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data - replace with real API calls
  const { data: users, isLoading } = useQuery(
    ['users', { search: searchTerm, role: roleFilter, status: statusFilter }],
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@gmail.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          createdAt: '2024-01-15T10:00:00Z',
          lastLogin: '2024-05-24T08:30:00Z',
          teamsCount: 0,
          tournamentsCreated: 15
        },
        {
          id: 2,
          name: 'John Organizer',
          email: 'organizer@gmail.com',
          role: 'ORGANIZER',
          status: 'ACTIVE',
          createdAt: '2024-02-10T14:20:00Z',
          lastLogin: '2024-05-23T16:45:00Z',
          teamsCount: 0,
          tournamentsCreated: 8
        },
        {
          id: 3,
          name: 'Team Captain',
          email: 'user@gmail.com',
          role: 'USER',
          status: 'ACTIVE',
          createdAt: '2024-03-05T09:15:00Z',
          lastLogin: '2024-05-24T07:20:00Z',
          teamsCount: 2,
          tournamentsCreated: 0
        },
        {
          id: 4,
          name: 'Inactive User',
          email: 'inactive@gmail.com',
          role: 'USER',
          status: 'INACTIVE',
          createdAt: '2024-01-20T11:30:00Z',
          lastLogin: '2024-04-15T12:00:00Z',
          teamsCount: 1,
          tournamentsCreated: 0
        }
      ];
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const queryClient = useQueryClient();

  // Mutations
  const updateUserMutation = useMutation(
    async ({ userId, userData }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...userData, id: userId };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User updated successfully');
        setShowEditModal(false);
      },
      onError: () => {
        toast.error('Failed to update user');
      }
    }
  );

  const deleteUserMutation = useMutation(
    async (userId) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return userId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete user');
      }
    }
  );

  const toggleUserStatusMutation = useMutation(
    async ({ userId, newStatus }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { userId, newStatus };
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('users');
        toast.success(`User ${data.newStatus.toLowerCase()} successfully`);
      },
      onError: () => {
        toast.error('Failed to update user status');
      }
    }
  );

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleUserStatusMutation.mutate({ userId, newStatus });
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ORGANIZER', label: 'Organizer' },
    { value: 'USER', label: 'User' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'ORGANIZER':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage system users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Teams: {user.teamsCount}</div>
                      <div>Tournaments: {user.tournamentsCreated}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className={`${
                          user.status === 'ACTIVE' 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.status === 'ACTIVE' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {filteredUsers.length} of {users?.length || 0} users
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary">Previous</button>
          <button className="btn-secondary">Next</button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;