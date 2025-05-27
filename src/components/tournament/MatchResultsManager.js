import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { 
  Trophy, 
  Save, 
  Clock, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Users,
  Target,
  Edit3,
  Loader
} from 'lucide-react';
import { matchService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';

const MatchResultsManager = ({ tournament, currentRound = 1, onMatchResultUpdated }) => {
  const [editingMatch, setEditingMatch] = useState(null);
  const [matchScores, setMatchScores] = useState({});
  const [notification, setNotification] = useState(null);
  const queryClient = useQueryClient();

  // Fetch matches for current tournament and round
  const { data: matches, isLoading, error, refetch } = useQuery(
    ['tournament-matches', tournament.id, currentRound],
    () => matchService.getMatchesByTournament(tournament.id, { round: currentRound }),
    {
      enabled: !!tournament.id,
      staleTime: 30000, // 30 seconds
      onSuccess: (data) => {
        console.log('📋 [MatchResultsManager] Matches data received:', data);
        console.log('📋 [MatchResultsManager] Data type:', typeof data);
        console.log('📋 [MatchResultsManager] Is array:', Array.isArray(data));
        if (data?.data) {
          console.log('📋 [MatchResultsManager] Nested data:', data.data);
          console.log('📋 [MatchResultsManager] Nested data type:', typeof data.data);
          console.log('📋 [MatchResultsManager] Nested is array:', Array.isArray(data.data));
        }
      },
      onError: (error) => {
        console.error('Failed to fetch matches:', error);
        showNotification('error', 'Failed to load matches');
      }
    }
  );

  // Update match score mutation
  const updateScoreMutation = useMutation(
    ({ matchId, scoreData }) => matchService.updateMatchScore(matchId, scoreData),
    {
      onSuccess: (data, variables) => {
        showNotification('success', 'Match score updated successfully!');
        queryClient.invalidateQueries(['tournament-matches', tournament.id]);
        queryClient.invalidateQueries(['tournament-bracket', tournament.id]);
        setEditingMatch(null);
        setMatchScores(prev => ({ ...prev, [variables.matchId]: {} }));
        // Trigger callback to parent component
        onMatchResultUpdated?.();
      },
      onError: (error) => {
        console.error('Failed to update match score:', error);
        showNotification('error', error.response?.data?.message || 'Failed to update match score');
      }
    }
  );

  // Update match status mutation
  const updateStatusMutation = useMutation(
    ({ matchId, status }) => matchService.updateMatchStatus(matchId, { status }),
    {
      onSuccess: () => {
        showNotification('success', 'Match status updated successfully!');
        queryClient.invalidateQueries(['tournament-matches', tournament.id]);
        queryClient.invalidateQueries(['tournament-bracket', tournament.id]);
        // Trigger callback to parent component
        onMatchResultUpdated?.();
      },
      onError: (error) => {
        console.error('Failed to update match status:', error);
        showNotification('error', error.response?.data?.message || 'Failed to update match status');
      }
    }
  );

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEditMatch = (match) => {
    setEditingMatch(match.id);
    setMatchScores(prev => ({
      ...prev,
      [match.id]: {
        team1Score: match.team1Score || 0,
        team2Score: match.team2Score || 0
      }
    }));
  };

  const handleScoreChange = (matchId, team, score) => {
    const numericScore = parseInt(score) || 0;
    setMatchScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${team}Score`]: numericScore
      }
    }));
  };

  const handleSaveScore = async (match) => {
    const scores = matchScores[match.id];
    if (!scores) return;

    const { team1Score, team2Score } = scores;
    
    // Validate scores
    if (team1Score === team2Score) {
      showNotification('error', 'Scores cannot be tied. Please enter different scores.');
      return;
    }

    if (team1Score < 0 || team2Score < 0) {
      showNotification('error', 'Scores cannot be negative.');
      return;
    }

    // Determine winner
    const winnerId = team1Score > team2Score ? match.team1.id : match.team2.id;

    try {
      await updateScoreMutation.mutateAsync({
        matchId: match.id,
        scoreData: {
          team1Score,
          team2Score,
          winnerId,
          status: 'COMPLETED'
        }
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleStartMatch = (matchId) => {
    updateStatusMutation.mutate({
      matchId,
      status: 'IN_PROGRESS'
    });
  };

  const handleCancelEdit = (matchId) => {
    setEditingMatch(null);
    setMatchScores(prev => ({ ...prev, [matchId]: {} }));
  };

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4" />;
      case 'SCHEDULED':
        return <Clock className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Matches</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button onClick={() => refetch()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // Safe data extraction with comprehensive fallbacks
  let matchList = [];
  
  try {
    // Try different possible data structures
    if (Array.isArray(matches?.data?.matches)) {
      matchList = matches.data.matches;
    } else if (Array.isArray(matches?.data)) {
      matchList = matches.data;
    } else if (Array.isArray(matches?.matches)) {
      matchList = matches.matches;
    } else if (Array.isArray(matches)) {
      matchList = matches;
    } else {
      console.log('🚷 [MatchResultsManager] No valid match array found in:', matches);
      matchList = [];
    }
  } catch (err) {
    console.error('🚨 [MatchResultsManager] Error extracting match data:', err);
    matchList = [];
  }
  
  console.log('🏆 [MatchResultsManager] Final matchList:', matchList);
  console.log('🏆 [MatchResultsManager] MatchList length:', matchList.length);
  
  const completedMatches = matchList.filter(match => match?.status === 'COMPLETED').length;
  const totalMatches = matchList.length;
  const roundProgress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800'
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Round Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Round {currentRound} - Match Results
            </h3>
            <p className="text-gray-600">
              Input match results and manage tournament progression
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold text-gray-900">
                {completedMatches}/{totalMatches}
              </div>
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${roundProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Round Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-blue-600 font-medium">Total Matches</div>
                <div className="text-xl font-bold text-blue-900">{totalMatches}</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-green-600 font-medium">Completed</div>
                <div className="text-xl font-bold text-green-900">{completedMatches}</div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-orange-600 font-medium">Remaining</div>
                <div className="text-xl font-bold text-orange-900">{totalMatches - completedMatches}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {totalMatches === 0 ? (
          <div className="card text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-600 mb-4">
              No matches found for Round {currentRound}. This could mean:
            </p>
            <div className="text-sm text-gray-500 space-y-1 mb-6">
              <p>• Tournament bracket hasn't been generated yet</p>
              <p>• No matches exist for this round</p> 
              <p>• Backend data is not in expected format</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">📊 Current API Data</h4>
              <pre className="text-xs text-blue-700 text-left overflow-auto">
                {JSON.stringify(matches, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          matchList.map((match, index) => (
            <div key={match.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-100 p-2 rounded-full">
                    <Trophy className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Match {index + 1}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getMatchStatusColor(match.status)}`}>
                        {getMatchStatusIcon(match.status)}
                        <span>{match.status || 'PENDING'}</span>
                      </span>
                      {match.scheduledTime && (
                        <span className="text-xs text-gray-500">
                          {new Date(match.scheduledTime).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {(match.status === 'PENDING' || match.status === 'SCHEDULED') && (
                    <button
                      onClick={() => handleStartMatch(match.id)}
                      disabled={updateStatusMutation.isLoading}
                      className="btn-secondary flex items-center space-x-1 text-sm"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  )}
                  
                  {(match.status === 'IN_PROGRESS' || match.status === 'PENDING' || match.status === 'SCHEDULED') && (
                    <button
                      onClick={() => handleEditMatch(match)}
                      disabled={editingMatch === match.id}
                      className="btn-primary flex items-center space-x-1 text-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Input Score</span>
                    </button>
                  )}
                  
                  {match.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleEditMatch(match)}
                      className="btn-secondary flex items-center space-x-1 text-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Score</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Match Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Team 1 */}
                <div className={`p-4 rounded-lg border-2 ${
                  match.winnerId === match.team1?.id 
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2 rounded-full">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {match.team1?.name || 'Team 1'}
                        </div>
                        {match.winnerId === match.team1?.id && (
                          <div className="text-sm text-green-600 font-medium">Winner</div>
                        )}
                      </div>
                    </div>
                    
                    {editingMatch === match.id ? (
                      <input
                        type="number"
                        min="0"
                        value={matchScores[match.id]?.team1Score || 0}
                        onChange={(e) => handleScoreChange(match.id, 'team1', e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded p-1 font-bold text-lg"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {match.team1Score !== undefined ? match.team1Score : '-'}
                      </span>
                    )}
                  </div>
                </div>

                {/* VS / Actions */}
                <div className="text-center">
                  {editingMatch === match.id ? (
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-gray-600">VS</div>
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => handleSaveScore(match)}
                          disabled={updateScoreMutation.isLoading}
                          className="btn-primary flex items-center space-x-1 text-sm"
                        >
                          {updateScoreMutation.isLoading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => handleCancelEdit(match.id)}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-gray-600">VS</div>
                  )}
                </div>

                {/* Team 2 */}
                <div className={`p-4 rounded-lg border-2 ${
                  match.winnerId === match.team2?.id 
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white p-2 rounded-full">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {match.team2?.name || 'Team 2'}
                        </div>
                        {match.winnerId === match.team2?.id && (
                          <div className="text-sm text-green-600 font-medium">Winner</div>
                        )}
                      </div>
                    </div>
                    
                    {editingMatch === match.id ? (
                      <input
                        type="number"
                        min="0"
                        value={matchScores[match.id]?.team2Score || 0}
                        onChange={(e) => handleScoreChange(match.id, 'team2', e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded p-1 font-bold text-lg"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        {match.team2Score !== undefined ? match.team2Score : '-'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Round Completion Status */}
      {totalMatches > 0 && (
        <div className="card">
          <div className="text-center">
            {completedMatches === totalMatches ? (
              <div className="space-y-3">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-green-900">
                  Round {currentRound} Completed!
                </h3>
                <p className="text-green-700">
                  All matches in this round have been completed. Ready to advance to next round.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Clock className="h-12 w-12 text-orange-400 mx-auto" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Round {currentRound} In Progress
                </h3>
                <p className="text-gray-600">
                  {totalMatches - completedMatches} matches remaining to complete this round.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchResultsManager;