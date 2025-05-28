import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Eye, ArrowRight, Plus, Shield, X } from 'lucide-react';
// FIX: Sử dụng default import như NewsManagement
import newsService from '../services/newsService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, truncateText } from '../utils/helpers';

// Modal Component cho hiển thị chi tiết tin tức
const NewsModal = ({ article, isOpen, onClose }) => {
  if (!isOpen || !article) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 truncate pr-4">
              {article.name || article.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Featured Image */}
            {article.attachments && article.attachments.length > 0 && (
              <div className="mb-6">
                <img
                  src={newsService.getImageUrl(article.attachments[0].url)}
                  alt={article.name || article.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center text-sm text-gray-500 mb-4 flex-wrap gap-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{article.author || 'EduSports Team'}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>0 views</span>
              </div>
            </div>

            {/* Short Description */}
            {article.shortDescription && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {article.shortDescription}
                </p>
              </div>
            )}

            {/* Full Content */}
            <div className="prose max-w-none">
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: article.content || 'No content available.' 
                }}
              />
            </div>

            {/* Additional Images */}
            {article.attachments && article.attachments.length > 1 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.attachments.slice(1).map((attachment, index) => (
                    <img
                      key={index}
                      src={newsService.getImageUrl(attachment.url)}
                      alt={`Additional image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Published on {formatDate(article.createdAt)}
              </span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';

  // Function để mở modal với article được chọn
  const openModal = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Function để đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  // Close modal when pressing Escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const { data: news, isLoading, error, refetch } = useQuery(
    ['news', searchTerm], // Sử dụng key 'news' để sync với invalidation từ admin
    async () => {
      console.log('NewsPage: Fetching news...');
      const result = await newsService.getAllNews();
      console.log('NewsPage: Raw API response:', result);
      
      // Xử lý response từ API - có thể là array hoặc object
      let newsData;
      if (Array.isArray(result)) {
        newsData = result;
      } else if (result && Array.isArray(result.data)) {
        newsData = result.data;
      } else if (result && typeof result === 'object') {
        // Nếu response là object, tìm property chứa array
        const possibleArrays = Object.values(result).filter(Array.isArray);
        newsData = possibleArrays.length > 0 ? possibleArrays[0] : [];
      } else {
        newsData = [];
      }
      
      console.log('NewsPage: Processed news data:', newsData);
      return newsData;
    },
    {
      staleTime: 30 * 1000, // 30 seconds - ngắn hơn để đảm bảo data fresh
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchInterval: 60 * 1000, // Refetch mỗi 1 phút
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      select: (data) => {
        console.log('NewsPage: Processing data in select:', data);
        
        if (!Array.isArray(data)) {
          console.log('NewsPage: Data is not array:', data);
          return [];
        }
        
        // Lọc theo search term nếu có
        if (!searchTerm.trim()) {
          return data;
        }
        
        const filtered = data.filter(article => {
          if (!article) return false;
          
          const title = article.name || article.title || '';
          const content = article.content || '';
          const shortDescription = article.shortDescription || '';
          
          const searchLower = searchTerm.toLowerCase();
          
          return title.toLowerCase().includes(searchLower) ||
                 content.toLowerCase().includes(searchLower) ||
                 shortDescription.toLowerCase().includes(searchLower);
        });
        
        console.log('NewsPage: Filtered results:', filtered);
        return filtered;
      },
      onError: (error) => {
        console.error('NewsPage: Query error:', error);
      },
      onSuccess: (data) => {
        console.log('NewsPage: Query success, data length:', data?.length || 0);
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    // Query sẽ tự động refetch khi searchTerm thay đổi
  };

  // Force refresh function
  const handleForceRefresh = () => {
    refetch();
  };

  // Debug: Log current state
  console.log('NewsPage render state:', { 
    isLoading, 
    error: error?.message, 
    newsLength: news?.length,
    searchTerm,
    firstNewsItem: news?.[0]
  });

  if (error) {
    console.error('NewsPage error:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading News</h3>
            <p className="text-red-600 mb-4">Unable to load news articles. Please try again.</p>
            <p className="text-sm text-red-500 mb-4">Error: {error.message}</p>
            <div className="space-x-4">
              <button 
                onClick={handleForceRefresh}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Go to Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const featuredNews = news?.[0];
  const otherNews = news?.slice(1) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal */}
      <NewsModal 
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <button 
              type="button"
              onClick={handleForceRefresh}
              className="btn-secondary"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </form>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Loading latest news...</p>
          </div>
        ) : !news || news.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'No news found matching your search' : 'No news available'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `No articles found for "${searchTerm}". Try different keywords.` 
                  : 'Check back later for the latest sports updates or contact admin.'
                }
              </p>
              
              <div className="flex justify-center space-x-4">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
                
                <button
                  onClick={handleForceRefresh}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Refresh
                </button>
                
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create News
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Article */}
            {featuredNews && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    {featuredNews.attachments && featuredNews.attachments.length > 0 ? (
                      <div className="h-48 w-full md:w-64 bg-gray-200 overflow-hidden">
                        <img
                          src={newsService.getImageUrl(featuredNews.attachments[0].url)}
                          alt={featuredNews.name || featuredNews.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="h-48 w-full md:w-64 bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center"><svg class="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full md:w-64 bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex-1">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium mr-3">
                        Featured
                      </span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(featuredNews.createdAt)}</span>
                      <User className="h-4 w-4 ml-4 mr-1" />
                      <span>{featuredNews.author || 'EduSports Team'}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      <button 
                        onClick={() => openModal(featuredNews)}
                        className="hover:text-primary-600 transition-colors text-left"
                      >
                        {featuredNews.name || featuredNews.title}
                      </button>
                    </h2>
                    <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                      {truncateText(featuredNews.shortDescription || featuredNews.content, 200)}
                    </p>
                    <button
                      onClick={() => openModal(featuredNews)}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Read full article
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Other Articles Grid */}
            {otherNews.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">More Articles</h2>
                  <span className="text-sm text-gray-500">{otherNews.length} articles</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherNews.map((article) => (
                    <article key={article.id} className="card hover:shadow-lg transition-shadow duration-300">
                      {article.attachments && article.attachments.length > 0 ? (
                        <div className="bg-gray-200 h-40 rounded-lg mb-4 overflow-hidden">
                          <img
                            src={newsService.getImageUrl(article.attachments[0].url)}
                            alt={article.name || article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="bg-gradient-to-r from-green-400 to-pink-400 h-40 rounded-lg mb-4 flex items-center justify-center"><svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-green-400 to-pink-400 h-40 rounded-lg mb-4 flex items-center justify-center">
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
                        <button 
                          onClick={() => openModal(article)}
                          className="hover:text-primary-600 transition-colors text-left"
                        >
                          {article.name || article.title}
                        </button>
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {truncateText(article.shortDescription || article.content, 120)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => openModal(article)}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
                        >
                          Read more
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </button>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>0 views</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary info */}
        {news && news.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              Showing {news.length} article{news.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;