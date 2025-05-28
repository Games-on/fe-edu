// src/components/admin/NewsDetailModal.js
import React, { useEffect, useState } from 'react';
import { X, Calendar, User, Image as ImageIcon } from 'lucide-react';
import newsService from '../../services/newsService'; // Đảm bảo đường dẫn đúng đến newsService của bạn
import LoadingSpinner from '../LoadingSpinner'; // Giả sử bạn có LoadingSpinner

const NewsDetailModal = ({ show, onClose, newsItem }) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (newsItem && newsItem.attachments && newsItem.attachments.length > 0) {
      // Giả sử newsService.getImageUrl có thể tạo URL ảnh từ attachment.url
      setImageUrl(newsService.getImageUrl(newsItem.attachments[0].url));
    } else {
      setImageUrl('');
    }
  }, [newsItem]);

  if (!show || !newsItem) {
    return null;
  }

  // Helper function for formatting date (có thể tái sử dụng từ NewsManagement)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Invalid date format for modal:", dateString, e);
      return 'Invalid Date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Chi tiết tin tức</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Hình ảnh chính của tin tức */}
            <div className="w-full bg-gray-200 flex items-center justify-center overflow-hidden rounded-lg">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={newsItem.name || 'News Image'}
                  className="object-contain max-h-96 w-full" // Dòng này đã được sửa
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; e.target.className = 'object-contain max-h-96 w-full p-4'; }} // Và dòng này
                />
              ) : (
                <ImageIcon className="h-20 w-20 text-gray-400" />
              )}
            </div>

            {/* Tiêu đề */}
            <h2 className="text-3xl font-extrabold text-gray-900">
              {newsItem.name}
            </h2>

            {/* Thông tin meta */}
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                <span>{formatDate(newsItem.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1 text-gray-400" />
                <span>{newsItem.author || 'EduSports Team'}</span>
              </div>
            </div>

            {/* Mô tả ngắn (nếu có) */}
            {newsItem.shortDescription && (
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-2">Mô tả ngắn:</p>
                <p className="text-gray-700 leading-relaxed">
                  {newsItem.shortDescription}
                </p>
              </div>
            )}

            {/* Nội dung chi tiết */}
            <div>
              <p className="text-lg font-semibold text-gray-800 mb-2">Nội dung:</p>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {/* Có thể sử dụng dangerouslySetInnerHTML nếu content của bạn là HTML */}
                {/* Ví dụ: <div dangerouslySetInnerHTML={{ __html: newsItem.content }} /> */}
                <p>{newsItem.content}</p>
              </div>
            </div>
          </div>

          {/* Footer của modal */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailModal;