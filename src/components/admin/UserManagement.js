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
  Mail,
  Calendar,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers'; // Đảm bảo formatDate có sẵn
import toast from 'react-hot-toast';
import { userService } from '../../services';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  // const [statusFilter, setStatusFilter] = useState(''); // Không cần nữa vì bỏ cột status
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: users, isLoading } = useQuery(
    // Key của query bây giờ sẽ bao gồm các filter để React Query refetch khi chúng thay đổi
    ['users', { search: searchTerm, role: roleFilter }], // Bỏ statusFilter
    // Gọi hàm từ userService
    () => userService.getAllUsers({ searchTerm, roleFilter }), // Bỏ statusFilter
    {
      staleTime: 5 * 60 * 1000, // 5 phút
      onError: (error) => {
        toast.error('Failed to fetch users: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  const queryClient = useQueryClient();

  // Mutations
  const updateUserMutation = useMutation(
    ({ id, userData }) => userService.updateUser(id, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User updated successfully');
        setShowEditModal(false);
      },
      onError: (error) => {
        toast.error('Failed to update user: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  const deleteUserMutation = useMutation(
    (userId) => userService.deleteUser(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error('Failed to delete user: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  const toggleUserStatusMutation = useMutation(
    ({ userId, newStatus }) => userService.toggleUserStatus(userId, newStatus),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('users');
        toast.success(`User status changed to ${data.status || data.newStatus.toLowerCase()} successfully`);
      },
      onError: (error) => {
        toast.error('Failed to update user status: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  const addUserMutation = useMutation(
    (userData) => userService.createUser(userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        toast.success('User added successfully');
        setShowAddModal(false);
      },
      onError: (error) => {
        toast.error('Failed to add user: ' + (error.response?.data?.message || error.message));
      }
    }
  );


  const displayUsers = users || [];

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

  // Lấy role từ mảng roles
  const getUserRoleName = (user) => {
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name; // Lấy tên của role đầu tiên
    }
    return 'N/A'; // Hoặc một giá trị mặc định khác nếu không có role
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ORGANIZER', label: 'Organizer' },
    { value: 'USER', label: 'User' }
  ];

  // Bỏ statusOptions vì không dùng nữa
  // const statusOptions = [
  //   { value: '', label: 'All Status' },
  //   { value: 'ACTIVE', label: 'Active' },
  //   { value: 'INACTIVE', label: 'Inactive' },
  //   { value: 'SUSPENDED', label: 'Suspended' }
  // ];

  const getRoleColor = (roleName) => { // Tham số giờ là roleName
    switch (roleName) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Sửa grid-cols-4 thành grid-cols-3 */}
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

          {/* Xóa select cho Status Filter */}
          {/* <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select> */}

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
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                {/* Đã bỏ cột Status */}
                {/* Đã bỏ cột Activity */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id}
                  </td>
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(getUserRoleName(user))}`}>
                      {getUserRoleName(user)} {/* Sử dụng hàm mới để lấy tên role */}
                    </span>
                  </td>
                  {/* Đã bỏ cột Status */}
                  {/* Đã bỏ cột Activity */}
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
                      {/* Có thể bỏ nút toggle status nếu bạn không muốn quản lý active/inactive */}
                      {/* Nếu vẫn muốn quản lý status, bạn cần thêm lại cột status và logic của nó,
                          hoặc chỉ giữ nút này nếu backend vẫn có trường 'active' */}
                      {user.active !== undefined && ( // Chỉ hiển thị nút này nếu có trường 'active'
                        <button
                          onClick={() => handleToggleStatus(user.id, user.active ? 'ACTIVE' : 'INACTIVE')}
                          className={`${
                            user.active
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={user.active ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                      )}
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

        {displayUsers.length === 0 && (
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
          Showing {displayUsers.length} of {users?.length || 0} users
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary">Previous</button>
          <button className="btn-secondary">Next</button>
        </div>
      </div>

      {/* Placeholders for Add/Edit Modals (you'll need to create these components) */}
      {/* <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddUser={(userData) => addUserMutation.mutate(userData)}
        isAdding={addUserMutation.isLoading}
      />

      <EditUserModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onUpdateUser={({ id, data }) => updateUserMutation.mutate({ id, data })}
        isUpdating={updateUserMutation.isLoading}
      /> */}
    </div>
  );
};

export default UserManagement;