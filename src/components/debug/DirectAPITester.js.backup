import React, { useState } from 'react';
import { X, Bug, Play, CheckCircle } from 'lucide-react';

const DirectAPITester = ({ isOpen, onClose, tournament }) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const tests = [
    {
      name: 'Check Token',
      test: () => {
        const token = localStorage.getItem('accessToken');
        return {
          success: !!token,
          data: {
            tokenExists: !!token,
            tokenLength: token?.length || 0,
            tokenStart: token ? token.substring(0, 20) + '...' : 'No token'
          }
        };
      }
    },
    {
      name: 'Direct Fetch Test',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        const testData = {
          teamName: 'Direct Fetch Test',
          teamColor: '#00FF00',
          memberCount: 2,
          contactInfo: 'directfetch@test.com'
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
              headers: Object.fromEntries(response.headers.entries()),
              body: responseData,
              requestData: testData
            }
          };
        } catch (error) {
          return {
            success: false,
            data: {
              error: error.message,
              stack: error.stack
            }
          };
        }
      }
    },
    {
      name: 'Check User Info',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          const response = await fetch('http://localhost:8080/api/v1/auth/account', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();
          
          return {
            success: response.ok,
            data: {
              status: response.status,
              user: data
            }
          };
        } catch (error) {
          return {
            success: false,
            data: {
              error: error.message
            }
          };
        }
      }
    },
    {
      name: 'Check Tournament API',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const data = await response.json();
          
          return {
            success: response.ok,
            data: {
              status: response.status,
              tournament: data
            }
          };
        } catch (error) {
          return {
            success: false,
            data: {
              error: error.message
            }
          };
        }
      }
    },
    {
      name: 'Minimal Registration Test',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        const minimalData = {
          teamName: 'Minimal Test',
          memberCount: 1,
          contactInfo: 'minimal@test.com'
        };

        try {
          const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(minimalData)
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
              requestData: minimalData
            }
          };
        } catch (error) {
          return {
            success: false,
            data: {
              error: error.message,
              stack: error.stack
            }
          };
        }
      }
    }
  ];

  const runTest = async (test) => {
    setIsLoading(true);
    try {
      const result = await test.test();
      setResults(prev => [...prev, {
        name: test.name,
        timestamp: new Date().toLocaleTimeString(),
        ...result
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        name: test.name,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        data: { error: error.message }
      }]);
    }
    setIsLoading(false);
  };

  const runAllTests = async () => {
    setResults([]);
    for (const test of tests) {
      await runTest(test);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Bug className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Direct API Tester</h2>
              <p className="text-sm text-gray-600">Bypass all interceptors and test direct</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Tournament: {tournament.name}</h3>
              <p className="text-sm text-gray-600">ID: {tournament.id} | Status: {tournament.status}</p>
            </div>
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>{isLoading ? 'Running...' : 'Run All Tests'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {tests.map((test, index) => (
              <button
                key={index}
                onClick={() => runTest(test)}
                disabled={isLoading}
                className="text-left p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="font-medium">{test.name}</div>
                <div className="text-sm text-gray-600">Click to run individual test</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    {result.success ? '✅ Success - Click to see details' : '❌ Failed - Click to see error'}
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No test results yet. Click "Run All Tests" or individual test buttons.
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

export default DirectAPITester;
