import React, { useState } from 'react';
import { Play, Trophy, Users, AlertCircle } from 'lucide-react';
import { tournamentKnockoutService } from '../../services';
import toast from 'react-hot-toast';

const TournamentBracketGenerator = ({ tournament, onBracketGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [bracketData, setBracketData] = useState({
    type: 'SINGLE_ELIMINATION',
    randomize: true
  });

  const handleGenerateBracket = async () => {
    setIsGenerating(true);
    try {
      console.log('🚀 Generating bracket for tournament:', tournament.id);
      console.log('📊 Bracket data:', bracketData);
      console.log('👥 Current teams:', tournament.currentTeams);
      
      // Debug: Check teams data before generating bracket
      try {
        const teamsResponse = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/teams`);
        const teamsData = await teamsResponse.json();
        console.log('📊 Teams API response:', teamsData);
        console.log('📊 Teams count:', teamsData?.data?.length || 0);
        console.log('📊 Team IDs:', teamsData?.data?.map(t => ({ id: t.id, name: t.name })) || []);
      } catch (teamError) {
        console.error('⚠️ Failed to fetch teams for debugging:', teamError);
      }
      
      const response = await tournamentKnockoutService.generateBracket(tournament.id, bracketData);
      console.log('✅ Generate bracket success:', response);
      
      toast.success('Tournament bracket generated successfully!');
      onBracketGenerated?.(response.data);
    } catch (error) {
      console.error('❌ Generate bracket error:', error);
      console.error('📋 Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        statusText: error.response?.statusText
      });
      
      // More detailed error handling
      let errorMessage = 'Failed to generate bracket';
      
      if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.message;
        if (backendMessage?.includes('Data truncated')) {
          errorMessage = '🗃️ Database configuration issue. Tournament status field may be too short. Please contact administrator.';
        } else if (backendMessage?.includes('not-null property references a null')) {
          if (backendMessage.includes('team1') || backendMessage.includes('team2')) {
            errorMessage = '👥 Teams data issue. Cannot create matches because team assignments are null. Please check if teams are properly registered and have valid IDs.';
          } else {
            errorMessage = `🗃️ Database constraint violation: ${backendMessage}`;
          }
        } else if (backendMessage?.includes('not enough teams')) {
          errorMessage = `⚠️ Not enough teams to generate bracket. Need at least 2 teams, current: ${tournament.currentTeams || 0}`;
        } else if (backendMessage) {
          errorMessage = backendMessage;
        } else {
          errorMessage = 'Invalid tournament data. Please check if tournament has enough registered teams.';
        }
      } else if (error.response?.status === 500) {
        errorMessage = '🔧 Server error. Please check backend logs and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          padding: '16px',
          borderRadius: '8px'
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartKnockout = async () => {
    try {
      await tournamentKnockoutService.startKnockout(tournament.id);
      toast.success('Knockout tournament started!');
      window.location.reload(); // Refresh to update tournament status
    } catch (error) {
      console.error('Start knockout error:', error);
      toast.error(error.response?.data?.message || 'Failed to start knockout tournament');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-primary-500 to-sports-purple p-3 rounded-full">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Tournament Bracket</h3>
          <p className="text-gray-600">Generate and manage tournament brackets</p>
        </div>
      </div>

      {(tournament.status === 'REGISTRATION' || tournament.status === 'UPCOMING' || tournament.status === 'READY_TO_START') && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Ready to Generate Bracket</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Tournament has {tournament.currentTeams || tournament.registeredTeams || 0} registered teams. 
                  Generate the bracket to set up matches.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bracket Type
              </label>
              <select
                value={bracketData.type}
                onChange={(e) => setBracketData({ ...bracketData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="randomize"
                checked={bracketData.randomize}
                onChange={(e) => setBracketData({ ...bracketData, randomize: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="randomize" className="text-sm text-gray-700">
                Randomize team placement
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleGenerateBracket}
                disabled={isGenerating || (tournament.currentTeams || 0) < 2}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate Bracket'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {(tournament.status === 'READY' || tournament.status === 'READY_TO_START') && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Trophy className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Bracket Generated</h4>
                <p className="text-sm text-green-700 mt-1">
                  Tournament bracket is ready. You can now start the knockout phase.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartKnockout}
            className="btn-primary flex items-center space-x-2"
          >
            <Play className="h-4 w-4" />
            <span>Start Knockout Tournament</span>
          </button>
        </div>
      )}

      {tournament.status === 'ONGOING' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Users className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-orange-900">Tournament In Progress</h4>
              <p className="text-sm text-orange-700 mt-1">
                The knockout tournament is currently ongoing. Manage matches from the matches tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {tournament.status === 'COMPLETED' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Trophy className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Tournament Completed</h4>
              <p className="text-sm text-gray-700 mt-1">
                This tournament has been completed. View the final results and bracket.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracketGenerator;
