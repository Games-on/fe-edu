import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Globe,
  Upload,
  Image,
  PenTool
} from 'lucide-react';
import { newsService } from '../../services';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

// IMPORT MODAL COMPONENTS Ở ĐÂY
import CreateNewsModal from './CreateNewsModal';
// import EditNewsModal from './EditNewsModal';


const NewsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null); // Giữ bài viết được chọn để chỉnh sửa

  const { data: news, isLoading } = useQuery(
    ['admin-news', { search: searchTerm, status: statusFilter }],
    () => newsService.getAllNews(),
    { staleTime: 5 * 60 * 1000 }
  );

  const queryClient = useQueryClient();

  const createNewsMutation = useMutation(
    (newsData) => newsService.createNews(newsData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-news');
        toast.success('News article created successfully');
        setShowCreateModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create news article');
      }
    }
  );

  const updateNewsMutation = useMutation(
    ({ id, data }) => newsService.updateNews(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-news');
        toast.success('News article updated successfully');
        setShowEditModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update news article');
      }
    }
  );

  const deleteNewsMutation = useMutation(
    (newsId) => newsService.deleteNews(newsId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-news');
        toast.success('News article deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete news article');
      }
    }
  );

  const filteredNews = news?.filter(article => {
    const articleTitle = article?.title || '';
    const articleContent = article?.content || '';
    const articleStatus = article?.status || '';

    const matchesSearch = articleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          articleContent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || articleStatus === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const handleEditNews = (article) => {
    setSelectedNews(article); // Đặt bài viết được chọn vào state
    setShowEditModal(true); // Hiển thị modal chỉnh sửa
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      deleteNewsMutation.mutate(newsId);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  const getStatusColor = (status) => {
    const effectiveStatus = status || 'DEFAULT';

    switch (effectiveStatus) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading news articles...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">News Management</h2>
          <p className="text-gray-600">Create, edit, and publish news articles and updates</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Article</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search articles..."
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
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* News Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {filteredNews.map((article) => (
          <div key={article.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 flex items-center justify-center relative">
              <FileText className="h-12 w-12 text-white" />
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status || 'PUBLISHED')}`}>
                {article.status || 'PUBLISHED'}
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title || 'No Title'}
              </h3>

              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {article.content || 'No content available.'}
              </p>

              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Published: {formatDate(article.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Author: EduSports Team</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Views: {article.views || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(`/news/${article.id}`, '_blank')}
                    className="text-blue-600 hover:text-blue-900"
                    title="View article"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditNews(article)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit article"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNews(article.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete article"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  ID: {article.id}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No news articles found</h3>
          <p className="text-gray-600 mb-4">Create your first news article to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create Article
          </button>
        </div>
      )}

      {/* News Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {news?.filter(a => (a.status || 'PUBLISHED') === 'PUBLISHED').length || 0}
            </div>
            <div className="text-sm text-gray-500">Published</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {news?.filter(a => (a.status || 'PUBLISHED') === 'DRAFT').length || 0}
            </div>
            <div className="text-sm text-gray-500">Drafts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {news?.filter(a => (a.status || 'PUBLISHED') === 'ARCHIVED').length || 0}
            </div>
            <div className="text-sm text-gray-500">Archived</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {news?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Total Articles</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <PenTool className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Write New Article</span>
          </button>

          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors">
            <Image className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Upload Images</span>
          </button>

          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
            <Globe className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Publish Queue</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Article "Tournament Results" published</span>
            <span className="text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">New draft "Upcoming Events" created</span>
            <span className="text-gray-400">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Article "Season Review" updated</span>
            <span className="text-gray-400">1 day ago</span>
          </div>
        </div>
      </div>

      {/* MODAL COMPONENTS - ĐẶT Ở CUỐI CÙNG TRƯỚC THẺ ĐÓNG DIV CHÍNH */}
      <CreateNewsModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateNews={(newsData) => createNewsMutation.mutate(newsData)}
          isCreating={createNewsMutation.isLoading}
      />

      {/* <EditNewsModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          newsArticle={selectedNews} // Truyền bài viết được chọn vào modal
          onUpdateNews={({ id, data }) => updateNewsMutation.mutate({ id, data })}
          isUpdating={updateNewsMutation.isLoading}
      /> */}

    </div> // Đây là thẻ đóng của div cha bao bọc toàn bộ nội dung của NewsManagement
  );
};

export default NewsManagement;