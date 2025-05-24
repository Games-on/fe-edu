import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminPanelSimple = () => {
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';

  if (!isAdmin && !isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Current role: {user?.role || 'None'}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">
                Welcome, {user?.name || user?.email} ({user?.role})
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎉 Admin Panel Working!</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="text-green-800 font-medium">✅ Authentication: Working</p>
              <p className="text-green-700 text-sm">User role verified: {user?.role}</p>
            </div>
            
            <div className="p-4 bg-blue-100 rounded-lg">
              <p className="text-blue-800 font-medium">✅ Routes: Working</p>
              <p className="text-blue-700 text-sm">Admin route accessible</p>
            </div>
            
            <div className="p-4 bg-purple-100 rounded-lg">
              <p className="text-purple-800 font-medium">✅ Components: Loading</p>
              <p className="text-purple-700 text-sm">Admin panel components ready</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Available Management Sections:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="font-medium">👥 Users</p>
                <p className="text-sm text-gray-600">Manage system users</p>
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="font-medium">🏆 Tournaments</p>
                <p className="text-sm text-gray-600">Manage tournaments</p>
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="font-medium">⚽ Matches</p>
                <p className="text-sm text-gray-600">Manage matches</p>
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="font-medium">📰 News</p>
                <p className="text-sm text-gray-600">Manage news</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800 font-medium">🚧 Development Mode</p>
            <p className="text-yellow-700 text-sm">
              This is a simplified version. The full admin panel with all features is ready to be activated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelSimple;