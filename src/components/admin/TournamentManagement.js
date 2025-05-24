import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Users,
  MapPin,
  Play,
  Pause,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { tournamentService } from '../../services';
import { formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TournamentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  const { data: tournaments, isLoading } = useQuery(
    ['admin-tournaments', { search: searchTerm, status: statusFilter }],
    () => tournamentService.getAllTournaments({ page: 1, size: 50 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const queryClient = useQueryClient();

  const createTournamentMutation = useMutation(
    (tournamentData) => tournamentService.createTournament(tournamentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-tournaments');
        toast.success('Tournament created successfully');
        setShowCreateModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create tournament');
      }
    }
  );

  const updateTournamentMutation = useMutation(
    ({ id, data }) => tournamentService.updateTournament(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-tournaments');
        toast.success('Tournament updated successfully');
        setShowEditModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update tournament');
      }
    }
  );

  const deleteTournamentMutation = useMutation(
    (tournamentId) => tournamentService.deleteTournament(tournamentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-tournaments');
        toast.success('Tournament deleted successfully');
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
        queryClient.invalidateQueries('admin-tournaments');
        toast.success('Tournament started successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to start tournament');
      }
    }
  );

  const filteredTournaments = tournaments?.data?.content?.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || tournament.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleEditTournament = (tournament) => {
    setSelectedTournament(tournament);
    setShowEditModal(true);
  };

  const handleDeleteTournament = async (tournamentId) => {
    if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      deleteTournamentMutation.mutate(tournamentId);
    }
  };

  const handleStartTournament = (tournamentId) => {
    if (window.confirm('Are you sure you want to start this tournament?')) {
      startTournamentMutation.mutate(tournamentId);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'UPCOMING':
        return <Calendar className="h-4 w-4" />;
      case 'ONGOING':
        return <Play className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading tournaments...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tournament Management</h2>
          <p className="text-gray-600">Create and manage tournaments, schedules, and competitions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Tournament</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tournaments..."
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

          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Advanced Filter</span>
          </button>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {filteredTournaments.map((tournament) => (
          <div key={tournament.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-primary-500 to-purple-500 h-32 flex items-center justify-center relative">
              <Trophy className="h-12 w-12 text-white" />
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(tournament.status)}`}>
                {getStatusIcon(tournament.status)}
                <span>{tournament.status}</span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                {tournament.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {tournament.description}
              </p>

              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Start: {formatDate(tournament.startDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Max {tournament.maxTeams} teams</span>
                </div>
                {tournament.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{tournament.location}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTournament(tournament)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit tournament"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {tournament.status === 'UPCOMING' && (
                    <button
                      onClick={() => handleStartTournament(tournament.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Start tournament"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTournament(tournament.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete tournament"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  ID: {tournament.id}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first tournament</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Tournament
          </button>
        </div>
      )}

      {/* Tournament Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tournaments?.data?.content?.filter(t => t.status === 'UPCOMING').length || 0}
            </div>
            <div className="text-sm text-gray-500">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tournaments?.data?.content?.filter(t => t.status === 'ONGOING').length || 0}
            </div>
            <div className="text-sm text-gray-500">Ongoing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {tournaments?.data?.content?.filter(t => t.status === 'COMPLETED').length || 0}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tournaments?.data?.content?.filter(t => t.status === 'CANCELLED').length || 0}
            </div>
            <div className="text-sm text-gray-500">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentManagement;