import React, { useState, Suspense, useEffect } from 'react'; // Thêm useEffect
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users, 
  Trophy, 
  Calendar, 
  FileText, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Crown,
  AlertTriangle,
  BarChart3,
  Bug
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tournamentService, newsService } from '../services'; // Đảm bảo services được import đúng
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

// --- Thay đổi ở đây: Sử dụng React.lazy để import các component động ---
// Import components with error boundary
const UserManagement = React.lazy(() => import('../components/admin/UserManagement'));
const TournamentManagement = React.lazy(() => import('../components/admin/TournamentManagement'));
const AdminTournamentDashboard = React.lazy(() => import('../components/admin/AdminTournamentDashboard'));
const MatchManagement = React.lazy(() => import('../components/admin/MatchManagement'));
const NewsManagement = React.lazy(() => import('../components/admin/NewsManagement'));
// const NewsDebugPanel = React.lazy(() => import('../components/debug/NewsDebugPanel')); // DISABLED FOR PRODUCTION
// --- Kết thúc thay đổi ---

const AdminPanel = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is admin or organizer
  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';

  // Định nghĩa tất cả các tabs
  const allTabs = [
    { 
      id: 'dashboard', 
      name: 'Tournament Dashboard', 
      icon: BarChart3, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Overview and analytics of all tournaments',
      component: AdminTournamentDashboard,
      roles: ['ADMIN'] // Chỉ ADMIN mới thấy dashboard
    },
    { 
      id: 'users', 
      name: 'User Management', 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Manage user accounts and permissions',
      component: UserManagement,
      roles: ['ADMIN'] // Chỉ ADMIN mới thấy quản lý người dùng
    },
    { 
      id: 'tournaments', 
      name: 'Tournament Management', 
      icon: Trophy, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Create and manage tournaments',
      component: TournamentManagement,
      roles: ['ADMIN', 'ORGANIZER'] // ADMIN và ORGANIZER đều có thể quản lý giải đấu
    },
    // { 
    //   id: 'matches', 
    //   name: 'Match Management', 
    //   icon: Calendar, 
    //   color: 'text-green-600',
    //   bgColor: 'bg-green-100',
    //   description: 'Schedule and manage matches',
    //   component: MatchManagement,
    //   roles: ['ADMIN', 'ORGANIZER'] // ADMIN và ORGANIZER đều có thể quản lý trận đấu
    // },
    { 
      id: 'news', 
      name: 'News Management', 
      icon: FileText, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Create and publish news articles',
      component: NewsManagement,
      roles: ['ADMIN', 'ORGANIZER'] // ADMIN và ORGANIZER đều có thể quản lý tin tức
    },
    /*
    { 
      id: 'debug', 
      name: 'News Debug', 
      icon: Bug, 
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Debug and test news API functionality',
      component: NewsDebugPanel,
      roles: ['ADMIN'] // Chỉ ADMIN mới thấy debug panel
    }
    */
  ];

  // Lọc các tabs dựa trên vai trò của người dùng hiện tại
  const accessibleTabs = allTabs.filter(tab => tab.roles.includes(user?.role));

  // Xác định tab mặc định
  const defaultTab = isAdmin ? 'dashboard' : 'tournaments'; // Nếu là admin thì mặc định là dashboard, nếu là organizer thì mặc định là tournaments
  const [activeTab, setActiveTab] = useState(defaultTab);

  // useEffect để xử lý trường hợp user role thay đổi hoặc tab mặc định không còn tồn tại
  useEffect(() => {
    // Nếu tab hiện tại không còn trong danh sách các tab được phép truy cập
    if (!accessibleTabs.some(tab => tab.id === activeTab)) {
      // Chuyển về tab mặc định mới
      setActiveTab(defaultTab);
    }
  }, [user?.role, accessibleTabs, defaultTab, activeTab]); // Chỉ chạy lại khi user role hoặc accessibleTabs thay đổi

  const { data: adminStats, isLoading: statsLoading } = useQuery(
    'admin-stats',
    async () => {
      return {
        totalUsers: 15,
        totalTournaments: 10,
        activeMatches: 9,
        publishedNews: 12,
        pendingApprovals: 8,
        systemHealth: 99.2
      };
    },
    { staleTime: 5 * 60 * 1000 }
  );

  if (!isAdmin && !isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (statsLoading && isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
        <p className="text-gray-600 ml-4">Loading dashboard data...</p>
      </div>
    );
  }
  
  const stats = isAdmin ? [
    {
      name: 'Total Users',
      value: adminStats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      // change: '+12%', 
      changeType: 'increase'
    },
    {
      name: 'Active Tournaments',
      value: adminStats?.totalTournaments || 0,
      icon: Trophy,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      // change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Live Matches',
      value: adminStats?.activeMatches || 0,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      // change: '+5%',
      changeType: 'increase'
    },
    {
      name: 'Published News',
      value: adminStats?.publishedNews || 0,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      // change: '+15%',
      changeType: 'increase'
    }
  ] : []; // Nếu không phải admin, mảng stats rỗng

  const CurrentTabComponent = accessibleTabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-gray-600">
                    {isAdmin ? 'System Administrator' : 'Tournament Organizer'} Dashboard
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                System Healthy
              </div>
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid - Chỉ hiển thị cho ADMIN */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      {/* <span className="text-sm text-gray-500 ml-1">vs last month</span> */}
                    </div>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleTabs.map((tab) => ( // Sử dụng accessibleTabs ở đây
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  activeTab === tab.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`${tab.bgColor} p-2 rounded-lg`}>
                    <tab.icon className={`h-5 w-5 ${tab.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{tab.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{tab.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {accessibleTabs.map((tab) => ( // Sử dụng accessibleTabs ở đây
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
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">

            <Suspense fallback={<LoadingSpinner text="Loading admin module..." />}>
              {CurrentTabComponent && <CurrentTabComponent />}
            </Suspense>
            
          </div>
        </div>

        {/* System Health - Có thể hiển thị cho cả hai vai trò nếu cần */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">API Status</p>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-600">Response time: 23ms</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Background Jobs</p>
                <p className="text-sm text-gray-600">2 pending tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;