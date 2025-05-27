import React, { useState, useRef, useEffect } from 'react';
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
  Image,
  AlertTriangle,
  X,
  Save
} from 'lucide-react';
import newsService from '../../services/newsService'; 
import LoadingSpinner from '../LoadingSpinner'; 
import toast from 'react-hot-toast'; 

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return 'Invalid Date';
  }
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const NewsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  const [newsForm, setNewsForm] = useState({
    name: '',
    shortDescription: '',
    content: ''
  });
  const [selectedFile, setSelectedFile] = useState(null); 

  const fileInputRef = useRef(null); 

  const queryClient = useQueryClient();

  const { data: news, isLoading, error } = useQuery(
    ['admin-news', { page, searchTerm }], 
    async () => {
      const allNews = await newsService.getAllNews(); 

      // Kiểm tra data structure
      if (!Array.isArray(allNews)) {
        return {
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      // Filtering logic
      let filteredNews = allNews;
      if (searchTerm) {
        filteredNews = allNews.filter(article =>
          (article.name && article.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (article.shortDescription && article.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      const itemsPerPage = 6;
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
      onError: (err) => {
        // Error handled silently
      }
    }
  );

  // DELETE mutation
  const deleteNewsMutation = useMutation(
    (newsId) => newsService.deleteNews(newsId),
    {
      onSuccess: () => {
        toast.success('Xóa tin tức thành công');
        queryClient.invalidateQueries('admin-news'); 
      },
      onError: (error) => {
        toast.error('Không thể xóa tin tức. Vui lòng thử lại.');
      }
    }
  );

  // CREATE mutation
  const createNewsMutation = useMutation(
    async ({ newsData, file }) => {
      const createdNewsResponse = await newsService.createNews(newsData);
      const newsId = createdNewsResponse?.id ?? createdNewsResponse?.data?.id;

      if (file && newsId) {
        await newsService.uploadNewsAttachments(newsId, file);
      }
      
      return createdNewsResponse;
    },
    {
      onSuccess: () => {
        toast.success('Tạo tin tức thành công' + (selectedFile ? ' và tải ảnh lên!' : '!'));
        queryClient.invalidateQueries('admin-news'); 
        setShowCreateModal(false); 
        resetForm();
      },
      onError: (error) => {
        toast.error('Không thể tạo tin tức. Vui lòng thử lại.');
      }
    }
  );

  // UPDATE mutation
  const updateNewsMutation = useMutation(
    async ({ newsId, newsData, file }) => {
      const updatedNewsResponse = await newsService.updateNews(newsId, newsData);

      if (file) {
        await newsService.uploadNewsAttachments(newsId, file);
      }
      
      return updatedNewsResponse;
    },
    {
      onSuccess: () => {
        toast.success('Cập nhật tin tức thành công' + (selectedFile ? ' và tải ảnh lên!' : '!'));
        queryClient.invalidateQueries('admin-news'); 
        setShowEditModal(false); 
        setEditingNews(null);
        resetForm();
      },
      onError: (error) => {
        toast.error('Không thể cập nhật tin tức. Vui lòng thử lại.');
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); 
    queryClient.invalidateQueries('admin-news');
  };

  const handleDeleteNews = (newsId) => {
    if (window.confirm('Bạn có chắc muốn xóa bài đăng này?')) {
      deleteNewsMutation.mutate(newsId);
    }
  };

  const handleEditNews = (article) => {
    setEditingNews(article);
    setNewsForm({
      name: article.name || '',
      shortDescription: article.shortDescription || '',
      content: article.content || ''
    });
    setShowEditModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setSelectedFile(file);
  };

  const handleCreateNews = (e) => {
    e.preventDefault();

    if (!newsForm.name || newsForm.name.trim() === '') {
        toast.error('Tên tin tức không được để trống.');
        return;
    }
    if (!newsForm.content || newsForm.content.trim() === '') {
        toast.error('Nội dung tin tức không được để trống.');
        return;
    }

    createNewsMutation.mutate({ newsData: newsForm, file: selectedFile });
  };

  const handleUpdateNews = (e) => {
    e.preventDefault();

    if (!newsForm.name || newsForm.name.trim() === '') {
        toast.error('Tên tin tức không được để trống.');
        return;
    }
    if (!newsForm.content || newsForm.content.trim() === '') {
        toast.error('Nội dung tin tức không được để trống.');
        return;
    }

    updateNewsMutation.mutate({ 
      newsId: editingNews.id, 
      newsData: newsForm, 
      file: selectedFile 
    });
  };

  const resetForm = () => {
    setNewsForm({
      name: '',
      shortDescription: '',
      content: ''
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingNews(null);
    resetForm();
  };

  useEffect(() => {
    if (!showCreateModal && !showEditModal) { 
      resetForm(); 
    }
  }, [showCreateModal, showEditModal]); 

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Lỗi khi tải tin tức. Vui lòng thử lại sau.</p>
        <p className="text-sm text-gray-500 mt-2">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quản lý tin tức</h2>
          <p className="text-gray-600">Tạo, chỉnh sửa và xuất bản tin tức và thông báo.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
            {news?.pagination?.totalItems || 0} Bài viết
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo bài viết
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức theo tiêu đề hoặc nội dung..."
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
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* News Grid Display */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner />
            <p className="text-gray-500 mt-2">Đang tải tin tức...</p>
          </div>
        ) : news?.data?.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Không tìm thấy tin tức.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài viết đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {news?.data?.map((article) => (
              <div key={article.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                {/* Article Image */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {article.attachments && article.attachments.length > 0 ? (
                    <img
                      src={newsService.getImageUrl(article.attachments[0].url)}
                      alt={article.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'; 
                      }}
                    />
                  ) : (
                    <Image className="h-16 w-16 text-gray-400" />
                  )}
                </div>

                {/* Article Content Display */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-grow">
                    {truncateText(article.shortDescription || article.content, 120)}
                  </p>

                  {/* Article Meta Data */}
                  <div className="flex items-center text-xs text-gray-500 mb-4 mt-auto">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(article.createdAt)}</span>
                    <User className="h-3 w-3 ml-4 mr-1" />
                    <span>{article.author || 'EduSports Team'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => window.open(`/news/${article.id}`, '_blank')}
                        className="btn-icon"
                        title="Xem bài viết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditNews(article)}
                        className="btn-icon text-blue-600 hover:text-blue-700"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteNews(article.id)}
                      className="btn-icon text-red-600 hover:text-red-700"
                      title="Xóa bài viết"
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

        {/* Pagination Controls */}
        {news?.pagination?.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị trang <span className="font-medium">{news.pagination.currentPage}</span> của <span className="font-medium">{news.pagination.totalPages}</span> ({news.pagination.totalItems} mục)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(prev => prev - 1)}
                disabled={!news.pagination.hasPrev || deleteNewsMutation.isLoading || createNewsMutation.isLoading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={!news.pagination.hasNext || deleteNewsMutation.isLoading || createNewsMutation.isLoading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create News Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Tạo tin tức mới</h3>
                <button
                  onClick={closeModals}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleCreateNews} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề bài viết <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Nhập tiêu đề bài viết..."
                    value={newsForm.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div>
                  <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả ngắn (Tùy chọn)
                  </label>
                  <textarea
                    id="shortDescription"
                    name="shortDescription"
                    rows={3}
                    className="input-field"
                    placeholder="Tóm tắt ngắn về bài viết..."
                    value={newsForm.shortDescription}
                    onChange={handleFormChange}
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung bài viết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={8}
                    required
                    className="input-field"
                    placeholder="Viết nội dung bài viết ở đây..."
                    value={newsForm.content}
                    onChange={handleFormChange}
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Tải ảnh lên (Tối đa 1 file, chỉ file ảnh)
                  </label>
                  <button type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-outline-primary btn-sm mb-2"
                  >
                    Chọn ảnh…
                  </button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    hidden
                  />
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Ảnh đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 btn-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createNewsMutation.isLoading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {createNewsMutation.isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang tạo...</span>
                      </div>
                    ) : (
                      'Tạo'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit News Modal */}
      {showEditModal && editingNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin tức</h3>
                <button
                  onClick={closeModals}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateNews} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề bài viết <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Nhập tiêu đề bài viết..."
                    value={newsForm.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div>
                  <label htmlFor="edit-shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả ngắn (Tùy chọn)
                  </label>
                  <textarea
                    id="edit-shortDescription"
                    name="shortDescription"
                    rows={3}
                    className="input-field"
                    placeholder="Tóm tắt ngắn về bài viết..."
                    value={newsForm.shortDescription}
                    onChange={handleFormChange}
                  />
                </div>

                <div>
                  <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung bài viết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="edit-content"
                    name="content"
                    rows={8}
                    required
                    className="input-field"
                    placeholder="Viết nội dung bài viết ở đây..."
                    value={newsForm.content}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Current Image Display */}
                {editingNews.attachments && editingNews.attachments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh hiện tại
                    </label>
                    <img
                      src={newsService.getImageUrl(editingNews.attachments[0].url)}
                      alt={editingNews.name}
                      className="w-32 h-32 object-cover rounded-lg border"
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; 
                      }}
                    />
                  </div>
                )}

                {/* File Upload Section */}
                <div>
                  <label htmlFor="edit-file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Thay đổi ảnh (Tùy chọn)
                  </label>
                  <button type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-outline-primary btn-sm mb-2"
                  >
                    Chọn ảnh mới…
                  </button>
                  <input
                    id="edit-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    hidden
                  />
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Ảnh mới đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 btn-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updateNewsMutation.isLoading}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    {updateNewsMutation.isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang cập nhật...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>Cập nhật</span>
                      </div>
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