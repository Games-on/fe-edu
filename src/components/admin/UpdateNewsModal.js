// src/components/admin/UpdateNewsModal.js
import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import newsService from '../../services/newsService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

const UpdateNewsModal = ({ show, onClose, newsItem, onNewsUpdated }) => {
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]); // Files mới để upload
  const [currentAttachments, setCurrentAttachments] = useState([]); // Ảnh hiện có
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show && newsItem) {
      setName(newsItem.name || '');
      setShortDescription(newsItem.shortDescription || '');
      setContent(newsItem.content || '');
      setCurrentAttachments(newsItem.attachments || []); // Đặt ảnh hiện có
      setFiles([]); // Đảm bảo files mới được reset
      setErrors({});
    }
  }, [show, newsItem]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Tiêu đề tin tức không được để trống.';
    if (!shortDescription.trim()) newErrors.shortDescription = 'Mô tả ngắn không được để trống.';
    if (!content.trim()) newErrors.content = 'Nội dung tin tức không được để trống.';

    // Cảnh báo nếu không có ảnh nào còn lại sau khi xóa hoặc không thêm mới
    if (files.length === 0 && currentAttachments.length === 0) {
      newErrors.files = 'Bài viết nên có ít nhất một hình ảnh.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Vui lòng điền đầy đủ và chính xác các trường.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Cập nhật thông tin chính của tin tức
      await newsService.updateNews(newsItem.id, {
        name,
        shortDescription,
        content,
      });

      // Upload files mới (nếu có)
      if (files.length > 0) {
        await newsService.uploadNewsAttachments(newsItem.id, files);
      }

      toast.success('Tin tức đã được cập nhật thành công!');
      onNewsUpdated(); // Gọi callback để refresh danh sách
      onClose(); // Đóng modal
    } catch (err) {
      console.error("Error updating news:", err);
      toast.error(`Đã xảy ra lỗi: ${err.message || 'Vui lòng thử lại.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    if (errors.files) {
      setErrors(prev => ({ ...prev, files: undefined }));
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    if (window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
      try {
        await newsService.deleteAttachment(attachmentId);
        setCurrentAttachments(prev => prev.filter(att => att.id !== attachmentId));
        toast.success('Ảnh đã được xóa.');
      } catch (err) {
        console.error("Error deleting attachment:", err);
        toast.error(`Không thể xóa ảnh: ${err.message || 'Vui lòng thử lại.'}`);
      }
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin tức</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="input-label">Tiêu đề tin tức</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }}
                className="input-field"
                placeholder="Nhập tiêu đề tin tức"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="shortDescription" className="input-label">Mô tả ngắn</label>
              <textarea
                id="shortDescription"
                rows="3"
                value={shortDescription}
                onChange={(e) => { setShortDescription(e.target.value); if (errors.shortDescription) setErrors(prev => ({ ...prev, shortDescription: undefined })); }}
                className="input-field"
                placeholder="Nhập mô tả ngắn cho tin tức"
                required
              ></textarea>
              {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
            </div>

            <div>
              <label htmlFor="content" className="input-label">Nội dung chi tiết</label>
              <textarea
                id="content"
                rows="6"
                value={content}
                onChange={(e) => { setContent(e.target.value); if (errors.content) setErrors(prev => ({ ...prev, content: undefined })); }}
                className="input-field"
                placeholder="Nhập nội dung chi tiết của tin tức"
                required
              ></textarea>
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>

            {/* Current Attachments Display */}
            {currentAttachments.length > 0 && (
              <div>
                <p className="input-label mb-2">Ảnh hiện có:</p>
                <div className="grid grid-cols-3 gap-2">
                  {currentAttachments.map(attachment => (
                    <div key={attachment.id} className="relative group w-full h-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
                      <img
                        src={newsService.getImageUrl(attachment.url)}
                        alt="attachment"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Remove image"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Upload Section for new files */}
            <div>
              <label htmlFor="files" className="input-label">Thêm ảnh mới (tối đa 5 ảnh bao gồm ảnh cũ)</label>
              <input
                type="file"
                id="files"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
                disabled={isSubmitting}
              />
              {errors.files && <p className="text-red-500 text-sm mt-1">{errors.files}</p>}
              {files.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Đã chọn {files.length} file: {files.map(f => f.name).join(', ')}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateNewsModal;