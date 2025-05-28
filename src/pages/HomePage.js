import React, { useState, useEffect } from 'react'; // Import useEffect
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Trophy, Users, Calendar, Target, ArrowRight, Play, Star } from 'lucide-react';
import { tournamentServiceFixed as tournamentService } from '../services/tournamentServiceFixed';
import newsService from '../services/newsService';
import { dashboardService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';

// Import NewsDetailModal
import NewsDetailModal from '../components/admin/NewsDetailModal'; // Đảm bảo đường dẫn này đúng

const HomePage = () => {
  console.log('🏠 [HomePage] Component mounting at', new Date().toLocaleTimeString());
  
  const [selectedNewsArticle, setSelectedNewsArticle] = useState(null); // State cho tin tức được chọn
  const [isNewsDetailModalOpen, setIsNewsDetailModalOpen] = useState(false); // State để kiểm soát modal

  React.useEffect(() => {
    console.log('🏠 [HomePage] useEffect running at', new Date().toLocaleTimeString());
    
    const currentPath = window.location.pathname;
    console.log('📍 [HomePage] Current path:', currentPath);
    
    const handleUrlChange = () => {
      console.log('⚠️ [HomePage] URL changed to:', window.location.pathname, 'at', new Date().toLocaleTimeString());
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      console.log('🏠 [HomePage] Component unmounting at', new Date().toLocaleTimeString());
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Get dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    () => dashboardService.getDashboardStats(),
    {
      staleTime: 2 * 60 * 1000,
      onSuccess: (data) => {
        console.log('📊 [HomePage] Dashboard stats loaded at', new Date().toLocaleTimeString());
      },
      onError: (error) => {
        console.log('⚠️ [HomePage] Dashboard stats error at', new Date().toLocaleTimeString(), error);
      },
      select: (response) => {
        console.log('📊 [HomePage] Dashboard Stats Response:', response);
        console.log('📊 [HomePage] Dashboard Stats Data:', response?.data);
        console.log('📊 [HomePage] Full Response Structure:', JSON.stringify(response, null, 2));
        return response?.data || null;
      },
      onError: (error) => {
        console.warn('⚠️ [HomePage] Dashboard stats API failed, using mock data:', error);
      }
    }
  );

  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    ['tournaments', { page: 1, limit: 3 }],
    () => tournamentService.getAllTournaments({ page: 1, limit: 3 }),
    { 
      staleTime: 5 * 60 * 1000,
      select: (response) => {
        console.log('🏆 [HomePage] Tournaments API Response:', response);
        
        if (response && Array.isArray(response.data)) {
          console.log('🏆 [HomePage] Found tournaments:', response.data.length);
          return response.data;
        }
        
        if (Array.isArray(response)) {
          return response;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (response?.data?.content && Array.isArray(response.data.content)) {
          return response.data.content;
        }
        if (response?.data?.tournaments && Array.isArray(response.data.tournaments)) {
          return response.data.tournaments;
        }
        
        console.warn('⚠️ [HomePage] Tournaments data is not an array:', response);
        return [];
      }
    }
  );

  const { data: news, isLoading: newsLoading, error: newsError } = useQuery(
    'recent-news',
    () => newsService.getAllNews(),
    { 
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        let newsArray = [];
        
        if (Array.isArray(data)) {
          newsArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          newsArray = data.data;
        } else if (data?.content && Array.isArray(data.content)) {
          newsArray = data.content;
        } else if (data?.news && Array.isArray(data.news)) {
          newsArray = data.news;
        } else {
          if (data && typeof data === 'object') {
            const keys = Object.keys(data);
            for (const key of keys) {
              if (Array.isArray(data[key])) {
                newsArray = data[key];
                break;
              }
            }
          }
        }
        
        return newsArray.slice(0, 3); // Take only first 3 news items
      },
      onError: (error) => {
        console.error('Error loading news:', error);
      }
    }
  );

  // Hàm mở modal chi tiết tin tức
  const openNewsDetailModal = (article) => {
    setSelectedNewsArticle(article);
    setIsNewsDetailModalOpen(true);
    document.body.style.overflow = 'hidden'; // Ngăn cuộn trang
  };

  // Hàm đóng modal chi tiết tin tức
  const closeNewsDetailModal = () => {
    setIsNewsDetailModalOpen(false);
    setSelectedNewsArticle(null);
    document.body.style.overflow = 'unset'; // Cho phép cuộn trang
  };

  // Xử lý Escape key cho News Detail Modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isNewsDetailModalOpen) {
        closeNewsDetailModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isNewsDetailModalOpen]);

  const stats = React.useMemo(() => {
    if (dashboardStats) {
      return [
        { 
          icon: Trophy, 
          label: 'Active Tournaments', 
          value: dashboardStats.activeTournaments?.toString() || '0', 
          color: 'text-sports-orange' 
        },
        { 
          icon: Users, 
          label: 'Registered Teams', 
          value: dashboardStats.registeredTeams?.toString() || '0', 
          color: 'text-sports-green' 
        },
        { 
          icon: Calendar, 
          label: 'Matches Played', 
          value: dashboardStats.matchesPlayed?.toString() || '0', 
          color: 'text-sports-purple' 
        },
        { 
          icon: Target, 
          label: 'Success Rate', 
          value: dashboardStats.successRate ? `${Math.round(dashboardStats.successRate)}%` : '0%', 
          color: 'text-sports-pink' 
        },
      ];
    }
    
    return [
      { icon: Trophy, label: 'Active Tournaments', value: '-', color: 'text-sports-orange' },
      { icon: Users, label: 'Registered Teams', value: '-', color: 'text-sports-green' },
      { icon: Calendar, label: 'Matches Played', value: '-', color: 'text-sports-purple' },
      { icon: Target, label: 'Success Rate', value: '-', color: 'text-sports-pink' },
    ];
  }, [dashboardStats]);

  const features = [
    {
      title: 'Tournament Management',
      description: 'Create and manage tournaments with ease. Handle registrations, scheduling, and results.',
      icon: Trophy,
    },
    {
      title: 'Team Registration',
      description: 'Simple team registration process with member management and documentation.',
      icon: Users,
    },
    {
      title: 'Live Scoring',
      description: 'Real-time match scoring and live updates for all tournament participants.',
      icon: Play,
    },
    {
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and reporting for tournament insights and performance.',
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* NewsDetailModal */}
      <NewsDetailModal 
        newsItem={selectedNewsArticle}
        show={isNewsDetailModalOpen}
        onClose={closeNewsDetailModal}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-sports-purple min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-sports-orange to-sports-pink bg-clip-text text-transparent">
                EduSports
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto animate-slide-up">
              The ultimate tournament management system for educational sports. 
              Organize, compete, and celebrate athletic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/tournaments"
                className="bg-sports-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Trophy className="h-5 w-5" />
                <span>View Tournaments</span>
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-900 font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>Join Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {statsLoading ? (
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">Loading statistics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-100 p-4 rounded-full">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Sports Tournaments
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From registration to final results, our comprehensive platform handles every aspect 
              of tournament management with professional-grade tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-primary-500 to-sports-purple p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Tournaments</h2>
              <p className="text-xl text-gray-600">Join exciting competitions happening now</p>
            </div>
            <Link
              to="/tournaments"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {tournamentsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(tournaments || []).slice(0, 3).map((tournament) => (
                <div key={tournament.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="relative mb-4">
                    <div className="bg-gradient-to-r from-primary-500 to-sports-purple h-40 rounded-lg flex items-center justify-center">
                      <Trophy className="h-16 w-16 text-white" />
                    </div>
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tournament.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{tournament.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>Start: {formatDate(tournament.startDate)}</span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{tournament.maxTeams} teams</span>
                    </span>
                  </div>
                  <Link
                    to={`/tournaments/${tournament.id}`}
                    className="btn-primary w-full text-center"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h2>
              <p className="text-xl text-gray-600">Stay updated with the latest sports news</p>
            </div>
            <Link
              to="/news"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {newsLoading ? (
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">Loading news...</p>
            </div>
          ) : newsError ? (
            <div className="text-center">
              <p className="text-red-600">Error loading news: {newsError.message}</p>
              <p className="text-gray-600 mt-2">Please check if backend is running.</p>
            </div>
          ) : !news || news.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-600">No news available at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">Check console for API response details.</p>
              <button 
                onClick={() => {
                  console.log('🔄 [HomePage] Manual news refresh triggered');
                  window.location.reload();
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔄 Refresh News
              </button>
              <br />
              <button 
                onClick={async () => {
                  console.log('🧪 [HomePage] Direct API test triggered');
                  try {
                    const directResult = await newsService.getAllNews();
                    
                    console.log('=== DIRECT API TEST RESULTS ===');
                    console.log('Type of result:', typeof directResult);
                    console.log('Is array:', Array.isArray(directResult));
                    console.log('Result keys:', directResult ? Object.keys(directResult) : 'null');
                    
                    if (Array.isArray(directResult)) {
                      console.log('✅ Direct array with', directResult.length, 'items');
                      if (directResult.length > 0) {
                        console.log('First item:', directResult[0]);
                        console.log('First item keys:', Object.keys(directResult[0]));
                        console.log('First item name:', directResult[0].name);
                        console.log('First item content:', directResult[0].content);
                      }
                    } else {
                      console.log('Not direct array, checking properties...');
                      
                      const possibleKeys = ['data', 'content', 'news', 'items', 'results'];
                      for (const key of possibleKeys) {
                        if (directResult && directResult[key]) {
                          console.log(`Found ${key}:`, directResult[key]);
                          if (Array.isArray(directResult[key])) {
                            console.log(`${key} is array with ${directResult[key].length} items`);
                            if (directResult[key].length > 0) {
                              console.log(`First ${key} item:`, directResult[key][0]);
                            }
                          }
                        }
                      }
                    }
                    
                    if (Array.isArray(directResult) && directResult.length > 0) {
                      alert(`✅ Found ${directResult.length} news items! Check console for details.`);
                    } else if (directResult?.data && Array.isArray(directResult.data) && directResult.data.length > 0) {
                      alert(`✅ Found ${directResult.data.length} news items in data property! Check console.`);
                    } else {
                      alert('❌ No news items found in API response. Check console for details.');
                    }
                    
                    console.log('=== END DIRECT API TEST ===');
                  } catch (error) {
                    console.error('🧪 [HomePage] Direct API error:', error);
                    alert('❌ Direct API failed - check console for error details');
                  }
                }}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                🧪 Test API Direct
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((article, index) => {
                console.log('📰 [HomePage] Rendering article:', article);
                return (
                  <div 
                    key={article.id || index} 
                    className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => openNewsDetailModal(article)} // Thêm onClick vào đây
                  >
                    {/* Display image from attachments if available */}
                    {article.attachments && article.attachments.length > 0 ? (
                      <div className="h-40 rounded-lg mb-4 overflow-hidden bg-gray-200">
                        <img
                          src={newsService.getImageUrl(article.attachments[0].url)}
                          alt={article.name || 'News image'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = '<div class="bg-gradient-to-r from-sports-green to-sports-pink h-40 rounded-lg mb-4 flex items-center justify-center"><svg class="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-sports-green to-sports-pink h-40 rounded-lg mb-4 flex items-center justify-center">
                        <Star className="h-16 w-16 text-white" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {article.name || article.title || 'No Title'}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.shortDescription || article.content || 'No Content'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {article.createdAt ? formatDate(article.createdAt) : 'Recent'}
                      </span>
                      {/* Thay Link bằng Button để mở modal */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn chặn sự kiện click lan ra thẻ cha
                          openNewsDetailModal(article);
                        }}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1"
                      >
                        <span>Read More</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-sports-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Sports Journey?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes and organizers who trust EduSports for their tournament management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors duration-300"
            >
              Get Started Today
            </Link>
            <Link
              to="/tournaments"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-lg transition-all duration-300"
            >
              Explore Tournaments
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;