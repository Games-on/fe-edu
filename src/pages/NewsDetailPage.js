import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Calendar, User, Share2, Heart, Eye, Upload, Edit, Image as ImageIcon } from 'lucide-react'; // Import ImageIcon
import { newsService } from '../services'; // Đảm bảo import newsService đúng cách
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import NewsFileUpload from '../components/news/NewsFileUpload';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast'; // Thêm toast notifications

const NewsDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [showFileUpload, setShowFileUpload] = useState(false);
  // Không cần state attachments riêng, sẽ dựa vào article.attachments sau refetch
  // const [attachments, setAttachments] = useState([]); // Đã loại bỏ state này

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const { data: article, isLoading, error, refetch } = useQuery(
    ['newsDetail', id], // Đổi key từ 'news' sang 'newsDetail' để phân biệt với danh sách news
    () => newsService.getNewsById(id),
    {
      staleTime: 5 * 60 * 1000, // 5 phút cache
      enabled: !!id, // Chỉ chạy query khi có ID
      onSuccess: (data) => {
        console.log("Fetched article data:", data);
        // Có thể setAttachments nếu bạn muốn, nhưng refetch đã cập nhật article.attachments
        // setAttachments(data.attachments || []);
      },
      onError: (err) => {
        console.error('Error fetching news detail:', err);
        toast.error('Failed to load news article.');
      }
    }
  );

  const { data: relatedNews } = useQuery(
    'related-news',
    () => newsService.getAllNews(), // Lấy tất cả tin tức
    {
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        // Lọc ra tin tức hiện tại và chỉ lấy 3 tin đầu tiên
        // Đảm bảo data là mảng, có thể từ data.data
        const newsArray = Array.isArray(data) ? data : (data?.data || []);
        return newsArray.filter(news => news.id !== parseInt(id)).slice(0, 3);
      },
      onError: (err) => {
        console.error('Error fetching related news:', err);
      }
    }
  );

  const handleUploadComplete = () => {
    setShowFileUpload(false);
    refetch(); // Quan trọng: Refetch lại dữ liệu bài viết để cập nhật danh sách ảnh đính kèm
    toast.success('Files uploaded successfully!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
        <p className="text-gray-600 ml-4">Loading news article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Article</h2>
          <p className="text-gray-700 mb-6">
            {error ? error.message : "The news article you are looking for could not be found."}
          </p>
          <Link
            to="/news"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News List
          </Link>
        </div>
      </div>
    );
  }

  const primaryImageUrl = article.attachments && article.attachments.length > 0
    ? newsService.getImageUrl(article.attachments[0].fileName) // Dùng fileName hoặc url tùy backend
    : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title || article.name,
          text: article.shortDescription || article.content?.substring(0, 100),
          url: window.location.href,
        });
        toast.success('Article shared successfully!');
      } catch (error) {
        console.log('Error sharing:', error);
        toast.error('Failed to share article.');
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  // Hàm này giờ chỉ cần mở URL trực tiếp
  const handleViewAttachment = (attachment) => {
    // Giả sử attachment.url hoặc attachment.fileName là đường dẫn relative
    // newsService.getImageUrl đã chuyển đổi thành URL đầy đủ
    const fullUrl = newsService.getImageUrl(attachment.fileName || attachment.url);
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/news"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to News
            </Link>

            {isAdmin && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Quản lý Tệp</span>
                </button>
                {/* Giả định bạn có trang edit riêng cho từng bài viết */}
                <Link
                  to={`/admin/news/${id}/edit`}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Chỉnh sửa</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        {showFileUpload && isAdmin && (
          <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload New Files</h3>
            <NewsFileUpload
              newsId={id}
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {/* Article */}
        <article className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Featured Image */}
          {primaryImageUrl ? (
            <div className="h-64 md:h-96 w-full overflow-hidden">
              <img
                src={primaryImageUrl}
                alt={article.title || article.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found"; // Fallback image
                  e.target.className += " object-contain p-4"; // Tùy chỉnh CSS cho ảnh lỗi
                }}
              />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-primary-500 to-sports-purple h-64 md:h-80 flex items-center justify-center rounded-t-xl">
              <ImageIcon className="h-24 w-24 text-white opacity-70" />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Article Meta */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(article.createdAt)}</span>
              <User className="h-4 w-4 ml-6 mr-2" />
              <span>{article.author || 'EduSports Team'}</span>
              <Eye className="h-4 w-4 ml-6 mr-2" />
              <span>{article.views || 0} views</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title || article.name}
            </h1>

            {/* Short Description (if different from content) */}
            {article.shortDescription && article.shortDescription !== article.content && (
              <p className="text-lg text-gray-700 italic mb-6">
                {article.shortDescription}
              </p>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Attachments */}
            {article.attachments && article.attachments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tệp Đính Kèm</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {article.attachments.map((attachment) => (
                    <div key={attachment.id || attachment.fileName} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                      <div className="flex-shrink-0">
                          {/* Kiểm tra loại file để hiển thị icon phù hợp */}
                          {attachment.fileType?.startsWith('image/') ? ( // Giả định backend trả về fileType
                            <ImageIcon className="h-6 w-6 text-blue-600" />
                          ) : (
                            <Upload className="h-6 w-6 text-gray-400" />
                          )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.fileName || attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewAttachment(attachment)}
                        className="text-primary-600 hover:text-primary-800 flex-shrink-0"
                        title="View File"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Article Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span>Thích</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Chia sẻ</span>
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Xuất bản: {formatDate(article.createdAt)}
                {article.updatedAt && article.updatedAt !== article.createdAt && (
                  <span className="ml-2">
                    • Cập nhật: {formatDate(article.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedNews && relatedNews.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài Viết Liên Quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/news/${relatedArticle.id}`}
                  className="group"
                  onClick={() => window.scrollTo(0, 0)} // Cuộn lên đầu trang khi chuyển bài viết liên quan
                >
                  {relatedArticle.attachments && relatedArticle.attachments.length > 0 ? (
                    <div className="bg-gray-200 h-32 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={newsService.getImageUrl(relatedArticle.attachments[0].fileName)}
                        alt={relatedArticle.title || relatedArticle.name}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/400x200?text=Related+Image";
                          e.target.className += " object-contain p-2";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-sports-green to-sports-pink h-32 rounded-lg mb-3 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                      <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                  )}

                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {relatedArticle.title || relatedArticle.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {relatedArticle.shortDescription || relatedArticle.content?.substring(0, 100)}...
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    {formatDate(relatedArticle.createdAt)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetailPage;