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
      const response = await tournamentKnockoutService.generateBracket(tournament.id, bracketData);
      toast.success('Tournament bracket generated successfully!');
      onBracketGenerated?.(response.data);
    } catch (error) {
      console.error('Generate bracket error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate bracket');
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

      {tournament.status === 'UPCOMING' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Ready to Generate Bracket</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Tournament has {tournament.registeredTeams || 0} registered teams. 
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
                className="input-field"
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
                disabled={isGenerating}
                className="btn-primary flex items-center space-x-2"
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

      {tournament.status === 'READY' && (
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
