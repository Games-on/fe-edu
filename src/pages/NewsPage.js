import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Eye, ArrowRight, Plus, Shield, Bug } from 'lucide-react';
import { newsService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import NewsAPITester from '../components/debug/NewsAPITester';
import { formatDate, truncateText } from '../utils/helpers';

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDebugTester, setShowDebugTester] = useState(false);
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';

  const { data: news, isLoading, error, refetch } = useQuery(
    ['news', searchTerm],
    () => {
      console.log('📰 NewsPage: Making API call...');
      return newsService.getAllNews();
    },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 0, // Disable cache temporarily for debugging
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log('📰 NewsPage: onSuccess callback, raw data:', data);
      },
      onError: (error) => {
        console.error('📰 NewsPage: onError callback:', error);
      },
      select: (data) => {
        console.log('📰 NewsPage Raw data received:', data);
        console.log('📰 NewsPage Data type:', typeof data);
        console.log('📰 NewsPage Is Array:', Array.isArray(data));
        
        // Kiểm tra data có tồn tại và là array không
        if (!data) {
          console.log('📰 NewsPage: No data received');
          return [];
        }
        
        if (!Array.isArray(data)) {
          console.log('📰 NewsPage: Data is not array, structure:', data);
          return [];
        }
        
        console.log('📰 NewsPage: Found', data.length, 'articles');
        
        if (!searchTerm) {
          console.log('📰 NewsPage: Returning all articles');
          return data;
        }
        
        const filtered = data.filter(article => {
          // Sử dụng 'name' thay vì 'title' để khớp với API
          const title = article.name || article.title || '';
          const content = article.content || '';
          const shortDescription = article.shortDescription || '';
          
          return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        console.log('📰 NewsPage: Filtered to', filtered.length, 'articles');
        return filtered;
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (error) {
    console.error('NewsPage error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading news. Please try again later.</p>
          <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  const featuredNews = news?.[0];
  const otherNews = news?.slice(1) || [];

  // Log for debugging
  console.log('📰 NewsPage Render - Current state:', {
    isLoading,
    error: error?.message,
    newsLength: news?.length,
    featuredNews: featuredNews?.name,
    otherNewsLength: otherNews.length
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">News</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get the latest sports news, tournament information and community highlights
              </p>
            </div>
            {/* {isAdmin && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDebugTester(!showDebugTester)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Debug API
                </button>
                <div className="flex items-center space-x-2 text-sm text-primary-600">
                  <Shield className="h-4 w-4" />
                  <span>Quyền Admin</span>
                </div>
                <Link
                  to="/admin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quản lý tin tức
                </Link>
              </div>
            )} */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Tester - Only for Admins */}
        {isAdmin && showDebugTester && (
          <NewsAPITester />
        )}

        {/* Debug Info Panel - Only for Admins */}
        {isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">🔍 Debug Info</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error ? error.message : 'None'}</p>
              <p><strong>News Data:</strong> {news ? `Array with ${news.length} items` : 'null/undefined'}</p>
              <p><strong>Search Term:</strong> '{searchTerm}' {searchTerm ? '(filtering active)' : '(no filter)'}</p>
              <p><strong>Featured News:</strong> {featuredNews ? featuredNews.name || 'No name' : 'None'}</p>
              <p><strong>Other News:</strong> {otherNews.length} items</p>
            </div>
            <button
              onClick={() => setShowDebugTester(!showDebugTester)}
              className="mt-2 mr-2 text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
            >
              {showDebugTester ? 'Hide' : 'Show'} API Tester
            </button>
            <button
              onClick={() => {
                console.log('🔄 Manual refetch triggered');
                refetch();
              }}
              className="mt-2 text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded"
            >
              Force Refresh Data
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">Đang tải tin tức...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p>Lỗi khi tải tin tức: {error.message}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 btn-primary"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : !news || news.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No news found</h3>
            <p className="text-gray-600">Check back later for the latest sports updates</p>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create first news
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Article */}
            {featuredNews && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    {/* Hiển thị ảnh từ attachments nếu có */}
                    {featuredNews.attachments && featuredNews.attachments.length > 0 ? (
                      <div className="h-48 w-full md:w-64 bg-gray-200 overflow-hidden">
                        <img
                          src={newsService.getImageUrl(featuredNews.attachments[0].url)}
                          alt={featuredNews.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="h-48 w-full md:w-64 bg-gradient-to-r from-primary-500 to-sports-purple flex items-center justify-center"><svg class="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"></path></svg></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full md:w-64 bg-gradient-to-r from-primary-500 to-sports-purple flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-1">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium mr-3">
                        Outstanding
                      </span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(featuredNews.createdAt)}</span>
                      <User className="h-4 w-4 ml-4 mr-1" />
                      <span>{featuredNews.author || 'EduSports Team'}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      <Link 
                        to={`/news/${featuredNews.id}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {featuredNews.name || featuredNews.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                      {truncateText(featuredNews.shortDescription || featuredNews.content, 200)}
                    </p>
                    <Link
                      to={`/news/${featuredNews.id}`}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Read full article
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Other Articles Grid */}
            {otherNews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Other articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherNews.map((article) => (
                    <article key={article.id} className="card hover:shadow-lg transition-shadow duration-300">
                      {/* Hiển thị ảnh từ attachments nếu có */}
                      {article.attachments && article.attachments.length > 0 ? (
                        <div className="bg-gray-200 h-40 rounded-lg mb-4 overflow-hidden">
                          <img
                            src={newsService.getImageUrl(article.attachments[0].url)}
                            alt={article.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="bg-gradient-to-r from-sports-green to-sports-pink h-40 rounded-lg mb-4 flex items-center justify-center"><svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-sports-green to-sports-pink h-40 rounded-lg mb-4 flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-white" />
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(article.createdAt)}</span>
                        <User className="h-4 w-4 ml-4 mr-1" />
                        <span>{article.author || 'EduSports Team'}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link 
                          to={`/news/${article.id}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {article.name || article.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {truncateText(article.shortDescription || article.content, 120)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/news/${article.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
                        >
                          Read more
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>0 view</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        {news && news.length >= 10 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load more articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;