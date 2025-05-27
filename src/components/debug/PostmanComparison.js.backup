import React, { useState } from 'react';
import { X, Copy, ArrowRight, AlertCircle } from 'lucide-react';

const PostmanComparison = ({ isOpen, onClose, tournament }) => {
  const [postmanRequest, setPostmanRequest] = useState('');
  const [frontendResponse, setFrontendResponse] = useState(null);
  const [postmanResponse, setPostmanResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generatePostmanScript = () => {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const curlCommand = `curl --location 'http://localhost:8080/api/tournaments/${tournament.id}/register' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer ${token}' \\
--data '{
    "teamName": "Postman Test Team",
    "teamColor": "#FF5733", 
    "memberCount": 3,
    "contactInfo": "postman@test.com",
    "description": "Team created via Postman comparison"
}'`;

    const postmanJson = {
      "info": {
        "name": "Tournament Registration Debug",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      "item": [
        {
          "name": "Register Team - Debug",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization", 
                "value": `Bearer ${token}`
              }
            ],
            "body": {
              "mode": "raw",
              "raw": JSON.stringify({
                "teamName": "Postman Test Team",
                "teamColor": "#FF5733",
                "memberCount": 3,
                "contactInfo": "postman@test.com", 
                "description": "Team created via Postman comparison"
              }, null, 2)
            },
            "url": {
              "raw": `http://localhost:8080/api/tournaments/${tournament.id}/register`,
              "protocol": "http",
              "host": ["localhost"],
              "port": "8080",
              "path": ["api", "tournaments", tournament.id.toString(), "register"]
            }
          }
        }
      ]
    };

    return { curlCommand, postmanJson };
  };

  const testFrontendRequest = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    
    const testData = {
      teamName: "Frontend Test Team",
      teamColor: "#33FF57",
      memberCount: 3,
      contactInfo: "frontend@test.com",
      description: "Team created via Frontend comparison"
    };

    try {
      const startTime = Date.now();
      const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });

      const endTime = Date.now();
      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      setFrontendResponse({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData,
        requestData: testData,
        timing: endTime - startTime,
        requestHeaders: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.substring(0, 20)}...`
        }
      });
    } catch (error) {
      setFrontendResponse({
        success: false,
        error: error.message,
        requestData: testData
      });
    }
    setIsLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  const { curlCommand, postmanJson } = generatePostmanScript();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Postman vs Frontend Comparison</h2>
              <p className="text-sm text-gray-600">Compare exact requests to find differences</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Debug Strategy</h3>
            </div>
            <p className="text-yellow-700 mt-2">
              Since Postman works but Frontend fails, let's compare the exact requests to find the difference.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Postman Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">✅ Postman Request (Working)</h3>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">cURL Command</label>
                  <button
                    onClick={() => copyToClipboard(curlCommand)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  value={curlCommand}
                  readOnly
                  className="w-full h-32 text-xs bg-gray-50 border rounded p-2 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Postman Collection JSON</label>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(postmanJson, null, 2))}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  value={JSON.stringify(postmanJson, null, 2)}
                  readOnly
                  className="w-full h-48 text-xs bg-gray-50 border rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Postman Response (paste here)</label>
                <textarea
                  value={postmanResponse}
                  onChange={(e) => setPostmanResponse(e.target.value)}
                  placeholder="Copy and paste the response from Postman here..."
                  className="w-full h-32 text-xs border rounded p-2 font-mono"
                />
              </div>
            </div>

            {/* Frontend Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-600">❌ Frontend Request (Failing)</h3>
              
              <button
                onClick={testFrontendRequest}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Testing...' : 'Test Frontend Request'}
              </button>

              {frontendResponse && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Frontend Response</label>
                  <div className="text-xs bg-gray-50 border rounded p-2 font-mono max-h-96 overflow-auto">
                    <pre>{JSON.stringify(frontendResponse, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Analysis */}
          {frontendResponse && postmanResponse && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 Comparison Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-green-600">Postman Status</h4>
                  <p className="text-gray-700">Response: {postmanResponse ? 'Provided' : 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-red-600">Frontend Status</h4>
                  <p className="text-gray-700">Status: {frontendResponse.status} {frontendResponse.statusText}</p>
                  <p className="text-gray-700">Success: {frontendResponse.success ? 'Yes' : 'No'}</p>
                  <p className="text-gray-700">Timing: {frontendResponse.timing}ms</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">🔍 Instructions</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Copy the cURL command above and test it in terminal</li>
              <li>Import the Postman collection JSON into Postman</li>
              <li>Run the Postman request and copy the response here</li>
              <li>Click "Test Frontend Request" to compare</li>
              <li>Look for differences in request headers, body, or response</li>
            </ol>
          </div>
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

export default PostmanComparison;
