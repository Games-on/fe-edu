import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateNewsModal = ({ show, onClose, onCreateNews, isCreating }) => {
  const [title, setTitle] = useState(''); // Tương ứng với 'Tên' (name)
  const [shortDescription, setShortDescription] = useState(''); // Tương ứng với 'Mô tả' (shortDescription)
  const [content, setContent] = useState(''); // Tương ứng với 'Nội dung' (content)
  const [status, setStatus] = useState('DRAFT');
  const [selectedFiles, setSelectedFiles] = useState([]); // State để lưu trữ các file đã chọn

  useEffect(() => {
    if (!show) {
      // Reset form khi modal đóng
      setTitle('');
      setShortDescription('');
      setContent('');
      setStatus('DRAFT');
      setSelectedFiles([]); // Reset files khi đóng modal
    }
  }, [show]);

  const handleFileSelect = (e) => {
    // Lấy danh sách các file từ input
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content || !shortDescription) {
      toast.error('Title, Short Description, and Content are required.');
      return;
    }

    // Tạo FormData để gửi dữ liệu dạng multipart/form-data (cần thiết khi có file)
    const formData = new FormData();
    formData.append('name', title); // Thay 'title' bằng 'name' để khớp với entity Backend
    formData.append('shortDescription', shortDescription); 
    formData.append('content', content);
    formData.append('status', status);

    selectedFiles.forEach((file) => {
      formData.append('files', file); // 'files' là tên trường mà API của bạn sẽ mong đợi cho các file
    });
    onCreateNews(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New News Article</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {/* Trường Tên (Title) */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full"
              placeholder="Nhập tên"
              required
            />
          </div>

          {/* Trường Mô tả (Short Description) */}
          <div className="mb-4">
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <input
              type="text"
              id="shortDescription"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="input-field w-full"
              placeholder="Nhập mô tả"
              required
            />
          </div>

          {/* Trường Nội dung (Content) */}
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="6"
              className="input-field w-full"
              placeholder="Nhập nội dung"
              required
            ></textarea>
          </div>

          {/* Trường Ảnh đính kèm (File input) */}
          <div className="mb-4">
            <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-1">Ảnh đính kèm (PNG, JPG, GIF)</label>
            <input
              id="files"
              type="file"
              className="form-control-file w-full border border-gray-300 rounded-md p-2" // Sử dụng class của bạn hoặc Tailwind CSS
              accept="image/*"
              multiple // Cho phép chọn nhiều file
              onChange={handleFileSelect} // Xử lý khi file được chọn
            />
          </div>

          {/* Danh sách file đã chọn */}
          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Các tệp đã chọn:</label>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trường Status */}
          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field w-full"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {/* Nút Tạo và Hủy */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewsModal;