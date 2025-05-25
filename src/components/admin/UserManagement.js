import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Users,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    Shield,
    Crown,
    User,
    AlertTriangle,
    Download,
    Upload,
    MoreVertical,
    UserPlus,
    Key,
    UserX,
    UserCheck
} from 'lucide-react';
import { adminUserService, roleManagementService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import UserModal from './UserModal';
import UserDetailModal from './UserDetailModal';
import ConfirmModal from './ConfirmModal';

const UserManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(0); // Backend uses 0-based pagination
    const [size] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [sortDirection, setSortDirection] = useState('ASC');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const queryClient = useQueryClient();

    // Fetch users with pagination and filters
    const { data: usersResponse, isLoading, error } = useQuery(
        ['admin-users', { page, size, sortBy, sortDirection, search: searchTerm, role: roleFilter, isActive: statusFilter }],
        () => adminUserService.getAllUsers({
            page,
            size,
            sortBy,
            sortDirection,
            search: searchTerm || undefined,
            role: roleFilter || undefined,
            isActive: statusFilter !== '' ? statusFilter === 'true' : undefined
        }),
        {
            staleTime: 30 * 1000, // 30 seconds
            keepPreviousData: true,
            onError: (error) => {
                console.error('Error fetching users:', error);
                toast.error('Failed to load users');
            }
        }
    );

    // Fetch user statistics
    const { data: userStats } = useQuery(
        'user-statistics',
        () => adminUserService.getUserStatistics(),
        {
            staleTime: 5 * 60 * 1000, // 5 minutes
            onError: (error) => {
                console.error('Error fetching user statistics:', error);
            }
        }
    );

    // Fetch roles for dropdown
    const { data: rolesResponse } = useQuery(
        'roles',
        () => roleManagementService.getAllRoles(),
        {
            staleTime: 10 * 60 * 1000, // 10 minutes
            onError: (error) => {
                console.error('Error fetching roles:', error);
            }
        }
    );

    // Mutations
    const createUserMutation = useMutation(
        (userData) => adminUserService.createUser(userData),
        {
            onSuccess: () => {
                toast.success('User created successfully');
                queryClient.invalidateQueries('admin-users');
                queryClient.invalidateQueries('user-statistics');
                setIsCreateModalOpen(false);
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Failed to create user');
            }
        }
    );

    const updateUserMutation = useMutation(
        ({ id, userData }) => adminUserService.updateUser(id, userData),
        {
            onSuccess: () => {
                toast.success('User updated successfully');
                queryClient.invalidateQueries('admin-users');
                setIsEditModalOpen(false);
                setSelectedUser(null);
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Failed to update user');
            }
        }
    );

    const deleteUserMutation = useMutation(
        (id) => adminUserService.deleteUser(id),
        {
            onSuccess: () => {
                toast.success('User deleted successfully');
                queryClient.invalidateQueries('admin-users');
                queryClient.invalidateQueries('user-statistics');
                setIsDeleteModalOpen(false);
                setSelectedUser(null);
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Failed to delete user');
            }
        }
    );

    const toggleStatusMutation = useMutation(
        ({ id, isActive }) => adminUserService.toggleUserStatus(id, isActive),
        {
            onSuccess: () => {
                toast.success('User status updated successfully');
                queryClient.invalidateQueries('admin-users');
                queryClient.invalidateQueries('user-statistics');
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Failed to update user status');
            }
        }
    );

    const resetPasswordMutation = useMutation(
        ({ id, newPassword }) => adminUserService.resetUserPassword(id, newPassword),
        {
            onSuccess: () => {
                toast.success('Password reset successfully');
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Failed to reset password');
            }
        }
    );

    const bulkDeleteMutation = useMutation(
        (userIds) => adminUserService.bulkDeleteUsers(userIds),
        {
            onSuccess: () => {
                toast.success(`${selectedUsers.length} users deleted successfully`);
                queryClient.invalidateQueries('admin-users');
                queryClient.invalidateQueries('user-statistics');
                setSelectedUsers([]);
            },
            onError: (error) => {
                toast.error(error.errorMessage || 'Failed to delete users');
            }
        }
    );

    // Event handlers
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0); // Reset to first page
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
        setPage(0);
    };

    const handleToggleStatus = (user) => {
        toggleStatusMutation.mutate({
            id: user.id,
            isActive: !user.isActive
        });
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleResetPassword = (user) => {
        const newPassword = prompt('Enter new password for ' + user.name + ':');
        if (newPassword && newPassword.length >= 6) {
            resetPasswordMutation.mutate({
                id: user.id,
                newPassword
            });
        } else if (newPassword) {
            toast.error('Password must be at least 6 characters long');
        }
    };

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select users to delete');
            return;
        }
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
            bulkDeleteMutation.mutate(selectedUsers);
        }
    };

    const handleExportUsers = async () => {
        try {
            const response = await adminUserService.exportUsers({
                search: searchTerm || undefined,
                role: roleFilter || undefined,
                isActive: statusFilter !== '' ? statusFilter === 'true' : undefined
            });

            // Create and download CSV file
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Users exported successfully');
        } catch (error) {
            toast.error('Failed to export users');
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedUsers(usersResponse?.data?.content?.map(user => user.id) || []);
        } else {
            setSelectedUsers([]);
        }
    };

    // Helper functions
    const getRoleIcon = (role) => {
        const roleArray = Array.isArray(role) ? role : [role];
        if (roleArray.includes('ADMIN')) {
            return <Crown className="h-4 w-4 text-yellow-500" />;
        } else if (roleArray.includes('ORGANIZER')) {
            return <Shield className="h-4 w-4 text-blue-500" />;
        } else {
            return <User className="h-4 w-4 text-gray-500" />;
        }
    };

    const getRoleBadge = (roles) => {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        const primaryRole = roleArray[0];
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

        switch (primaryRole) {
            case 'ADMIN':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'ORGANIZER':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'STUDENT':
                return `${baseClasses} bg-green-100 text-green-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    if (error) {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">Error loading users. Please try again later.</p>
                <button
                    onClick={() => queryClient.invalidateQueries('admin-users')}
                    className="btn-primary mt-4"
                >
                    Retry
                </button>
            </div>
        );
    }

    const users = usersResponse?.data;
    const totalUsers = userStats?.data?.totalUsers || 0;
    const activeUsers = userStats?.data?.activeUsers || 0;
    const availableRoles = rolesResponse?.data || [];

    return (
        <div className="space-y-6">
            {/* Header with Statistics */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {totalUsers} Total Users
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {activeUsers} Active
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 input-field"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="input-field min-w-[120px]"
                        >
                            <option value="">All Roles</option>
                            {availableRoles.map((role) => (
                                <option key={role.name} value={role.name}>{role.name}</option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-field min-w-[120px]"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>

                        <button
                            type="submit"
                            className="btn-primary whitespace-nowrap"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Apply
                        </button>
                    </div>
                </form>
            </div>

            {/* Actions Bar */}
            {selectedUsers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleBulkDelete}
                                className="btn-secondary text-red-600 hover:bg-red-50"
                                disabled={bulkDeleteMutation.isLoading}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedUsers([])}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleExportUsers}
                    className="btn-secondary"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <LoadingSpinner />
                    </div>
                ) : users?.content?.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === users?.content?.length && users?.content?.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('name')}
                                >
                                    User {sortBy === 'name' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('isActive')}
                                >
                                    Status {sortBy === 'isActive' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                                    onClick={() => handleSort('createdAt')}
                                >
                                    Created {sortBy === 'createdAt' && (sortDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Login
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {users?.content?.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleSelectUser(user.id)}
                                            className="rounded border-gray-300"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {user.avatar ? (
                                                    <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                {user.phone && (
                                                    <div className="text-xs text-gray-400">{user.phone}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            {getRoleIcon(user.roles)}
                                            <span className={getRoleBadge(user.roles)}>
                          {Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}
                        </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleViewUser(user)}
                                                className="text-gray-600 hover:text-primary-600 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(user)}
                                                className="text-gray-600 hover:text-purple-600 transition-colors"
                                                title="Reset Password"
                                            >
                                                <Key className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`transition-colors ${
                                                    user.isActive
                                                        ? 'text-gray-600 hover:text-red-600'
                                                        : 'text-gray-600 hover:text-green-600'
                                                }`}
                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                                disabled={toggleStatusMutation.isLoading}
                                            >
                                                {user.isActive ? (
                                                    <UserX className="h-4 w-4" />
                                                ) : (
                                                    <UserCheck className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                className="text-gray-600 hover:text-red-600 transition-colors"
                                                title="Delete User"
                                                disabled={deleteUserMutation.isLoading}
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
                )}

                {/* Pagination */}
                {users && users.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {users.page * users.size + 1} to {Math.min((users.page + 1) * users.size, users.totalElements)} of {users.totalElements} results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={users.first}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {page + 1} of {users.totalPages}
                </span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={users.last}
                                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isCreateModalOpen && (
                <UserModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={(userData) => createUserMutation.mutate(userData)}
                    isLoading={createUserMutation.isLoading}
                    availableRoles={availableRoles}
                    title="Create New User"
                />
            )}

            {isEditModalOpen && selectedUser && (
                <UserModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onSubmit={(userData) => updateUserMutation.mutate({ id: selectedUser.id, userData })}
                    isLoading={updateUserMutation.isLoading}
                    availableRoles={availableRoles}
                    initialData={selectedUser}
                    title="Edit User"
                />
            )}

            {isDetailModalOpen && selectedUser && (
                <UserDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />
            )}

            {isDeleteModalOpen && selectedUser && (
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setSelectedUser(null);
                    }}
                    onConfirm={() => deleteUserMutation.mutate(selectedUser.id)}
                    isLoading={deleteUserMutation.isLoading}
                    title="Delete User"
                    message={`Are you sure you want to delete "${selectedUser.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    confirmButtonClass="btn-danger"
                />
            )}
        </div>
    );
};

export default UserManagement;