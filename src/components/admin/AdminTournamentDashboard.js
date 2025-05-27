import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Trophy, 
  Users, 
  Calendar, 
  BarChart3, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { tournamentService, teamService, matchService } from '../../services';
import { formatDate, formatDateTime, getStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../LoadingSpinner';

const AdminTournamentDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch tournaments data
  const { data: tournaments, isLoading: tournamentsLoading, refetch: refetchTournaments } = useQuery(
    ['admin-tournaments', selectedPeriod],
    () => tournamentService.getAllTournaments(),
    { staleTime: 5 * 60 * 1000 }
  );

  // Safe extraction of tournaments data with multiple fallbacks
  let tournamentsList = [];
  
  try {
    if (Array.isArray(tournaments?.data)) {
      tournamentsList = tournaments.data;
    } else if (Array.isArray(tournaments?.data?.tournaments)) {
      tournamentsList = tournaments.data.tournaments;
    } else if (Array.isArray(tournaments)) {
      tournamentsList = tournaments;
    } else {
      console.log('⚠️ [AdminTournamentDashboard] Unexpected tournaments data structure:', tournaments);
      tournamentsList = [];
    }
  } catch (err) {
    console.error('🚨 [AdminTournamentDashboard] Error processing tournaments data:', err);
    tournamentsList = [];
  }

  // Calculate dashboard statistics with safe operations
  const stats = {
    total: Array.isArray(tournamentsList) ? tournamentsList.length : 0,
    active: Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'ONGOING').length : 0,
    upcoming: Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'REGISTRATION' || t?.status === 'READY').length : 0,
    completed: Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'COMPLETED').length : 0,
    totalTeams: Array.isArray(tournamentsList) ? tournamentsList.reduce((acc, t) => acc + (t?.currentTeams || 0), 0) : 0,
    avgTeamsPerTournament: Array.isArray(tournamentsList) && tournamentsList.length > 0 ? 
      Math.round(tournamentsList.reduce((acc, t) => acc + (t?.currentTeams || 0), 0) / tournamentsList.length) : 0
  };

  // Filter tournaments with safe operations
  const filteredTournaments = Array.isArray(tournamentsList) ? tournamentsList.filter(tournament => {
    if (!tournament) return false;
    
    const matchesSearch = !searchQuery || 
      tournament.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ONGOING':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REGISTRATION':
        return <Users className="h-4 w-4 text-orange-600" />;
      case 'READY':
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionButtons = (tournament) => {
    const buttons = [];
    
    if (tournament.status === 'REGISTRATION') {
      buttons.push(
        <button key="manage" className="btn-primary text-xs py-1 px-2">
          <Settings className="h-3 w-3 mr-1" />
          Manage
        </button>
      );
    }
    
    if (tournament.status === 'ONGOING') {
      buttons.push(
        <button key="monitor" className="btn-secondary text-xs py-1 px-2">
          <Eye className="h-3 w-3 mr-1" />
          Monitor
        </button>
      );
    }
    
    buttons.push(
      <button key="view" className="btn-secondary text-xs py-1 px-2">
        <Eye className="h-3 w-3 mr-1" />
        View
      </button>
    );
    
    return buttons;
  };

  if (tournamentsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tournament Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage and monitor all tournaments</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetchTournaments()}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Tournament</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tournaments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tournament Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Ongoing</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Registration</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'REGISTRATION').length : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Ready</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {Array.isArray(tournamentsList) ? tournamentsList.filter(t => t?.status === 'READY').length : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {Array.isArray(tournamentsList) ? tournamentsList.slice(0, 4).map((tournament, index) => (
                <div key={tournament.id} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    tournament.status === 'ONGOING' ? 'bg-blue-500' :
                    tournament.status === 'COMPLETED' ? 'bg-green-500' :
                    tournament.status === 'REGISTRATION' ? 'bg-orange-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tournament.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(tournament.createdAt || tournament.startDate)}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Avg Teams/Tournament</span>
                  <span className="text-sm font-medium text-gray-900">{stats.avgTeamsPerTournament}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="REGISTRATION">Registration</option>
                <option value="READY">Ready</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredTournaments.length} of {stats.total} tournaments
            </div>
          </div>
        </div>

        {/* Tournaments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Tournaments</h3>
          </div>
          
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
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTournaments.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {tournament.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(tournament.status)}
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                          {tournament.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tournament.currentTeams || 0}/{tournament.maxTeams}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tournament.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${tournament.maxTeams > 0 ? 
                                ((tournament.currentTeams || 0) / tournament.maxTeams) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {tournament.maxTeams > 0 ? 
                            Math.round(((tournament.currentTeams || 0) / tournament.maxTeams) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {getActionButtons(tournament)}
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTournaments.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments found</h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first tournament to get started'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTournamentDashboard;