import React, { useState } from 'react';
import { X, Bug, AlertCircle, CheckCircle } from 'lucide-react';

const ValidationTester = ({ isOpen, onClose, tournament }) => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const validationTests = [
    {
      name: 'Check User Authentication',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          const response = await fetch('http://localhost:8080/api/v1/auth/account', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const userData = await response.json();
          
          return {
            success: response.ok,
            data: {
              status: response.status,
              user: userData,
              tokenExists: !!token,
              tokenLength: token?.length || 0
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
      name: 'Check Tournament Details',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const tournamentData = await response.json();
          
          return {
            success: response.ok,
            data: {
              status: response.status,
              tournament: tournamentData,
              registrationDeadline: tournamentData.data?.registrationDeadline,
              currentTeams: tournamentData.data?.currentTeams,
              maxTeams: tournamentData.data?.maxTeams,
              tournamentStatus: tournamentData.data?.status
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
      name: 'Check Existing Teams',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        try {
          const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/teams`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          const teamsData = await response.json();
          
          return {
            success: response.ok,
            data: {
              status: response.status,
              teams: teamsData,
              teamCount: teamsData.data?.length || 0,
              teamNames: teamsData.data?.map(team => team.name) || []
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
      name: 'Test Unique Team Name',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        const uniqueTeamName = `Unique Test Team ${Date.now()}`;
        
        const testData = {
          teamName: uniqueTeamName,
          memberCount: 1,
          contactInfo: 'unique@test.com'
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
            responseData = { rawResponse: responseText };
          }

          return {
            success: response.ok,
            data: {
              status: response.status,
              statusText: response.statusText,
              responseData,
              requestData: testData,
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
      name: 'Test Minimal Registration',
      test: async () => {
        const token = localStorage.getItem('accessToken');
        
        const minimalData = {
          teamName: `Minimal ${Date.now()}`,
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
            responseData = { rawResponse: responseText };
          }

          return {
            success: response.ok,
            data: {
              status: response.status,
              statusText: response.statusText,
              responseData,
              requestData: minimalData
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

  const runValidationTest = async (test) => {
    setIsLoading(true);
    try {
      const result = await test.test();
      setTestResults(prev => [...prev, {
        name: test.name,
        timestamp: new Date().toLocaleTimeString(),
        ...result
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: test.name,
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        data: { error: error.message }
      }]);
    }
    setIsLoading(false);
  };

  const runAllValidationTests = async () => {
    setTestResults([]);
    for (const test of validationTests) {
      await runValidationTest(test);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bug className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registration Validation Tester</h2>
              <p className="text-sm text-gray-600">Test each validation step to find the exact failure point</p>
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
              <p className="text-sm text-gray-600">Step-by-step validation testing</p>
            </div>
            <button
              onClick={runAllValidationTests}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              <Bug className="h-4 w-4" />
              <span>{isLoading ? 'Testing...' : 'Run All Validation Tests'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {validationTests.map((test, index) => (
              <button
                key={index}
                onClick={() => runValidationTest(test)}
                disabled={isLoading}
                className="text-left p-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <div className="font-medium text-sm">{test.name}</div>
                <div className="text-xs text-gray-600 mt-1">Click to run individual test</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className={`border rounded-lg p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    {result.success ? '✅ Validation Passed - Click for details' : '❌ Validation Failed - Click to see error'}
                  </summary>
                  <div className="mt-2 text-xs bg-white p-3 rounded overflow-auto max-h-96">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            ))}
          </div>

          {testResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No validation test results yet. Click "Run All Validation Tests" to start.
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

export default ValidationTester;
