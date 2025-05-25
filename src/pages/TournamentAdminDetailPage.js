import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  Trophy, 
  Calendar, 
  MapPin,
  Settings,
  BarChart3,
  Bell,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import { tournamentService, tournamentKnockoutService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import TournamentEditForm from '../components/tournament/TournamentEditForm';
import TournamentBracketGenerator from '../components/tournament/TournamentBracketGenerator';
import TournamentBracketView from '../components/tournament/TournamentBracketView';
import TournamentRoundManager from '../components/tournament/TournamentRoundManager';
import TeamRegistrationManager from '../components/tournament/TeamRegistrationManager';
import TournamentAnalytics from '../components/tournament/TournamentAnalytics';
import { formatDate, getStatusColor, getTournamentStatusLabel } from '../utils/helpers';
import toast from 'react-hot-toast';

const TournamentAdminDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: tournament, isLoading, error } = useQuery(
    ['tournament', id],
    () => tournamentService.getTournamentById(id),
    {
      select: (response) => response.data || response,
      enabled: !!id
    }
  );

  const { data: teams } = useQuery(
    ['tournament-teams', id],
    () => tournamentService.getTeamsByTournament(id),
    {
      select: (response) => response.data || response,
      enabled: !!id
    }
  );

  const { data: matches } = useQuery(
    ['tournament-matches', id],
    () => tournamentService.getMatchesByTournament(id),
    {
      select: (response) => response.data || response,
      enabled: !!id
    }
  );

  const { data: bracket } = useQuery(
    ['tournament-bracket', id],
    () => tournamentService.getTournamentBracket(id),
    {
      select: (response) => response.data || response,
      enabled: !!id && tournament?.status !== 'REGISTRATION'
    }
  );

  const deleteTournamentMutation = useMutation(
    () => tournamentService.deleteTournament(id),
    {
      onSuccess: () => {
        toast.success('Tournament deleted successfully');
        navigate('/admin/tournaments');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete tournament');
      }
    }
  );

  const startTournamentMutation = useMutation(
    () => tournamentService.startTournament(id),
    {
      onSuccess: () => {
        toast.success('Tournament started successfully');
        queryClient.invalidateQueries(['tournament', id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to start tournament');
      }
    }
  );

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      deleteTournamentMutation.mutate();
    }
  };

  const handleStart = () => {
    if (window.confirm('Are you sure you want to start this tournament?')) {
      startTournamentMutation.mutate();
    }
  };

  const canEdit = user?.role === 'ADMIN' || 
    (user?.role === 'ORGANIZER' && tournament?.createdBy?.id === user?.id);

  const tabs = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: Trophy,
      description: 'Tournament information and status'
    },
    { 
      id: 'teams', 
      name: 'Teams', 
      icon: Users,
      count: teams?.length || tournament?.currentTeams || 0,
      description: 'Manage registered teams'
    },
    { 
      id: 'bracket', 
      name: 'Bracket', 
      icon: Trophy,
      description: 'Tournament bracket and knockout management'
    },
    { 
      id: 'matches', 
      name: 'Matches', 
      icon: Calendar,
      count: matches?.length || 0,
      description: 'Match schedule and results'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: BarChart3,
      description: 'Tournament statistics and insights'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h2>
          <p className="text-gray-600 mb-4">The requested tournament could not be found.</p>
          <button onClick={() => navigate('/admin/tournaments')} className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/tournaments')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {getTournamentStatusLabel(tournament.status)}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{tournament.currentTeams}/{tournament.maxTeams} teams</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(tournament.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{tournament.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {canEdit && (
              <div className="flex items-center space-x-2">
                {tournament.status === 'REGISTRATION' && (
                  <button
                    onClick={handleStart}
                    className="btn-secondary"
                    disabled={startTournamentMutation.isLoading}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Tournament
                  </button>
                )}
                
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  disabled={deleteTournamentMutation.isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id 
                        ? 'bg-primary-100 text-primary-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-600">Registered Teams</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {tournament.currentTeams}/{tournament.maxTeams}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-600">Matches</p>
                        <p className="text-2xl font-bold text-green-900">{matches?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-orange-600">Sport Type</p>
                        <p className="text-lg font-bold text-orange-900">{tournament.sportType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-purple-600">Location</p>
                        <p className="text-lg font-bold text-purple-900 truncate">{tournament.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Description</label>
                        <p className="text-gray-900">{tournament.description || 'No description provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Rules</label>
                        <p className="text-gray-900">{tournament.rules || 'No specific rules defined'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Prize Information</label>
                        <p className="text-gray-900">{tournament.prizeInfo || 'No prize information available'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Registration Deadline</label>
                        <p className="text-gray-900">{formatDate(tournament.registrationDeadline)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                        <p className="text-gray-900">{formatDate(tournament.startDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">End Date</label>
                        <p className="text-gray-900">{formatDate(tournament.endDate) || 'TBD'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact Information</label>
                        <p className="text-gray-900">{tournament.contactInfo}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <TeamRegistrationManager 
                tournament={tournament} 
                teams={teams}
                onTeamsUpdated={() => {
                  queryClient.invalidateQueries(['tournament-teams', id]);
                  queryClient.invalidateQueries(['tournament', id]);
                }}
              />
            )}

            {/* Bracket Tab */}
            {activeTab === 'bracket' && (
              <div className="space-y-6">
                {tournament.status === 'REGISTRATION' && (
                  <TournamentBracketGenerator 
                    tournament={tournament}
                    onBracketGenerated={() => {
                      queryClient.invalidateQueries(['tournament-bracket', id]);
                      queryClient.invalidateQueries(['tournament', id]);
                    }}
                  />
                )}
                
                {bracket && <TournamentBracketView bracket={bracket} tournament={tournament} />}
                
                {tournament.status === 'ONGOING' && (
                  <TournamentRoundManager 
                    tournament={tournament}
                    currentRound={bracket?.currentRound}
                    matches={matches}
                    onRoundAdvanced={() => {
                      queryClient.invalidateQueries(['tournament-bracket', id]);
                      queryClient.invalidateQueries(['tournament-matches', id]);
                      queryClient.invalidateQueries(['tournament', id]);
                    }}
                  />
                )}
              </div>
            )}

            {/* Matches Tab */}
            {activeTab === 'matches' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Match Schedule</h3>
                  <div className="text-sm text-gray-600">
                    {matches?.filter(m => m.status === 'COMPLETED').length || 0} of {matches?.length || 0} completed
                  </div>
                </div>
                
                {matches?.length > 0 ? (
                  <div className="space-y-4">
                    {matches.map((match, index) => (
                      <div key={match.id || index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm font-medium text-gray-500">
                              Match {index + 1}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{match.team1?.name || 'TBD'}</span>
                              <span className="text-gray-400">vs</span>
                              <span className="font-medium">{match.team2?.name || 'TBD'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {match.score && (
                              <div className="text-sm font-bold">
                                {match.team1Score} - {match.team2Score}
                              </div>
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              match.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800'
                                : match.status === 'ONGOING'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {match.status || 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No matches scheduled yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <TournamentAnalytics tournament={tournament} matches={matches} teams={teams} />
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <TournamentEditForm
          tournament={tournament}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries(['tournament', id]);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TournamentAdminDetailPage;