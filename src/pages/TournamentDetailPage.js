import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
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
import RoundManager from '../components/tournament/RoundManager';
import TournamentBracketView from '../components/tournament/TournamentBracketView';
import MatchResultsManager from '../components/tournament/MatchResultsManager';
import TeamRegistrationModal from '../components/tournament/TeamRegistrationModal';
import TournamentManagement from '../components/tournament/TournamentManagement';
import TournamentWorkflowGuide from '../components/tournament/TournamentWorkflowGuide';
import { formatDate, formatDateTime, getStatusColor } from '../utils/helpers';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showWorkflowGuide, setShowWorkflowGuide] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const { data: tournament, isLoading: tournamentLoading, refetch: refetchTournament } = useQuery(
    ['tournament', id],
    () => tournamentService.getTournamentById(id),
    { staleTime: 1000 } // 1 second for fast updates
  );

  const { data: teams, isLoading: teamsLoading, refetch: refetchTeams } = useQuery(
    ['tournament-teams', id],
    () => teamService.getTeamsByTournament(id),
    { 
      staleTime: 1000, // 1 second for fast updates
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
      staleTime: 1000, // 1 second for fast updates
      enabled: !!id 
    }
  );

  const { data: currentRoundData, isLoading: currentRoundLoading, error: currentRoundError } = useQuery(
    ['tournament-current-round', id],
    () => {
      console.log('🚀 [getCurrentRound] API call triggered for tournament:', id);
      return tournamentService.getCurrentRound(id);
    },
    { 
      staleTime: 1000, // 1 second for fast updates
      enabled: !!id, // Enable for all tournament states
      onSuccess: (data) => {
        console.log('✅ [getCurrentRound] API success:', data);
      },
      onError: (error) => {
        console.error('❌ [getCurrentRound] API error:', error);
      }
    }
  );

  const { data: bracket, isLoading: bracketLoading, refetch: refetchBracket } = useQuery(
    ['tournament-bracket', id],
    () => matchService.getTournamentBracket(id),
    { 
      staleTime: 1000, // 1 second for fast updates
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
    refetchTournament();
    // Refetch current round data
    queryClient.invalidateQueries(['tournament-current-round', id]);
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
  
  // Safety check for tournamentData
  if (!tournamentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  const canRegister = user && !isAdmin && (tournamentData.status === 'REGISTRATION' || tournamentData.status === 'UPCOMING');
  
  // Safe extraction of matches data
  const matchesData = matches?.data || matches || {};
  
  // Get current round from tournament data first, fallback to calculation
  let currentRound = 1;
  
  // Debug: Log all possible data sources
  console.log('🔍 [DEBUG] Data sources for current round:');
  console.log('  currentRoundData:', currentRoundData);
  console.log('  currentRoundData?.data:', currentRoundData?.data);
  console.log('  currentRoundData?.data?.data:', currentRoundData?.data?.data);
  console.log('  tournamentData.currentRound:', tournamentData.currentRound);
  console.log('  bracket?.data?.currentRound:', bracket?.data?.currentRound);
  
  // Method 1: Use dedicated current round API
  if (currentRoundData?.data?.data?.currentRound) {
    // Standard API response format
    currentRound = currentRoundData.data.data.currentRound;
    console.log('🎯 [TournamentDetailPage] Using currentRound from API (standard):', currentRound);
  }
  else if (currentRoundData?.data?.currentRound) {
    // Fallback format
    currentRound = currentRoundData.data.currentRound;
    console.log('🎯 [TournamentDetailPage] Using currentRound from API (fallback):', currentRound);
  }
  // Method 2: Check if backend returns currentRound in tournament data
  else if (tournamentData.currentRound) {
    currentRound = tournamentData.currentRound;
    console.log('🎯 [TournamentDetailPage] Using currentRound from tournament data:', currentRound);
  }
  // Method 3: Check bracket data for current round
  else if (bracket?.data?.currentRound) {
    currentRound = bracket.data.currentRound;
    console.log('🎯 [TournamentDetailPage] Using currentRound from bracket:', currentRound);
  }
  // Method 4: Fallback calculation based on match data
  else if (matchesData?.matches?.length > 0) {
    // Find the highest round with matches
    const rounds = matchesData.matches.map(m => m.round || 1);
    const maxRound = Math.max(...rounds);
    
    // Find rounds with incomplete matches
    const incompleteRounds = [];
    for (let round = 1; round <= maxRound; round++) {
      const roundMatches = matchesData.matches.filter(m => (m.round || 1) === round);
      const completed = roundMatches.filter(m => m.status === 'COMPLETED').length;
      if (completed < roundMatches.length) {
        incompleteRounds.push(round);
      }
    }
    
    // Current round logic
    if (incompleteRounds.length > 0) {
      // There are incomplete rounds - current is the lowest incomplete round
      currentRound = Math.min(...incompleteRounds);
    } else {
      // All existing rounds completed - current round is next round (maxRound + 1)
      currentRound = maxRound + 1;
    }
    
    console.log('🔍 [TournamentDetailPage] Calculated currentRound:', currentRound);
  }
  
  console.log('🎯 [FINAL] Current Round Result:', currentRound);
  const matchesList = matchesData?.matches || [];
  const roundMatches = matchesList.filter(match => match.round === currentRound) || [];
  
  // Debug logging
  console.log('🔍 [TournamentDetailPage] Round calculation FIXED:', {
    matchesCount: matchesList.length,
    currentRound,
    roundMatches: roundMatches.length,
    allRounds: (() => {
      const roundsInfo = {};
      const allRounds = matchesList.map(m => m.round || 1);
      const maxRound = allRounds.length > 0 ? Math.max(...allRounds) : 1;
      for (let r = 1; r <= maxRound; r++) {
        const rMatches = matchesList.filter(m => (m.round || 1) === r);
        const completed = rMatches.filter(m => m.status === 'COMPLETED').length;
        roundsInfo[`Round ${r}`] = `${completed}/${rMatches.length} completed`;
      }
      return roundsInfo;
    })()
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Trophy },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'matches', name: 'Matches', icon: Play },
    { id: 'bracket', name: 'Bracket', icon: Target },
    ...(isAdmin ? [
      { id: 'match-results', name: 'Match Results', icon: Award },
      { id: 'round-management', name: 'Round Management', icon: ArrowLeft },
      { id: 'management', name: 'Management', icon: Settings }
    ] : [])
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
              
              {/* Tournament Champion Banner */}
              {tournamentData.winnerTeam && tournamentData.status === 'COMPLETED' && (
                <div className="mt-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">🏆 Tournament Champion</p>
                      <p className="text-xl font-bold text-gray-900">{tournamentData.winnerTeam.name}</p>
                      {tournamentData.runnerUpTeam && (
                        <p className="text-sm text-gray-600">Runner-up: {tournamentData.runnerUpTeam.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-3">
              {canRegister && (
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Đăng ký tham gia</span>
                </button>
              )}
              
              {isAdmin && (tournamentData.status === 'ONGOING' || tournamentData.status === 'READY') && (
                <button
                  onClick={() => setShowWorkflowGuide(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Target className="h-4 w-4" />
                  <span>Workflow Guide</span>
                </button>
              )}
            </div>
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
              {/* Tournament Champion Celebration */}
              {tournamentData.status === 'COMPLETED' && tournamentData.winnerTeam && (
                <div className="card mb-8 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300">
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Trophy className="h-16 w-16 text-yellow-600" />
                        <div className="absolute -top-2 -right-2 text-2xl">🎆</div>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Tournament Champion! 🎉</h2>
                    <p className="text-xl font-semibold text-yellow-800 mb-4">{tournamentData.winnerTeam.name}</p>
                    <div className="flex justify-center space-x-8 text-sm text-gray-600">
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-900">🥇</div>
                        <div>Champion</div>
                        <div className="font-medium">{tournamentData.winnerTeam.name}</div>
                      </div>
                      {tournamentData.runnerUpTeam && (
                        <div className="text-center">
                          <div className="font-bold text-lg text-gray-900">🥈</div>
                          <div>Runner-up</div>
                          <div className="font-medium">{tournamentData.runnerUpTeam.name}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
              {/* Tournament Champion & Runner-up */}
              {(tournamentData.winnerTeam || tournamentData.runnerUpTeam) && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span>Tournament Results</span>
                  </h3>
                  
                  {/* Champion */}
                  {tournamentData.winnerTeam && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-yellow-800">🥇 Champion</p>
                          </div>
                          <p className="font-bold text-lg text-yellow-900">{tournamentData.winnerTeam.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Runner-up */}
                  {tournamentData.runnerUpTeam && (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-700">🥈 Runner-up</p>
                          </div>
                          <p className="font-bold text-lg text-gray-900">{tournamentData.runnerUpTeam.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                    <span className="font-medium">{matchesData?.totalMatches || matchesList.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Matches</span>
                    <span className="font-medium">{matchesData?.completedMatches || matchesList.filter(m => m?.status === 'COMPLETED').length || 0}</span>
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

              {/* Tournament Winner */}
              {tournamentData.winnerTeam && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Tournament Champion</h3>
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900">{tournamentData.winnerTeam.name}</h4>
                        <p className="text-sm text-yellow-700 font-medium">🥇 Tournament Champion</p>
                      </div>
                    </div>
                    
                    {tournamentData.runnerUpTeam && (
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{tournamentData.runnerUpTeam.name}</p>
                            <p className="text-xs text-gray-600">🥈 Runner-up</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
            ) : matchesList.length === 0 ? (
              <div className="card text-center py-12">
                <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Yet</h3>
                <p className="text-gray-600">
                  Matches will be available once the tournament bracket is generated.
                </p>
                {isAdmin && tournamentData.status === 'REGISTRATION' && (
                  <div className="mt-6">
                    <TournamentBracketGenerator
                      tournament={tournamentData}
                      onBracketGenerated={handleBracketGenerated}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tournament Matches</h2>
                <div className="space-y-4">
                  {matchesList.map((match) => (
                    <div key={match.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className={`text-center min-w-24 p-2 rounded-lg ${
                            match.winnerTeam?.id === match.team1?.id 
                              ? 'bg-green-100 border-2 border-green-300' 
                              : match.status === 'COMPLETED' && match.winnerTeam?.id !== match.team1?.id
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-white border border-gray-200'
                          }`}>
                            <p className="font-medium text-gray-900 flex items-center justify-center">
                              {match.team1?.name || 'TBD'}
                              {match.winnerTeam?.id === match.team1?.id && (
                                <Trophy className="h-4 w-4 text-green-600 ml-1" />
                              )}
                            </p>
                            <p className="text-3xl font-bold text-primary-600">{match.team1Score || 0}</p>
                          </div>
                          
                          <div className="text-gray-400 font-medium">VS</div>
                          
                          <div className={`text-center min-w-24 p-2 rounded-lg ${
                            match.winnerTeam?.id === match.team2?.id 
                              ? 'bg-green-100 border-2 border-green-300' 
                              : match.status === 'COMPLETED' && match.winnerTeam?.id !== match.team2?.id
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-white border border-gray-200'
                          }`}>
                            <p className="font-medium text-gray-900 flex items-center justify-center">
                              {match.team2?.name || 'TBD'}
                              {match.winnerTeam?.id === match.team2?.id && (
                                <Trophy className="h-4 w-4 text-green-600 ml-1" />
                              )}
                            </p>
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
                          
                          {/* Winner Display */}
                          {match.winnerTeam && match.status === 'COMPLETED' && (
                            <div className="mt-2 text-xs text-green-600 font-medium flex items-center justify-end">
                              <Trophy className="h-3 w-3 mr-1" />
                              Winner: {match.winnerTeam.name}
                            </div>
                          )}
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
          <div className="space-y-6">
            {/* Bracket Generator for Admin */}
            {isAdmin && (tournamentData.status === 'REGISTRATION' || tournamentData.status === 'UPCOMING' || tournamentData.status === 'READY_TO_START') && (
              <TournamentBracketGenerator
                tournament={tournamentData}
                onBracketGenerated={handleBracketGenerated}
              />
            )}
            
            {/* Bracket View */}
            {bracketLoading ? (
              <LoadingSpinner />
            ) : (
              <TournamentBracketView tournament={tournamentData} />
            )}
          </div>
        )}

        {activeTab === 'match-results' && isAdmin && (
          <MatchResultsManager
            tournament={tournamentData}
            currentRound={currentRound || 1}
            onMatchResultUpdated={handleRoundAdvanced}
          />
        )}

        {activeTab === 'round-management' && isAdmin && (
          <RoundManager
            tournament={tournamentData}
            currentRound={currentRound || 1}
            onRoundAdvanced={handleRoundAdvanced}
          />
        )}

        {activeTab === 'management' && isAdmin && (
          <div className="space-y-6">
            {/* Tournament Status & Controls */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tournament Management</h2>
              
              {/* Tournament Actions Based on Status */}
              {tournamentData.status === 'REGISTRATION' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Registration Phase</h3>
                    <p className="text-blue-700 mb-4">
                      Tournament is currently in registration phase. 
                      You can generate bracket once enough teams have registered.
                    </p>
                    <TournamentBracketGenerator
                      tournament={tournamentData}
                      onBracketGenerated={handleBracketGenerated}
                    />
                  </div>
                </div>
              )}
              
              {(tournamentData.status === 'READY' || tournamentData.status === 'ONGOING') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Management</h3>
                    <MatchResultsManager
                      tournament={tournamentData}
                      currentRound={currentRound || 1}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Round Management</h3>
                    <RoundManager
                      tournament={tournamentData}
                      currentRound={currentRound || 1}
                    />
                  </div>
                </div>
              )}
              
              {tournamentData.status === 'COMPLETED' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">Tournament Completed!</h3>
                  <p className="text-green-700">
                    This tournament has been successfully completed. 
                    All results and brackets are final.
                  </p>
                </div>
              )}
            </div>
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
      
      {/* Tournament Workflow Guide */}
      {showWorkflowGuide && tournamentData && (
        <TournamentWorkflowGuide
          tournament={tournamentData}
          currentRound={currentRound}
          matches={matchesList}
          onClose={() => setShowWorkflowGuide(false)}
        />
      )}
    </div>
  );
};

export default TournamentDetailPage;
