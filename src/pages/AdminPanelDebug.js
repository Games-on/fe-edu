import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminPanelDebug = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';
  const hasAccess = isAdmin || isOrganizer;

  const token = localStorage.getItem('accessToken');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <p className="text-sm"><strong>Debug Info:</strong></p>
            <p className="text-sm">Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
            <p className="text-sm">User Role: {user?.role || 'None'}</p>
            <p className="text-sm">Required: ADMIN or ORGANIZER</p>
            <p className="text-sm">Token: {token ? 'Present' : 'Missing'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel - Debug Mode</h1>
              <p className="text-gray-600">
                Authentication & Authorization Testing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Authentication Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              {isAuthenticated ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              Authentication Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Loading:</span>
                <span>{isLoading ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Error:</span>
                <span className="text-red-600">{error || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Token Present:</span>
                <span className={token ? 'text-green-600' : 'text-red-600'}>
                  {token ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              {hasAccess ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              User Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <span className={`font-medium ${
                  isAdmin ? 'text-red-600' : 
                  isOrganizer ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {user?.role || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Admin Access:</span>
                <span className={isAdmin ? 'text-green-600' : 'text-red-600'}>
                  {isAdmin ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Organizer Access:</span>
                <span className={isOrganizer ? 'text-green-600' : 'text-red-600'}>
                  {isOrganizer ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Admin Panel Access Granted!
            </h2>
            <p className="text-gray-600 mb-6">
              Authentication successful. You have {isAdmin ? 'Administrator' : 'Organizer'} privileges.
            </p>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 font-medium">✅ All Systems Ready</p>
              <p className="text-green-700 text-sm mt-1">
                The admin panel is working correctly and ready for full functionality.
              </p>
            </div>
          </div>
        </div>

        {/* Available Features */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Available Management Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">👥 User Management</h4>
              <p className="text-sm text-green-700 mt-1">
                View, edit, and manage system users
              </p>
            </div>
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">🏆 Tournament Management</h4>
              <p className="text-sm text-blue-700 mt-1">
                Create and manage tournaments
              </p>
            </div>
            <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800">⚽ Match Management</h4>
              <p className="text-sm text-purple-700 mt-1">
                Schedule and track match results
              </p>
            </div>
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800">📰 News Management</h4>
              <p className="text-sm text-orange-700 mt-1">
                Create and publish news articles
              </p>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🔧 Debug Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Token Info:</h4>
              <div className="bg-white p-3 rounded border text-xs font-mono break-all">
                {token ? `${token.substring(0, 50)}...` : 'No token'}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">User Object:</h4>
              <div className="bg-white p-3 rounded border text-xs font-mono">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelDebug;