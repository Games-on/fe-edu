import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Trophy, 
  ArrowLeft, 
  Clock,
  Target,
  Award,
  Settings,
  Play,
  UserPlus
} from 'lucide-react';
import { tournamentService, teamService, matchService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TournamentBracketGenerator from '../components/tournament/TournamentBracketGenerator';
import TournamentRoundManager from '../components/tournament/TournamentRoundManager';
import TournamentBracketView from '../components/tournament/TournamentBracketView';
import TeamRegistrationModal from '../components/tournament/TeamRegistrationModal';
import { formatDate, formatDateTime, getStatusColor } from '../utils/helpers';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const { data: tournament, isLoading: tournamentLoading, refetch: refetchTournament } = useQuery(
    ['tournament', id],
    () => tournamentService.getTournamentById(id),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useQuery(
    ['tournament-teams', id],
    () => teamService.getTeamsByTournament(id),
    { 
      staleTime: 5 * 60 * 1000,
      enabled: !!id,
      onSuccess: (data) => {
        console.log('👥 [TournamentDetailPage] Teams data loaded:', data);
      },
      onError: (error) => {
        console.error('❌ [TournamentDetailPage] Teams loading failed:', error);
      }
    }
  );

  const { data: matches, isLoading: matchesLoading, refetch: refetchMatches } = useQuery(
    ['tournament-matches', id],
    () => matchService.getMatchesByTournament(id),
    { 
      staleTime: 5 * 60 * 1000,
      enabled: !!id 
    }
  );

  const { data: bracket, isLoading: bracketLoading, refetch: refetchBracket } = useQuery(
    ['tournament-bracket', id],
    () => matchService.getTournamentBracket(id),
    { 
      staleTime: 5 * 60 * 1000,
      enabled: !!id && (tournament?.data?.status === 'READY' || tournament?.data?.status === 'ONGOING' || tournament?.data?.status === 'COMPLETED')
    }
  );

  const handleBracketGenerated = (bracketData) => {
    refetchTournament();
    refetchBracket();
    refetchMatches();
  };

  const handleRoundAdvanced = (roundData) => {
    refetchMatches();
    refetchBracket();
  };

  if (tournamentLoading) {
    return <LoadingSpinner />;
  }

  if (!tournament?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament not found</h2>
          <Link to="/tournaments" className="text-primary-600 hover:text-primary-700">
            ← Back to tournaments
          </Link>
        </div>
      </div>
    );
  }

  const tournamentData = tournament.data;
  const canRegister = user && !isAdmin && (tournamentData.status === 'REGISTRATION' || tournamentData.status === 'UPCOMING');
  const currentRound = matches?.data?.currentRound;
  const roundMatches = matches?.data?.matches?.filter(match => match.round === currentRound) || [];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Trophy },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'matches', name: 'Matches', icon: Play },
    { id: 'bracket', name: 'Bracket', icon: Target },
    ...(isAdmin ? [{ id: 'management', name: 'Management', icon: Settings }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/tournaments"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Tournaments
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{tournamentData.name}</h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournamentData.status)}`}>
                  {tournamentData.status}
                </div>
              </div>
              <p className="text-lg text-gray-600">{tournamentData.description}</p>
            </div>
            
            {canRegister && (
              <div className="mt-4 lg:mt-0">
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Đăng ký tham gia</span>
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tournament Info */}
              <div className="card mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tournament Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">{formatDate(tournamentData.startDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">End Date</p>
                        <p className="font-medium">{formatDate(tournamentData.endDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Team Capacity</p>
                        <p className="font-medium">{teams?.data?.length || 0} / {tournamentData.maxTeams} teams</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {tournamentData.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium">{tournamentData.location}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Tournament Type</p>
                        <p className="font-medium">{tournamentData.type || 'Standard'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Format</p>
                        <p className="font-medium">{tournamentData.format || 'Knockout'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {tournamentData.rules && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Rules & Regulations</h3>
                    <div className="prose text-gray-600">
                      <p>{tournamentData.rules}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registered Teams</span>
                    <span className="font-medium">{teams?.data?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Matches</span>
                    <span className="font-medium">{matches?.data?.totalMatches || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Matches</span>
                    <span className="font-medium">{matches?.data?.completedMatches || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Round</span>
                    <span className="font-medium">{currentRound || 1}</span>
                  </div>
                </div>
              </div>

              {/* Tournament Organizer */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-sports-purple rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tournamentData.organizer || 'EduSports'}</p>
                    <p className="text-sm text-gray-500">Tournament Organizer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Registered Teams</h2>
              <span className="text-sm text-gray-500">
                {teams?.data?.length || 0} teams registered
              </span>
            </div>

            {teamsLoading ? (
              <LoadingSpinner size="small" />
            ) : teams?.data?.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No teams registered yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams?.data?.map((team, index) => (
                  <div key={team.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{team.name}</h3>
                        <p className="text-sm text-gray-500">{team.memberCount || 0} members</p>
                      </div>
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Registered: {formatDate(team.registrationDate || team.createdAt)}</span>
                      <div className={`px-2 py-1 rounded-full ${getStatusColor(team.status || 'APPROVED')}`}>
                        {team.status || 'APPROVED'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="space-y-6">
            {matchesLoading ? (
              <LoadingSpinner />
            ) : matches?.data?.matches?.length === 0 ? (
              <div className="card text-center py-12">
                <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Yet</h3>
                <p className="text-gray-600">
                  Matches will be available once the tournament bracket is generated.
                </p>
              </div>
            ) : (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tournament Matches</h2>
                <div className="space-y-4">
                  {matches.data.matches.map((match) => (
                    <div key={match.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="text-center min-w-24">
                            <p className="font-medium text-gray-900">{match.team1?.name || 'TBD'}</p>
                            <p className="text-3xl font-bold text-primary-600">{match.team1Score || 0}</p>
                          </div>
                          <div className="text-gray-400 font-medium">VS</div>
                          <div className="text-center min-w-24">
                            <p className="font-medium text-gray-900">{match.team2?.name || 'TBD'}</p>
                            <p className="text-3xl font-bold text-primary-600">{match.team2Score || 0}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">
                            Round {match.round || 1} • Match {match.matchNumber || 1}
                          </div>
                          <div className="text-sm text-gray-500 mb-2">
                            {formatDateTime(match.scheduledTime)}
                          </div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                            {match.status}
                          </div>
                        </div>
                      </div>
                      {match.location && (
                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {match.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bracket' && (
          <div>
            {bracketLoading ? (
              <LoadingSpinner />
            ) : (
              <TournamentBracketView bracket={bracket?.data} tournament={tournamentData} />
            )}
          </div>
        )}

        {activeTab === 'management' && isAdmin && (
          <div className="space-y-6">
            <TournamentBracketGenerator 
              tournament={tournamentData} 
              onBracketGenerated={handleBracketGenerated}
            />
            
            {(tournamentData.status === 'ONGOING' || tournamentData.status === 'READY') && (
              <TournamentRoundManager 
                tournament={tournamentData}
                currentRound={currentRound}
                matches={roundMatches}
                onRoundAdvanced={handleRoundAdvanced}
              />
            )}
          </div>
        )}
      </div>

      {/* Team Registration Modal */}
      <TeamRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        tournament={tournamentData}
        onSuccess={() => {
          setShowRegistrationModal(false);
          refetchTournament();
          refetchTeams();
        }}
      />
    </div>
  );
};

export default TournamentDetailPage;
