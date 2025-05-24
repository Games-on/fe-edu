import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Calendar, User, Share2, Heart, Eye, Upload, Edit } from 'lucide-react';
import { newsService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import NewsFileUpload from '../components/news/NewsFileUpload';
import { formatDate } from '../utils/helpers';

const NewsDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ORGANIZER';

  const { data: article, isLoading, error, refetch } = useQuery(
    ['news', id],
    () => newsService.getNewsById(id),
    { 
      staleTime: 5 * 60 * 1000,
      enabled: !!id 
    }
  );

  const { data: relatedNews } = useQuery(
    'related-news',
    () => newsService.getAllNews(),
    { 
      staleTime: 5 * 60 * 1000,
      select: (data) => data.filter(news => news.id !== parseInt(id)).slice(0, 3)
    }
  );

  const handleUploadComplete = (uploadedFiles) => {
    setAttachments(prev => [...prev, ...uploadedFiles]);
    setShowFileUpload(false);
    refetch(); // Refresh article data
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
          <Link to="/news" className="text-primary-600 hover:text-primary-700">
            ← Back to news
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.content.substring(0, 100),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handleViewImage = async (imageName) => {
    try {
      const imageBlob = await newsService.getImage(imageName);
      const imageUrl = URL.createObjectURL(imageBlob);
      window.open(imageUrl, '_blank');
    } catch (error) {
      console.error('Error loading image:', error);
    }
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
                  <span>Manage Files</span>
                </button>
                <Link
                  to={`/admin/news/${id}/edit`}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* File Upload Section */}
        {showFileUpload && isAdmin && (
          <div className="mb-8">
            <NewsFileUpload 
              newsId={id} 
              onUploadComplete={handleUploadComplete}
            />
          </div>
        )}

        {/* Article */}
        <article className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Featured Image */}
          <div className="bg-gradient-to-r from-primary-500 to-sports-purple h-64 md:h-80 flex items-center justify-center">
            <Calendar className="h-24 w-24 text-white" />
          </div>

          <div className="p-8">
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
              {article.title}
            </h1>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Attachments */}
            {(article.attachments?.length > 0 || attachments.length > 0) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...(article.attachments || []), ...attachments].map((attachment, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {attachment.type?.startsWith('image/') ? (
                            <button
                              onClick={() => handleViewImage(attachment.fileName)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          ) : (
                            <Upload className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.fileName || attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : ''}
                          </p>
                        </div>
                      </div>
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
                  <span>Like</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                Published {formatDate(article.createdAt)}
                {article.updatedAt && article.updatedAt !== article.createdAt && (
                  <span className="ml-2">
                    • Updated {formatDate(article.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedNews && relatedNews.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/news/${relatedArticle.id}`}
                  className="group"
                >
                  <div className="bg-gradient-to-r from-sports-green to-sports-pink h-32 rounded-lg mb-3 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {relatedArticle.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {relatedArticle.content.substring(0, 100)}...
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
