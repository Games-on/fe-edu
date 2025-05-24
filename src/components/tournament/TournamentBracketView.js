import React from 'react';
import { Trophy, Users, Calendar, Target } from 'lucide-react';

const TournamentBracketView = ({ bracket, tournament }) => {
  if (!bracket || !bracket.rounds) {
    return (
      <div className="card text-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bracket Generated</h3>
        <p className="text-gray-600">
          Generate a tournament bracket to view the competition structure.
        </p>
      </div>
    );
  }

  const { rounds } = bracket;

  return (
    <div className="space-y-6">
      {/* Tournament Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Tournament Bracket</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{tournament.totalTeams || bracket.totalTeams || 0} Teams</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>{rounds.length} Rounds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket Visualization */}
      <div className="card overflow-x-auto">
        <div className="min-w-max">
          <div className="flex space-x-8">
            {rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="min-w-64">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {round.name || `Round ${roundIndex + 1}`}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {round.matches?.length || 0} matches
                  </p>
                </div>

                <div className="space-y-4">
                  {round.matches?.map((match, matchIndex) => (
                    <div key={matchIndex} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="text-center mb-2">
                        <span className="text-xs text-gray-500 font-medium">
                          Match {matchIndex + 1}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Team 1 */}
                        <div className={`p-2 rounded border ${
                          match.winnerId === match.team1?.id 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {match.team1?.name || 'TBD'}
                            </span>
                            {match.team1Score !== undefined && (
                              <span className="text-sm font-bold">
                                {match.team1Score}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* VS */}
                        <div className="text-center text-xs text-gray-400 font-medium">
                          VS
                        </div>

                        {/* Team 2 */}
                        <div className={`p-2 rounded border ${
                          match.winnerId === match.team2?.id 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {match.team2?.name || 'TBD'}
                            </span>
                            {match.team2Score !== undefined && (
                              <span className="text-sm font-bold">
                                {match.team2Score}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Match Status */}
                      <div className="mt-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          match.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : match.status === 'ONGOING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {match.status || 'PENDING'}
                        </span>
                      </div>

                      {/* Match Time */}
                      {match.scheduledTime && (
                        <div className="mt-2 text-center">
                          <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(match.scheduledTime).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tournament Winner */}
      {bracket.winner && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tournament Winner</h3>
            <p className="text-lg font-semibold text-yellow-700">
              {bracket.winner.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Congratulations to the champion!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracketView;
