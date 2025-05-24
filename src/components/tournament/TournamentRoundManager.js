import React, { useState } from 'react';
import { ArrowRight, Trophy, Clock, CheckCircle } from 'lucide-react';
import { tournamentKnockoutService } from '../../services';
import toast from 'react-hot-toast';

const TournamentRoundManager = ({ tournament, currentRound, matches, onRoundAdvanced }) => {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleAdvanceRound = async () => {
    setIsAdvancing(true);
    try {
      const response = await tournamentKnockoutService.advanceRound(tournament.id);
      toast.success('Successfully advanced to next round!');
      onRoundAdvanced?.(response.data);
    } catch (error) {
      console.error('Advance round error:', error);
      toast.error(error.response?.data?.message || 'Failed to advance round');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleCompleteTournament = async () => {
    setIsCompleting(true);
    try {
      const response = await tournamentKnockoutService.completeTournament(tournament.id);
      toast.success('Tournament completed successfully!');
      window.location.reload(); // Refresh to update tournament status
    } catch (error) {
      console.error('Complete tournament error:', error);
      toast.error(error.response?.data?.message || 'Failed to complete tournament');
    } finally {
      setIsCompleting(false);
    }
  };

  const completedMatches = matches?.filter(match => match.status === 'COMPLETED') || [];
  const totalMatches = matches?.length || 0;
  const allMatchesCompleted = totalMatches > 0 && completedMatches.length === totalMatches;
  const isLastRound = currentRound?.name?.includes('Final') || currentRound?.isLastRound;

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-r from-sports-orange to-sports-pink p-3 rounded-full">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Round Management</h3>
          <p className="text-gray-600">Manage tournament progression</p>
        </div>
      </div>

      {currentRound && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary-50 to-sports-green/10 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-primary-900">
                  {currentRound.name || `Round ${currentRound.roundNumber}`}
                </h4>
                <p className="text-sm text-primary-700 mt-1">
                  {completedMatches.length} of {totalMatches} matches completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">
                  {Math.round((completedMatches.length / totalMatches) * 100) || 0}%
                </div>
                <div className="text-xs text-primary-500">Complete</div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedMatches.length / totalMatches) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {allMatchesCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-green-900">Round Complete</h4>
                  <p className="text-sm text-green-700 mt-1">
                    All matches in this round have been completed. 
                    {isLastRound 
                      ? ' You can now complete the tournament.'
                      : ' You can advance to the next round.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            {allMatchesCompleted && !isLastRound && (
              <button
                onClick={handleAdvanceRound}
                disabled={isAdvancing}
                className="btn-primary flex items-center space-x-2"
              >
                {isAdvancing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                <span>{isAdvancing ? 'Advancing...' : 'Advance to Next Round'}</span>
              </button>
            )}

            {allMatchesCompleted && isLastRound && (
              <button
                onClick={handleCompleteTournament}
                disabled={isCompleting}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {isCompleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trophy className="h-4 w-4" />
                )}
                <span>{isCompleting ? 'Completing...' : 'Complete Tournament'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!currentRound && (
        <div className="text-center text-gray-500 py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p>No active round information available</p>
        </div>
      )}
    </div>
  );
};

export default TournamentRoundManager;
