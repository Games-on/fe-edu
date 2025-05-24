import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Trophy, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';
import { tournamentService, teamService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('tournaments');

  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    'admin-tournaments',
    () => tournamentService.getAllTournaments({ page: 1, size: 10 }),
    { staleTime: 5 * 60 * 1000 }
  );

  const adminStats = [
    {
      name: 'Total Tournaments',
      value: tournaments?.data?.totalElements || 0,
      icon: Trophy,
      color: 'text-sports-orange',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Active Tournaments',
      value: tournaments?.data?.content?.filter(t => t.status === 'ONGOING').length || 0,
      icon: Play,
      color: 'text-sports-green',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Teams',
      value: '45',
      icon: Users,
      color: 'text-sports-purple',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Completed Tournaments',
      value: tournaments?.data?.content?.filter(t => t.status === 'COMPLETED').length || 0,
      icon: CheckCircle,
      color: 'text-sports-pink',
      bgColor: 'bg-pink-100',
    },
  ];

  const tabs = [
    { id: 'tournaments', name: 'Tournaments', icon: Trophy },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'matches', name: 'Matches', icon: Calendar },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-lg text-gray-600">
              Manage tournaments, teams, and system settings.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </button>
            <button className="btn-secondary">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat) => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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

          <div className="p-6">
            {/* Tournaments Tab */}
            {activeTab === 'tournaments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Tournament Management</h2>
                  <button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Tournament
                  </button>
                </div>

                {tournamentsLoading ? (
                  <LoadingSpinner />
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
                            Start Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teams
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tournaments?.data?.content?.map((tournament) => (
                          <tr key={tournament.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-primary-600 p-2 rounded-lg mr-3">
                                  <Trophy className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {tournament.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {tournament.description?.substring(0, 50)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                                {tournament.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(tournament.startDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              0 / {tournament.maxTeams}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Link
                                  to={`/tournaments/${tournament.id}`}
                                  className="text-primary-600 hover:text-primary-900"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <button className="text-gray-600 hover:text-gray-900">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
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
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
                  <button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team
                  </button>
                </div>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
                  <p className="text-gray-600">Teams will appear here once tournaments start receiving registrations.</p>
                </div>
              </div>
            )}

            {/* Matches Tab */}
            {activeTab === 'matches' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Match Management</h2>
                  <button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Match
                  </button>
                </div>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matches scheduled</h3>
                  <p className="text-gray-600">Matches will appear here once tournaments are started.</p>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Performance</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Tournaments</span>
                        <span className="font-medium">{tournaments?.data?.totalElements || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Participation</span>
                        <span className="font-medium">12 teams</span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Engagement</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New Registrations</span>
                        <span className="font-medium">23 this month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Retention Rate</span>
                        <span className="font-medium">87%</span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uptime</span>
                        <span className="font-medium text-green-600">99.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Time</span>
                        <span className="font-medium">245ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Error Rate</span>
                        <span className="font-medium text-green-600">0.1%</span>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>New tournament created</span>
                        <span className="text-gray-500">2 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Team registered</span>
                        <span className="text-gray-500">4 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Match completed</span>
                        <span className="text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;