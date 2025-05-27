import React, { useState } from 'react';
import { X } from 'lucide-react';
import { teamService } from '../../services';

const SimpleTestModal = ({ isOpen, onClose, tournament }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing team registration...');
      console.log('Tournament ID:', tournament.id);
      
      const testData = {
        teamName: 'Test Team ' + Date.now(),
        teamColor: '#FF5733',
        memberCount: 3,
        contactInfo: 'test@example.com',
        notes: 'Test registration from frontend'
      };
      
      console.log('Request data:', testData);
      
      const response = await teamService.registerTeam(tournament.id, testData);
      
      console.log('✅ Success response:', response);
      setResult({ success: true, data: response });
      
    } catch (error) {
      console.error('❌ Error:', error);
      setResult({ 
        success: false, 
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          stack: error.stack
        }
      });
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Simple Registration Test</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <button
              onClick={testRegistration}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Registration'}
            </button>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Success' : '❌ Error'}
              </h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
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

export default SimpleTestModal;
