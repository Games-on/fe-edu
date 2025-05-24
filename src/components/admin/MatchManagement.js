import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Users,
  Trophy,
  Clock,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Target
} from 'lucide-react';
import { matchService } from '../../services';
import { formatDateTime, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MatchManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Mock data - replace with real API calls
  const { data: matches, isLoading } = useQuery(
    ['admin-matches', { search: searchTerm, status: statusFilter, tournament: tournamentFilter }],
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [
        {
          id: 1,
          tournament: { id: 1, name: 'Spring Championship 2024' },
          team1: { id: 1, name: 'Eagles FC', logo: null },
          team2: { id: 2, name: 'Tigers United', logo: null },
          team1Score: 2,
          team2Score: 1,
          status: 'COMPLETED',
          scheduledTime: '2024-05-20T15:00:00Z',
          actualStartTime: '2024-05-20T15:05:00Z',
          actualEndTime: '2024-05-20T16:45:00Z',
          venue: 'Stadium A',
          round: 'Semi-final',
          referee: 'John Smith'
        },
        {
          id: 2,
          tournament: { id: 1, name: 'Spring Championship 2024' },
          team1: { id: 3, name: 'Lions FC', logo: null },
          team2: { id: 4, name: 'Panthers SC', logo: null },
          team1Score: null,
          team2Score: null,
          status: 'SCHEDULED',
          scheduledTime: '2024-05-25T14:00:00Z',
          actualStartTime: null,
          actualEndTime: null,
          venue: 'Stadium B',
          round: 'Final',
          referee: 'Jane Doe'
        },
        {
          id: 3,
          tournament: { id: 2, name: 'Summer League 2024' },
          team1: { id: 5, name: 'Wolves FC', logo: null },
          team2: { id: 6, name: 'Bears United', logo: null },
          team1Score: 1,
          team2Score: 1,
          status: 'ONGOING',
          scheduledTime: '2024-05-24T16:00:00Z',
          actualStartTime: '2024-05-24T16:00:00Z',
          actualEndTime: null,
          venue: 'Stadium C',
          round: 'Quarter-final',
          referee: 'Mike Johnson'
        }
      ];
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const queryClient = useQueryClient();

  const updateMatchScoreMutation = useMutation(
    ({ matchId, scoreData }) => matchService.updateMatchScore(matchId, scoreData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-matches');
        toast.success('Match score updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update match score');
      }
    }
  );

  const updateMatchStatusMutation = useMutation(
    ({ matchId, statusData }) => matchService.updateMatchStatus(matchId, statusData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-matches');
        toast.success('Match status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update match status');
      }
    }
  );

  const filteredMatches = matches?.filter(match => {
    const matchesSearch = match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.team2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || match.status === statusFilter;
    const matchesTournament = !tournamentFilter || match.tournament.id.toString() === tournamentFilter;
    
    return matchesSearch && matchesStatus && matchesTournament;
  }) || [];

  const handleEditMatch = (match) => {
    setSelectedMatch(match);
    setShowEditModal(true);
  };

  const handleUpdateScore = (matchId, team1Score, team2Score) => {
    updateMatchScoreMutation.mutate({
      matchId,
      scoreData: { team1Score, team2Score }
    });
  };

  const handleUpdateStatus = (matchId, newStatus) => {
    updateMatchStatusMutation.mutate({
      matchId,
      statusData: { status: newStatus }
    });
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'POSTPONED', label: 'Postponed' }
  ];

  const tournamentOptions = [
    { value: '', label: 'All Tournaments' },
    { value: '1', label: 'Spring Championship 2024' },
    { value: '2', label: 'Summer League 2024' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="h-4 w-4" />;
      case 'ONGOING':
        return <Play className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      case 'POSTPONED':
        return <Pause className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Match Management</h2>
          <p className="text-gray-600">Schedule, manage, and track match results</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule Match</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="input-field"
          >
            {tournamentOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4 mb-6">
        {filteredMatches.map((match) => (
          <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getStatusColor(match.status)} flex items-center space-x-1`}>
                  {getStatusIcon(match.status)}
                  <span className="text-sm font-medium">{match.status}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {match.tournament.name} - {match.round}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Match ID: {match.id}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team 1 */}
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{match.team1.name}</h3>
                <div className="text-3xl font-bold text-primary-600 mt-2">
                  {match.team1Score !== null ? match.team1Score : '-'}
                </div>
              </div>

              {/* Match Info */}
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-gray-400">VS</div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateTime(match.scheduledTime)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{match.venue}</div>
                <div className="text-sm text-gray-500">Referee: {match.referee}</div>
              </div>

              {/* Team 2 */}
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{match.team2.name}</h3>
                <div className="text-3xl font-bold text-orange-600 mt-2">
                  {match.team2Score !== null ? match.team2Score : '-'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditMatch(match)}
                  className="btn-secondary text-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                {match.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleUpdateStatus(match.id, 'ONGOING')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </button>
                )}
                {match.status === 'ONGOING' && (
                  <button
                    onClick={() => handleUpdateStatus(match.id, 'COMPLETED')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </button>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {match.actualStartTime && (
                  <span>Started: {formatDateTime(match.actualStartTime)}</span>
                )}
                {match.actualEndTime && (
                  <span>Ended: {formatDateTime(match.actualEndTime)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600 mb-4">Schedule your first match to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Schedule Match
          </button>
        </div>
      )}

      {/* Match Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {matches?.filter(m => m.status === 'SCHEDULED').length || 0}
            </div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {matches?.filter(m => m.status === 'ONGOING').length || 0}
            </div>
            <div className="text-sm text-gray-500">Ongoing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {matches?.filter(m => m.status === 'COMPLETED').length || 0}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {matches?.filter(m => m.status === 'POSTPONED').length || 0}
            </div>
            <div className="text-sm text-gray-500">Postponed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {matches?.filter(m => m.status === 'CANCELLED').length || 0}
            </div>
            <div className="text-sm text-gray-500">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchManagement;