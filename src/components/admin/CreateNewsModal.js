// src/components/admin/CreateNewsModal.js
import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { X, Image } from 'lucide-react';
import newsService from '../../services/newsService'; // Đảm bảo đường dẫn đúng
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

const CreateNewsModal = ({ show, onClose, onNewsCreated }) => {
  const [newsForm, setNewsForm] = useState({
    name: '',
    shortDescription: '',
    content: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Reset form khi modal đóng/mở
  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const createNewsMutation = useMutation(
    async ({ newsData, file }) => {
      const createdNewsResponse = await newsService.createNews(newsData);
      const newsId = createdNewsResponse?.id ?? createdNewsResponse?.data?.id;

      if (file) {
        if (!newsId) {
          throw new Error("News ID is missing after creation. Failed to upload attachment.");
        }
        await newsService.uploadNewsAttachments(newsId, file);
      }
      return createdNewsResponse;
    },
    {
      onSuccess: () => {
        toast.success('News article created successfully' + (selectedFile ? ' and attachment uploaded!' : '!'));
        queryClient.invalidateQueries('admin-news'); // Vô hiệu hóa cache admin-news
        queryClient.invalidateQueries('news'); // Vô hiệu hóa cache public news
        onClose(); // Đóng modal
        onNewsCreated && onNewsCreated(); // Gọi callback nếu có
      },
      onError: (error) => {
        console.error("Error in createNewsMutation:", error);
        if (error.message && error.message.includes("News ID not found")) {
          toast.error('Lỗi: Không thể tạo tin tức hoặc lấy ID để tải ảnh lên. Vui lòng thử lại.');
        } else {
          toast.error('Failed to create news article. Please try again.');
        }
      }
    }
  );

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

  if (!show) {
    return null; // Không render modal nếu show là false
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Create New News Article</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleCreateNews} className="space-y-4">
            <div>
              <label htmlFor="modal-name" className="block text-sm font-medium text-gray-700 mb-2">
                Article Name <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-name"
                name="name"
                type="text"
                required
                className="input-field"
                placeholder="Enter article name..."
                value={newsForm.name}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <label htmlFor="modal-shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Short Description (Optional)
              </label>
              <textarea
                id="modal-shortDescription"
                name="shortDescription"
                rows={3}
                className="input-field"
                placeholder="Brief summary of the article..."
                value={newsForm.shortDescription}
                onChange={handleFormChange}
              />
            </div>

            <div>
              <label htmlFor="modal-content" className="block text-sm font-medium text-gray-700 mb-2">
                Article Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="modal-content"
                name="content"
                rows={8}
                required
                className="input-field"
                placeholder="Write your article content here..."
                value={newsForm.content}
                onChange={handleFormChange}
              />
            </div>

            {/* File Upload Section (chỉ 1 file) */}
            <div>
              <label htmlFor="modal-file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image (Max 1 file, image format only)
              </label>
              <button type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline-primary btn-sm mb-2"
              >
                Chọn ảnh…
              </button>
              <input
                id="modal-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                hidden // Hide the native input
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Ảnh đã chọn: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
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
                    <span>Tạo...</span>
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
  );
};

export default CreateNewsModal;