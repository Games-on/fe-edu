import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Upload,
  Image,
  AlertTriangle
} from 'lucide-react';
import { newsService } from '../../services';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate, truncateText } from '../../utils/helpers';
import toast from 'react-hot-toast';

const NewsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: news, isLoading, error } = useQuery(
    ['admin-news', { page, searchTerm }],
    async () => {
      const allNews = await newsService.getAllNews();
      
      // Apply search filter
      let filteredNews = allNews;
      if (searchTerm) {
        filteredNews = allNews.filter(article => 
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Mock pagination
      const itemsPerPage = 10;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedNews = filteredNews.slice(startIndex, endIndex);

      return {
        data: paginatedNews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredNews.length / itemsPerPage),
          totalItems: filteredNews.length,
          hasNext: page < Math.ceil(filteredNews.length / itemsPerPage),
          hasPrev: page > 1
        }
      };
    },
    {
      staleTime: 2 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  const deleteNewsMutation = useMutation(
    (newsId) => newsService.deleteNews(newsId),
    {
      onSuccess: () => {
        toast.success('News article deleted successfully');
        queryClient.invalidateQueries('admin-news');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete news article');
      }
    }
  );

  const createNewsMutation = useMutation(
    (newsData) => newsService.createNews(newsData),
    {
      onSuccess: () => {
        toast.success('News article created successfully');
        queryClient.invalidateQueries('admin-news');
        setShowCreateModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create news article');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDeleteNews = (newsId) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      deleteNewsMutation.mutate(newsId);
    }
  };

  const handleCreateNews = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newsData = {
      title: formData.get('title'),
      content: formData.get('content'),
      summary: formData.get('summary') || formData.get('content').substring(0, 200)
    };
    
    createNewsMutation.mutate(newsData);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Error loading news articles. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">News Management</h2>
          <p className="text-gray-600">Create, edit, and publish news articles and announcements</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            {news?.pagination?.totalItems || 0} Articles
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search news articles by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary whitespace-nowrap"
          >
            <Filter className="h-4 w-4 mr-2" />
            Search
          </button>
        </form>
      </div>

      {/* News Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
          </div>
        ) : news?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No news articles found</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Article
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {news?.data?.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Article Image */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-white" />
                </div>

                {/* Article Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {truncateText(article.content, 120)}
                  </p>

                  {/* Article Meta */}
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(article.createdAt)}</span>
                    <User className="h-3 w-3 ml-4 mr-1" />
                    <span>{article.author || 'EduSports Team'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/news/${article.id}`, '_blank')}
                        className="text-gray-600 hover:text-primary-600 transition-colors"
                        title="View Article"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/admin/news/${article.id}/edit`, '_blank')}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit Article"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/admin/news/${article.id}/upload`, '_blank')}
                        className="text-gray-600 hover:text-green-600 transition-colors"
                        title="Upload Files"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteNews(article.id)}
                      className="text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete Article"
                      disabled={deleteNewsMutation.isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {news?.pagination?.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {news.pagination.currentPage} of {news.pagination.totalPages}
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
                  disabled={page >= news.pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create News Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create News Article</h3>
              <form onSubmit={handleCreateNews} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Title
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter article title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Article Content
                  </label>
                  <textarea
                    name="content"
                    rows={8}
                    required
                    className="input-field"
                    placeholder="Write your article content here..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary (Optional)
                  </label>
                  <textarea
                    name="summary"
                    rows={3}
                    className="input-field"
                    placeholder="Brief summary of the article..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createNewsMutation.isLoading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {createNewsMutation.isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Article'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;