// Tạo file test News API tạm thời để debug
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Bug, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import newsService from '../../services/newsService';

const NewsAPITester = () => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const { data: newsData, isLoading, error, refetch } = useQuery(
    'news-debug-test',
    () => newsService.getAllNews(),
    {
      enabled: false,
      onSuccess: (data) => {
        console.log('✅ News API Success:', data);
        setTestResults(prev => ({
          ...prev,
          getAllNews: {
            success: true,
            data: data,
            dataType: typeof data,
            isArray: Array.isArray(data),
            length: Array.isArray(data) ? data.length : 0
          }
        }));
      },
      onError: (error) => {
        console.error('❌ News API Error:', error);
        setTestResults(prev => ({
          ...prev,
          getAllNews: {
            success: false,
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText
          }
        }));
      }
    }
  );

  const testCreateNews = async () => {
    const testData = {
      name: `Test News Article - ${new Date().toISOString()}`,
      shortDescription: 'This is a test news article for debugging purposes.',
      content: 'This is the full content of the test news article. It contains detailed information for testing the news system.'
    };

    try {
      const result = await newsService.createNews(testData);
      console.log('✅ Create News Success:', result);
      setTestResults(prev => ({
        ...prev,
        createNews: {
          success: true,
          data: result,
          testData: testData
        }
      }));

      // Try to delete the test article to clean up
      if (result?.id) {
        try {
          await newsService.deleteNews(result.id);
          console.log('✅ Test cleanup successful');
        } catch (deleteError) {
          console.warn('⚠️ Could not cleanup test article:', deleteError);
        }
      }
    } catch (error) {
      console.error('❌ Create News Error:', error);
      setTestResults(prev => ({
        ...prev,
        createNews: {
          success: false,
          error: error.message,
          status: error.response?.status,
          testData: testData
        }
      }));
    }
  };

  const testBackendConnection = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/api/v1/news`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      setTestResults(prev => ({
        ...prev,
        backendConnection: {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: data,
          raw: responseText
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        backendConnection: {
          success: false,
          error: error.message
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults({});

    console.log('🔧 Starting News API Debug Tests...');

    // Test 1: Backend Connection
    await testBackendConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Get All News
    refetch();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: Create News (if connection works)
    await testCreateNews();

    setIsRunning(false);
    console.log('📋 All tests completed!');
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bug className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">News API Debug Tester</h3>
        </div>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Testing...' : 'Run Tests'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Backend Connection Test */}
        {testResults.backendConnection && (
          <div className="border rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              {testResults.backendConnection.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Backend Connection Test</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Status: {testResults.backendConnection.status} {testResults.backendConnection.statusText}</p>
              {testResults.backendConnection.error && (
                <p className="text-red-600">Error: {testResults.backendConnection.error}</p>
              )}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-blue-600">View Details</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(testResults.backendConnection, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Get All News Test */}
        {testResults.getAllNews && (
          <div className="border rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              {testResults.getAllNews.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Get All News Test</span>
            </div>
            <div className="text-sm text-gray-600">
              {testResults.getAllNews.success ? (
                <>
                  <p>✅ Success - Found {testResults.getAllNews.length} articles</p>
                  <p>Data Type: {testResults.getAllNews.dataType}</p>
                  <p>Is Array: {testResults.getAllNews.isArray ? 'Yes' : 'No'}</p>
                </>
              ) : (
                <p className="text-red-600">❌ Error: {testResults.getAllNews.error}</p>
              )}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-blue-600">View Raw Data</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(testResults.getAllNews.data || testResults.getAllNews.error, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Create News Test */}
        {testResults.createNews && (
          <div className="border rounded p-3">
            <div className="flex items-center space-x-2 mb-2">
              {testResults.createNews.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="font-medium">Create News Test</span>
            </div>
            <div className="text-sm text-gray-600">
              {testResults.createNews.success ? (
                <p>✅ Successfully created and cleaned up test article</p>
              ) : (
                <p className="text-red-600">❌ Error: {testResults.createNews.error}</p>
              )}
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-blue-600">View Details</summary>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(testResults.createNews, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {Object.keys(testResults).length === 0 && !isRunning && (
        <div className="text-center text-gray-500 py-4">
          Click "Run Tests" to check News API functionality
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>🔍 This tool will help identify why no news articles are showing on the News page.</p>
        <p>📋 Check the browser console for detailed logs during testing.</p>
      </div>
    </div>
  );
};

export default NewsAPITester;