import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { teamService } from '../../services';
import { Search, Users, AlertTriangle, CheckCircle, Database } from 'lucide-react';

const TournamentTeamsDebug = ({ tournament }) => {
  const [showDebug, setShowDebug] = useState(false);

  const { data: teams, isLoading, error } = useQuery(
    ['debug-teams', tournament.id],
    () => teamService.getTeamsByTournament(tournament.id),
    {
      enabled: showDebug,
      staleTime: 0, // Always fresh for debugging
      onSuccess: (data) => {
        console.log('🔍 [TeamsDebug] Teams data:', data);
      },
      onError: (error) => {
        console.error('🔍 [TeamsDebug] Teams error:', error);
      }
    }
  );

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors flex items-center space-x-1"
      >
        <Search className="h-3 w-3" />
        <span>Debug Teams Data</span>
      </button>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-blue-900 flex items-center space-x-2">
          <Database className="h-4 w-4" />
          <span>Teams Debug Information</span>
        </h4>
        <button
          onClick={() => setShowDebug(false)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          × Close
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Loading teams data...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 rounded p-3">
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Teams API Error</span>
          </div>
          <pre className="text-xs text-red-700 overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {teams && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Teams API Response</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-blue-900 mb-2">Raw Response</h5>
              <pre className="text-xs bg-white border rounded p-2 overflow-auto max-h-32">
                {JSON.stringify(teams, null, 2)}
              </pre>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-blue-900 mb-2">Analysis</h5>
              <div className="text-xs space-y-1">
                <p><strong>Response Type:</strong> {typeof teams}</p>
                <p><strong>Is Array:</strong> {Array.isArray(teams) ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Has .data:</strong> {teams?.data ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Data Type:</strong> {typeof teams?.data}</p>
                <p><strong>Data Is Array:</strong> {Array.isArray(teams?.data) ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Teams Count:</strong> {
                  Array.isArray(teams?.data) ? teams.data.length :
                  Array.isArray(teams) ? teams.length : 'N/A'
                }</p>
              </div>
            </div>
          </div>

          {/* Team Details */}
          {(() => {
            const teamArray = Array.isArray(teams?.data) ? teams.data : 
                             Array.isArray(teams) ? teams : [];
            
            return teamArray.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-blue-900 mb-2">Team Details</h5>
                <div className="space-y-2">
                  {teamArray.map((team, index) => (
                    <div key={index} className="bg-white border rounded p-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <span><strong>ID:</strong> {team.id || 'NULL ❌'}</span>
                        <span><strong>Name:</strong> {team.name || 'NULL ❌'}</span>
                        <span><strong>Tournament ID:</strong> {team.tournamentId || team.tournament_id || 'NULL ❌'}</span>
                        <span><strong>Status:</strong> {team.status || 'NULL'}</span>
                      </div>
                      {(!team.id || !team.name) && (
                        <div className="mt-1 text-red-600">
                          ⚠️ This team has NULL required fields!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Diagnosis */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h5 className="text-sm font-medium text-yellow-900 mb-2">🔍 Diagnosis</h5>
            <div className="text-xs text-yellow-800 space-y-1">
              {(() => {
                const teamArray = Array.isArray(teams?.data) ? teams.data : 
                                 Array.isArray(teams) ? teams : [];
                
                if (teamArray.length === 0) {
                  return <p>❌ <strong>No teams found</strong> - This is why bracket generation fails!</p>;
                }
                
                const hasNullIds = teamArray.some(team => !team.id);
                const hasNullNames = teamArray.some(team => !team.name);
                
                if (hasNullIds) {
                  return <p>❌ <strong>Teams have NULL IDs</strong> - Backend cannot create matches!</p>;
                }
                
                if (hasNullNames) {
                  return <p>⚠️ <strong>Teams have NULL names</strong> - May cause display issues</p>;
                }
                
                if (teamArray.length < 2) {
                  return <p>⚠️ <strong>Not enough teams</strong> - Need at least 2 for bracket</p>;
                }
                
                return <p>✅ <strong>Teams data looks good!</strong> - Issue may be elsewhere in backend logic</p>;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentTeamsDebug;