import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  MapPin,
  Users,
  Trophy,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { matchService, tournamentService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MatchManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Get tournaments for filter dropdown
  const { data: tournaments } = useQuery(
    'tournaments-for-filter',
    () => tournamentService.getAllTournaments({ page: 1, limit: 100 }),
    {
      select: (response) => response?.data || [],
      staleTime: 10 * 60 * 1000
    }
  );

  // Mock match data since we need to aggregate from multiple tournaments
  const { data: matches, isLoading, error } = useQuery(
    ['admin-matches', { page, searchTerm, status: statusFilter, tournament: tournamentFilter }],
    async () => {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMatches = [
        {
          id: 1,
          tournament: { id: 1, name: 'Spring Championship' },
          team1: { id: 1, name: 'Team Alpha', teamColor: '#FF0000' },
          team2: { id: 2, name: 'Team Beta', teamColor: '#0000FF' },
          roundNumber: 1,
          roundName: 'Quarter Finals',
          matchDate: new Date('2025-06-01T15:00:00'),
          location: 'Main Stadium',
          status: 'SCHEDULED',
          team1Score: 0,
          team2Score: 0,
          referee: 'John Referee'
        },
        {
          id: 2,
          tournament: { id: 1, name: 'Spring Championship' },
          team1: { id: 3, name: 'Team Gamma', teamColor: '#00FF00' },
          team2: { id: 4, name: 'Team Delta', teamColor: '#FFFF00' },
          roundNumber: 1,
          roundName: 'Quarter Finals',
          matchDate: new Date('2025-06-01T17:00:00'),
          location: 'Secondary Field',
          status: 'IN_PROGRESS',
          team1Score: 2,
          team2Score: 1,
          referee: 'Jane Referee'
        },
        {
          id: 3,
          tournament: { id: 2, name: 'Summer League' },
          team1: { id: 5, name: 'Team Echo', teamColor: '#FF00FF' },
          team2: { id: 6, name: 'Team Foxtrot', teamColor: '#00FFFF' },
          roundNumber: 2,
          roundName: 'Semi Finals',
          matchDate: new Date('2025-05-30T14:00:00'),
          location: 'Training Ground',
          status: 'COMPLETED',
          team1Score: 3,
          team2Score: 2,
          referee: 'Bob Referee'
        }
      ];

      // Apply filters
      let filteredMatches = mockMatches;
      
      if (tournamentFilter) {
        filteredMatches = filteredMatches.filter(match => 
          match.tournament.id.toString() === tournamentFilter
        );
      }
      
      if (statusFilter) {
        filteredMatches = filteredMatches.filter(match => 
          match.status === statusFilter
        );
      }
      
      if (searchTerm) {
        filteredMatches = filteredMatches.filter(match => 
          match.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.team2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          match.tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return {
        data: filteredMatches,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredMatches.length / 10),
          totalItems: filteredMatches.length,
          hasNext: page < Math.ceil(filteredMatches.length / 10),
          hasPrev: page > 1
        }
      };
    },
    { 
      staleTime: 2 * 60 * 1000,
      keepPreviousData: true
    }
  );

  // Mock mutations
  const updateMatchMutation = useMutation(
    async ({ matchId, updateData }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Match updated successfully');
        queryClient.invalidateQueries('admin-matches');
      },
      onError: () => {
        toast.error('Failed to update match');
      }
    }
  );

  const deleteMatchMutation = useMutation(
    async (matchId) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    {
      onSuccess: () => {
        toast.success('Match deleted successfully');
        queryClient.invalidateQueries('admin-matches');
      },
      onError: () => {
        toast.error('Failed to delete match');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleUpdateStatus = (matchId, newStatus) => {
    updateMatchMutation.mutate({
      matchId,
      updateData: { status: newStatus }
    });
  };

  const handleDeleteMatch = (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      deleteMatchMutation.mutate(matchId);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'CANCELLED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'SCHEDULED':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'COMPLETED':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusActions = (match) => {
    switch (match.status) {
      case 'SCHEDULED':
        return (
          <button
            onClick={() => handleUpdateStatus(match.id, 'IN_PROGRESS')}
            className="text-gray-600 hover:text-green-600 transition-colors"
            title="Start Match"
          >
            <Play className="h-4 w-4" />
          </button>
        );
      case 'IN_PROGRESS':
        return (
          <button
            onClick={() => handleUpdateStatus(match.id, 'COMPLETED')}
            className="text-gray-600 hover:text-blue-600 transition-colors"
            title="Complete Match"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Error loading matches. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Match Management</h2>
          <p className="text-gray-600">Schedule matches, update scores, and manage game results</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {matches?.pagination?.totalItems || 0} Matches
          </div>
          <button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Match
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search matches by team or tournament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={tournamentFilter}
              onChange={(e) => setTournamentFilter(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="">All Tournaments</option>
              {tournaments?.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              type="submit"
              className="btn-primary whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </button>
          </div>
        </form>
      </div>

      {/* Matches Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
        ) : matches?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No matches found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matches?.data?.map((match) => (
                  <tr key={match.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {match.tournament.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {match.roundName} - Round {match.roundNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: match.team1.teamColor }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {match.team1.name}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">vs</div>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: match.team2.teamColor }}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {match.team2.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {match.team1Score} - {match.team2Score}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(match.status)}
                        <span className={getStatusBadge(match.status)}>
                          {match.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(match.matchDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{match.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/matches/${match.id}`, '_blank')}
                          className="text-gray-600 hover:text-primary-600 transition-colors"
                          title="View Match"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/admin/matches/${match.id}/edit`, '_blank')}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          title="Edit Match"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {getStatusActions(match)}
                        <button
                          onClick={() => handleDeleteMatch(match.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete Match"
                          disabled={deleteMatchMutation.isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {matches?.pagination?.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {matches.pagination.currentPage} of {matches.pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= matches.pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchManagement;