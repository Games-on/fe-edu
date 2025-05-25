import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Trophy, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Users,
  MapPin,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';
import { tournamentService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';
import TournamentCreateForm from '../tournament/TournamentCreateForm';
import { 
  formatDate, 
  getStatusColor, 
  getSportTypeLabel,
  getTournamentStatusLabel 
} from '../../utils/helpers';
import { QUERY_KEYS } from '../../utils/constants';
import toast from 'react-hot-toast';

const TournamentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: tournaments, isLoading, error } = useQuery(
    [QUERY_KEYS.TOURNAMENTS, { page, searchTerm, status: statusFilter }],
    () => tournamentService.getAllTournaments({
      page,
      limit: 10,
      search: searchTerm,
      status: statusFilter,
    }),
    {
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      select: (response) => {
        // Handle different response formats from backend
        if (response?.success && response?.data) {
          return {
            data: response.data,
            pagination: response.pagination || {
              currentPage: page,
              totalPages: 1,
              totalItems: response.data?.length || 0,
              hasNext: false,
              hasPrev: false
            }
          };
        }
        return response;
      }
    }
  );

  const deleteTournamentMutation = useMutation(
    (tournamentId) => tournamentService.deleteTournament(tournamentId),
    {
      onSuccess: () => {
        toast.success('Xóa giải đấu thành công');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete tournament');
      }
    }
  );

  const startTournamentMutation = useMutation(
    (tournamentId) => tournamentService.startTournament(tournamentId),
    {
      onSuccess: () => {
        toast.success('Bắt đầu giải đấu thành công');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to start tournament');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDeleteTournament = (tournamentId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giải đấu này? Hành động này không thể hoàn tác.')) {
      deleteTournamentMutation.mutate(tournamentId);
    }
  };

  const handleStartTournament = (tournamentId) => {
    if (window.confirm('Bạn có chắc chắn muốn bắt đầu giải đấu này?')) {
      startTournamentMutation.mutate(tournamentId);
    }
  };

  const handleCreateSuccess = (newTournament) => {
    console.log('Tournament created successfully:', newTournament);
    // Query will be automatically invalidated by the mutation
  };

  const getStatusAction = (tournament) => {
    switch (tournament.status) {
      case 'REGISTRATION_OPEN':
        return (
          <button
            onClick={() => handleStartTournament(tournament.id)}
            className="text-gray-600 hover:text-green-600 transition-colors"
            title="Start Tournament"
            disabled={startTournamentMutation.isLoading}
          >
            <Play className="h-4 w-4" />
          </button>
        );
      case 'IN_PROGRESS':
        return (
          <button
            className="text-gray-600 hover:text-yellow-600 transition-colors"
            title="Pause Tournament"
          >
            <Pause className="h-4 w-4" />
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
        <p className="text-red-600">Error loading tournaments. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tournament Management</h2>
          <p className="text-gray-600">Create and manage tournaments, scheduling, and results</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {tournaments?.pagination?.totalItems || 0} Tournaments
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
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
                placeholder="Search tournaments by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="REGISTRATION_OPEN">Registration Open</option>
              <option value="REGISTRATION_CLOSED">Registration Closed</option>
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

      {/* Tournaments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
        ) : tournaments?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tournaments found</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Tournament
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournaments?.data?.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                          <div className="text-sm text-gray-500">{getSportTypeLabel(tournament.sportType) || 'Tổng hợp'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                        {getTournamentStatusLabel(tournament.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{tournament.currentTeams || 0}/{tournament.maxTeams}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(tournament.startDate)}</span>
                        </div>
                        {tournament.endDate && (
                          <div className="text-xs text-gray-500">
                            Until {formatDate(tournament.endDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate max-w-24" title={tournament.location}>
                          {tournament.location || 'TBD'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => window.open(`/tournaments/${tournament.id}`, '_blank')}
                          className="text-gray-600 hover:text-primary-600 transition-colors"
                          title="View Tournament"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/admin/tournaments/${tournament.id}/edit`, '_blank')}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          title="Edit Tournament"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {getStatusAction(tournament)}
                        <button
                          onClick={() => handleDeleteTournament(tournament.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete Tournament"
                          disabled={deleteTournamentMutation.isLoading}
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
        {tournaments?.pagination?.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {tournaments.pagination.currentPage} of {tournaments.pagination.totalPages}
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
                  disabled={page >= tournaments.pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tournament Create Form */}
      <TournamentCreateForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default TournamentManagement;