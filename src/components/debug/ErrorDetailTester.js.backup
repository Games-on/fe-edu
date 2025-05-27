import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const ErrorDetailTester = ({ isOpen, onClose, tournament }) => {
  const [errorDetails, setErrorDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getDetailedError = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    
    // Parse JWT to see user info
    let userInfo = {};
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userInfo = {
        userId: payload.sub,
        email: payload.email || payload.username,
        role: payload.role || payload.authorities,
        exp: new Date(payload.exp * 1000).toLocaleString()
      };
    } catch (e) {
      userInfo = { error: 'Cannot parse token' };
    }

    const testData = {
      teamName: 'Error Detail Test',
      memberCount: 1,
      contactInfo: 'error@test.com'
    };

    try {
      const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });

      // Get response text first, then try to parse as JSON
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { rawResponse: responseText };
      }

      setErrorDetails({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseData,
        userInfo,
        requestData: testData,
        timestamp: new Date().toLocaleString()
      });

    } catch (error) {
      setErrorDetails({
        success: false,
        error: error.message,
        userInfo,
        timestamp: new Date().toLocaleString()
      });
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Error Detail Analyzer</h2>
              <p className="text-sm text-gray-600">Get exact error message and user context</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <button
              onClick={getDetailedError}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{isLoading ? 'Analyzing Error...' : 'Get Detailed Error'}</span>
            </button>
          </div>

          {errorDetails && (
            <div className="space-y-6">
              {/* User Info Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Current User Info</h3>
                <pre className="text-sm bg-white p-3 rounded overflow-auto">
                  {JSON.stringify(errorDetails.userInfo, null, 2)}
                </pre>
              </div>

              {/* Response Section */}
              <div className={`border rounded-lg p-4 ${errorDetails.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`text-lg font-semibold mb-2 ${errorDetails.success ? 'text-green-800' : 'text-red-800'}`}>
                  Response Details
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <strong>Status:</strong> {errorDetails.status} {errorDetails.statusText}
                  </div>
                  <div>
                    <strong>Success:</strong> {errorDetails.success ? 'Yes' : 'No'}
                  </div>
                </div>
                
                {errorDetails.responseData && (
                  <div>
                    <strong>Response Body:</strong>
                    <pre className="text-sm bg-white p-3 rounded overflow-auto mt-2">
                      {JSON.stringify(errorDetails.responseData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Headers Section */}
              {errorDetails.headers && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Response Headers</h3>
                  <pre className="text-sm bg-white p-3 rounded overflow-auto">
                    {JSON.stringify(errorDetails.headers, null, 2)}
                  </pre>
                </div>
              )}

              {/* Request Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Request Sent</h3>
                <pre className="text-sm bg-white p-3 rounded overflow-auto">
                  {JSON.stringify(errorDetails.requestData, null, 2)}
                </pre>
              </div>

              {/* Instructions */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">🔍 Compare with Postman</h3>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Check if Postman uses different user/token</li>
                  <li>• Compare user roles (USER vs ADMIN vs ORGANIZER)</li>
                  <li>• Look for exact error message in response body</li>
                  <li>• Check if Access Denied is permission-related</li>
                </ul>
              </div>
            </div>
          )}

          {!errorDetails && (
            <div className="text-center py-8 text-gray-500">
              Click "Get Detailed Error" to analyze the registration failure
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDetailTester;
