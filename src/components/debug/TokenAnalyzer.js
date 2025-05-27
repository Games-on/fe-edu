import React, { useState } from 'react';
import { X, Key, User, Shield } from 'lucide-react';

const TokenAnalyzer = ({ isOpen, onClose }) => {
  const [tokenInfo, setTokenInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeToken = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setTokenInfo({ error: 'No token found' });
      setIsLoading(false);
      return;
    }

    try {
      // Decode JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        setTokenInfo({ error: 'Invalid token format' });
        setIsLoading(false);
        return;
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      // Test authentication
      const authResponse = await fetch('http://localhost:8080/api/v1/auth/account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const authData = await authResponse.json();

      setTokenInfo({
        token: {
          header,
          payload,
          signature: parts[2].substring(0, 20) + '...',
          fullToken: token.substring(0, 50) + '...'
        },
        authTest: {
          status: authResponse.status,
          success: authResponse.ok,
          data: authData
        },
        analysis: {
          subject: payload.sub,
          roles: payload.roles,
          authorities: payload.authorities,
          scope: payload.scope,
          exp: new Date(payload.exp * 1000).toLocaleString(),
          iat: new Date(payload.iat * 1000).toLocaleString()
        }
      });
    } catch (error) {
      setTokenInfo({ error: error.message });
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Key className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">JWT Token Analyzer</h2>
              <p className="text-sm text-gray-600">Analyze JWT structure and roles format</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <button
              onClick={analyzeToken}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Key className="h-4 w-4" />
              <span>{isLoading ? 'Analyzing...' : 'Analyze JWT Token'}</span>
            </button>
          </div>

          {tokenInfo && (
            <div className="space-y-6">
              {tokenInfo.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                  <p className="text-red-700">{tokenInfo.error}</p>
                </div>
              ) : (
                <>
                  {/* Token Structure */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      JWT Token Structure
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <strong>Header:</strong>
                        <pre className="text-sm bg-white p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(tokenInfo.token.header, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <strong>Payload:</strong>
                        <pre className="text-sm bg-white p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(tokenInfo.token.payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <strong>Signature:</strong>
                        <code className="text-sm bg-white p-2 rounded block mt-1">
                          {tokenInfo.token.signature}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Token Analysis
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Subject (User):</strong>
                        <p className="text-sm">{tokenInfo.analysis.subject}</p>
                      </div>
                      <div>
                        <strong>Roles:</strong>
                        <p className="text-sm">{JSON.stringify(tokenInfo.analysis.roles)}</p>
                      </div>
                      <div>
                        <strong>Authorities:</strong>
                        <p className="text-sm">{JSON.stringify(tokenInfo.analysis.authorities)}</p>
                      </div>
                      <div>
                        <strong>Scope:</strong>
                        <p className="text-sm">{JSON.stringify(tokenInfo.analysis.scope)}</p>
                      </div>
                      <div>
                        <strong>Issued At:</strong>
                        <p className="text-sm">{tokenInfo.analysis.iat}</p>
                      </div>
                      <div>
                        <strong>Expires At:</strong>
                        <p className="text-sm">{tokenInfo.analysis.exp}</p>
                      </div>
                    </div>
                  </div>

                  {/* Auth Test */}
                  <div className={`border rounded-lg p-4 ${tokenInfo.authTest.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <h3 className={`text-lg font-semibold mb-2 ${tokenInfo.authTest.success ? 'text-green-800' : 'text-red-800'}`}>
                      Authentication Test
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Status:</strong>
                        <p className="text-sm">{tokenInfo.authTest.status}</p>
                      </div>
                      <div>
                        <strong>Success:</strong>
                        <p className="text-sm">{tokenInfo.authTest.success ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <strong>Response:</strong>
                      <pre className="text-sm bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                        {JSON.stringify(tokenInfo.authTest.data, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">🔧 Debug Recommendations</h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Check if roles are in "roles" field or "authorities" field</li>
                      <li>• Verify role format: "USER" vs "ROLE_USER"</li>
                      <li>• Test with @PreAuthorize("permitAll()") temporarily</li>
                      <li>• Check SecurityConfiguration for role/authority handling</li>
                      <li>• Compare with working Postman token if available</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {!tokenInfo && (
            <div className="text-center py-8 text-gray-500">
              Click "Analyze JWT Token" to start analysis
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

export default TokenAnalyzer;
