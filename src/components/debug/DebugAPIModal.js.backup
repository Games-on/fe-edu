import React, { useState } from 'react';
import { X, Zap, AlertTriangle } from 'lucide-react';
import { teamService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const DebugAPIModal = ({ isOpen, onClose, tournament }) => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoints = [
    {
      name: 'Tournament Details',
      url: `/api/tournaments/${tournament?.id}`,
      method: 'GET'
    },
    {
      name: 'Tournament Teams',
      url: `/api/tournaments/${tournament?.id}/teams`,
      method: 'GET'
    },
    {
      name: 'Team Registration',
      url: `/api/tournaments/${tournament?.id}/register`,
      method: 'POST',
      data: {
        teamName: 'Debug Test Team',
        teamColor: '#FF0000',
        memberCount: 1,
        contactInfo: 'debug@test.com',
        notes: 'Debug test registration'
      }
    }
  ];

  const testAPI = async (endpoint) => {
    setIsLoading(true);
    try {
      console.log(`🧪 Testing ${endpoint.name}...`);
      
      let response;
      if (endpoint.method === 'GET') {
        response = await fetch(`http://localhost:8080${endpoint.url}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
      } else if (endpoint.method === 'POST') {
        response = await fetch(`http://localhost:8080${endpoint.url}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(endpoint.data)
        });
      }

      const data = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: response.status,
          success: response.ok,
          data: data,
          error: null
        }
      }));

      console.log(`✅ ${endpoint.name} test result:`, {
        status: response.status,
        data: data
      });

    } catch (error) {
      console.error(`❌ ${endpoint.name} test failed:`, error);
      
      setTestResults(prev => ({
        ...prev,
        [endpoint.name]: {
          status: 'ERROR',
          success: false,
          data: null,
          error: error.message
        }
      }));
    }
    setIsLoading(false);
  };

  const testAll = async () => {
    setTestResults({});
    for (const endpoint of testEndpoints) {
      await testAPI(endpoint);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">API Debug Tool</h2>
              <p className="text-sm text-gray-600">Test tournament registration endpoints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* User Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Current User Info</h3>
            <div className="text-sm text-blue-700">
              <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
              <p><strong>Role:</strong> {user?.role || 'Unknown'}</p>
              <p><strong>Token:</strong> {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</p>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Tournament Info</h3>
            <div className="text-sm text-green-700">
              <p><strong>ID:</strong> {tournament?.id}</p>
              <p><strong>Name:</strong> {tournament?.name}</p>
              <p><strong>Status:</strong> {tournament?.status}</p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-6">
            <button
              onClick={testAll}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>{isLoading ? 'Testing...' : 'Test All Endpoints'}</span>
            </button>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            {testEndpoints.map((endpoint) => {
              const result = testResults[endpoint.name];
              
              return (
                <div key={endpoint.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{endpoint.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {endpoint.method} {endpoint.url}
                      </span>
                      <button
                        onClick={() => testAPI(endpoint)}
                        disabled={isLoading}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
                      >
                        Test
                      </button>
                    </div>
                  </div>

                  {result && (
                    <div className="mt-2">
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        result.success 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Status: {result.status} {result.success ? '✅' : '❌'}
                      </div>
                      
                      {result.error && (
                        <div className="mt-2 text-sm text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}

                      {result.data && (
                        <div className="mt-2">
                          <details>
                            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                              Response Data
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  )}

                  {endpoint.data && (
                    <div className="mt-2">
                      <details>
                        <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                          Request Body
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(endpoint.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Debug Instructions</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>1. Kiểm tra backend có đang chạy tại localhost:8080 không</p>
              <p>2. Verify user đã login và có JWT token</p>
              <p>3. Test từng endpoint để xem endpoint nào bị lỗi</p>
              <p>4. Nếu có lỗi 500, check backend console logs</p>
              <p>5. Nếu có lỗi 401/403, check authentication/authorization</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugAPIModal;
