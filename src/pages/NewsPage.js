import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Eye, ArrowRight, Plus } from 'lucide-react';
import newsService from '../services/newsService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, truncateText } from '../utils/helpers';

import NewsDetailModal from '../components/admin/NewsDetailModal';

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1); // Thêm state cho page để quản lý phân trang
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';

  const openModal = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const { data: newsData, isLoading, error, refetch } = useQuery( // Đổi tên biến data thành newsData để tránh trùng với biến 'news' trong JSX
    ['news', searchTerm, page], // Thêm 'page' vào dependency array của useQuery
    async () => {
      console.log('NewsPage: Fetching news...');
      const result = await newsService.getAllNews(); // Lấy tất cả tin tức

      let newsList;
      if (Array.isArray(result)) {
        newsList = result;
      } else if (result && Array.isArray(result.data)) {
        newsList = result.data;
      } else if (result && typeof result === 'object') {
        const possibleArrays = Object.values(result).filter(Array.isArray);
        newsList = possibleArrays.length > 0 ? possibleArrays[0] : [];
      } else {
        newsList = [];
      }
      
      console.log('NewsPage: Raw news list after processing:', newsList);

      // Lọc theo search term
      let filteredNews = newsList;
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filteredNews = newsList.filter(article => {
          if (!article) return false;
          const title = article.name || article.title || '';
          const content = article.content || '';
          const shortDescription = article.shortDescription || '';
          return title.toLowerCase().includes(searchLower) ||
                 content.toLowerCase().includes(searchLower) ||
                 shortDescription.toLowerCase().includes(searchLower);
        });
      }

      // PHẦN QUAN TRỌNG: LOGIC PHÂN TRANG
      const itemsPerPage = 10; // <--- THAY ĐỔI TỪ 6 SANG 9 TẠI ĐÂY
      const totalItems = filteredNews.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedNews = filteredNews.slice(startIndex, endIndex);

      return {
        articles: paginatedNews, // Tin tức của trang hiện tại
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    },
    {
      staleTime: 30 * 1000,
      cacheTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchInterval: 60 * 1000,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('NewsPage: Query error:', error);
      },
      onSuccess: (data) => {
        console.log('NewsPage: Query success, data length:', data?.articles?.length || 0);
        // Nếu số lượng tin tức trên trang hiện tại là 0 nhưng không phải trang 1,
        // và tổng số trang lớn hơn 0, thì chuyển về trang cuối cùng có dữ liệu
        if (data.articles.length === 0 && data.totalPages > 0 && page > data.totalPages) {
            setPage(data.totalPages);
        }
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset về trang 1 khi tìm kiếm mới
    // query sẽ tự động refetch khi searchTerm thay đổi
  };

  const handleForceRefresh = () => {
    refetch();
  };

  // Debug: Log current state
  console.log('NewsPage render state:', { 
    isLoading, 
    error: error?.message, 
    newsLength: newsData?.articles?.length, // Sử dụng newsData.articles
    searchTerm,
    currentPage: newsData?.pagination?.currentPage,
    totalPages: newsData?.pagination?.totalPages
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

  // Lấy tin tức và thông tin phân trang từ newsData
  const newsArticles = newsData?.articles || [];
  const pagination = newsData?.pagination;

  // Lấy tin tức nổi bật (nếu có) và các tin tức khác
  const featuredNews = newsArticles[0];
  const otherNews = newsArticles.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <NewsDetailModal 
        newsItem={selectedArticle}
        show={isModalOpen}
        onClose={closeModal}
      />

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">News</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get the latest sports news, tournament information and community highlights
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Loading latest news...</p>
          </div>
        ) : !newsArticles || newsArticles.length === 0 ? (
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
              <div
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer"
                onClick={() => openModal(featuredNews)}
              >
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
                            e.target.src = "https://via.placeholder.com/256x192?text=Image+Not+Found";
                            e.target.className = "w-full h-full object-contain p-4";
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
                        onClick={(e) => {
                            e.stopPropagation();
                            openModal(featuredNews);
                        }}
                        className="hover:text-primary-600 transition-colors text-left"
                      >
                        {featuredNews.name || featuredNews.title}
                      </button>
                    </h2>
                    <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                      {truncateText(featuredNews.shortDescription || featuredNews.content, 200)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(featuredNews);
                      }}
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
                    <article 
                      key={article.id} 
                      className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => openModal(article)}
                    >
                      {article.attachments && article.attachments.length > 0 ? (
                        <div className="bg-gray-200 h-40 rounded-lg mb-4 overflow-hidden">
                          <img
                            src={newsService.getImageUrl(article.attachments[0].url)}
                            alt={article.name || article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.src = "https://via.placeholder.com/160x160?text=Image+Not+Found";
                              e.target.className = "w-full h-full object-contain p-4";
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(article);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(article);
                          }}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
                        >
                          Read more
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </button>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          {/* <span>0 views</span> */}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between mt-8 rounded-lg shadow-sm">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{pagination.currentPage}</span> of <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalItems} articles)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrev || isLoading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={!pagination.hasNext || isLoading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Summary info */}
        {newsArticles.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500">
              Total {pagination.totalItems} article{pagination.totalItems !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;