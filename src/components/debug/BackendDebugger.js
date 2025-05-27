import React, { useState } from 'react';
import { X, Bug, Server, AlertTriangle } from 'lucide-react';

const BackendDebugger = ({ isOpen, onClose, tournament }) => {
  const [debugResults, setDebugResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const backendTests = [
    {
      name: 'Registration Endpoint Headers Check',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/register`, {
            method: 'OPTIONS', // Preflight check
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          return {
            success: true,
            data: {
              status: response.status,
              headers: Object.fromEntries(response.headers.entries()),
              allowedMethods: response.headers.get('Allow'),
              cors: response.headers.get('Access-Control-Allow-Origin')
            }
          };
        } catch (error) {
          return {
            success: false,
            data: { error: error.message }
          };
        }
      }
    },
    {
      name: 'Empty Body Registration Test',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
          });

          const responseText = await response.text();
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          return {
            success: response.ok,
            data: {
              status: response.status,
              statusText: response.statusText,
              body: responseData,
              headers: Object.fromEntries(response.headers.entries())
            }
          };
        } catch (error) {
          return {
            success: false,
            data: { error: error.message }
          };
        }
      }
    },
    {
      name: 'Registration with All Fields',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        const fullData = {
          teamName: 'Backend Debug Team',
          teamColor: '#FF5733',
          memberCount: 5,
          contactInfo: 'backend@debug.com',
          description: 'Full data registration test',
          captain: 'Debug Captain',
          members: ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5']
        };

        try {
          const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(fullData)
          });

          const responseText = await response.text();
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }

          return {
            success: response.ok,
            data: {
              status: response.status,
              statusText: response.statusText,
              body: responseData,
              requestData: fullData,
              responseHeaders: Object.fromEntries(response.headers.entries())
            }
          };
        } catch (error) {
          return {
            success: false,
            data: { error: error.message }
          };
        }
      }
    },
    {
      name: 'Backend Health Check',
      test: async () => {
        try {
          const response = await fetch('http://localhost:8080/actuator/health');
          const data = await response.json();
          
          return {
            success: response.ok,
            data: {
              status: response.status,
              health: data
            }
          };
        } catch (error) {
          return {
            success: false,
            data: { error: 'Health endpoint not available or backend down' }
          };
        }
      }
    },
    {
      name: 'Database Connection Test',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          // Test any simple database read operation
          const response = await fetch(`http://localhost:8080/api/tournaments`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();
          
          return {
            success: response.ok,
            data: {
              status: response.status,
              tournamentCount: data?.data?.length || 0,
              databaseWorking: response.ok
            }
          };
        } catch (error) {
          return {
            success: false,
            data: { error: error.message }
          };
        }
      }
    },
    {
      name: 'Check User Registration Status',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          // Get current user info
          const userResponse = await fetch('http://localhost:8080/api/v1/auth/account', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const userData = await userResponse.json();

          // Get tournament teams to check if user already registered
          const teamsResponse = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/teams`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          let teamsData = [];
          if (teamsResponse.ok) {
            teamsData = await teamsResponse.json();
          }

          return {
            success: userResponse.ok,
            data: {
              user: userData,
              userAlreadyRegistered: teamsData.some(team => 
                team.captain === userData.username || 
                team.members?.includes(userData.username)
              ),
              totalTeams: teamsData.length,
              tournamentStatus: tournament.status
            }
          };
        } catch (error) {
          return {
            success: false,
            data: { error: error.message }
          };
        }
      }
    }
  ];

  const runBackendTest = async (test) => {
    setIsLoading(true);
    try {
      const result = await test.test();
      setDebugResults(prev => [...prev, {
        name: test.name,
        timestamp: new Date().toLocaleTimeString(),
        ...result
      }]);
    } catch (error) {
      setDebugResults(prev => [...prev, {
        name: test.name,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        data: { error: error.message }
      }]);
    }
    setIsLoading(false);
  };

  const runAllBackendTests = async () => {
    setDebugResults([]);
    for (const test of backendTests) {
      await runBackendTest(test);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Server className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Backend Debugger</h2>
              <p className="text-sm text-gray-600">Deep dive into backend registration issues</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Backend Issue Detected</h3>
            </div>
            <p className="text-yellow-700 mt-2">
              Frontend tests show registration endpoint returning 500 errors. 
              These tests will help identify the exact backend issue.
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Tournament: {tournament.name}</h3>
              <p className="text-sm text-gray-600">Backend Health & Registration Analysis</p>
            </div>
            <button
              onClick={runAllBackendTests}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Bug className="h-4 w-4" />
              <span>{isLoading ? 'Testing Backend...' : 'Run Backend Tests'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {backendTests.map((test, index) => (
              <button
                key={index}
                onClick={() => runBackendTest(test)}
                disabled={isLoading}
                className="text-left p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="font-medium text-sm">{test.name}</div>
                <div className="text-xs text-gray-600 mt-1">Click to run individual test</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {debugResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    ) : (
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    )}
                    <span className="font-medium text-sm">{result.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
                
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    {result.success ? '✅ Success - Click for details' : '❌ Failed - Click for error details'}
                  </summary>
                  <div className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            ))}
          </div>

          {debugResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No backend test results yet. Click "Run Backend Tests" to start analysis.
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

export default BackendDebugger;
