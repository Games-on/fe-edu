import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Eye, ArrowRight, Plus, Shield } from 'lucide-react';
import { newsService } from '../services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, truncateText } from '../utils/helpers';

const NewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';

  const { data: news, isLoading, error } = useQuery(
    ['news', searchTerm],
    () => newsService.getAllNews(),
    {
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (!searchTerm) return data;
        return data.filter(article => 
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading news. Please try again later.</p>
        </div>
      </div>
    );
  }

  const featuredNews = news?.[0];
  const otherNews = news?.slice(1) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Sports News</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Stay updated with the latest sports news, tournament updates, and community highlights
              </p>
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-primary-600">
                  <Shield className="h-4 w-4" />
                  <span>Admin Access</span>
                </div>
                <Link
                  to="/admin/news/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create News
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : news?.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No news articles found</h3>
            <p className="text-gray-600">Check back later for the latest sports updates</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Article */}
            {featuredNews && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0">
                    <div className="h-48 w-full md:w-64 bg-gradient-to-r from-primary-500 to-sports-purple flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-white" />
                    </div>
                  </div>
                  <div className="p-8 flex-1">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium mr-3">
                        Featured
                      </span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(featuredNews.createdAt)}</span>
                      <User className="h-4 w-4 ml-4 mr-1" />
                      <span>EduSports Team</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      <Link 
                        to={`/news/${featuredNews.id}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {featuredNews.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                      {truncateText(featuredNews.content, 200)}
                    </p>
                    <Link
                      to={`/news/${featuredNews.id}`}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Read full article
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Other Articles Grid */}
            {otherNews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">More Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherNews.map((article) => (
                    <article key={article.id} className="card hover:shadow-lg transition-shadow duration-300">
                      <div className="bg-gradient-to-r from-sports-green to-sports-pink h-40 rounded-lg mb-4 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-white" />
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(article.createdAt)}</span>
                        <User className="h-4 w-4 ml-4 mr-1" />
                        <span>EduSports Team</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link 
                          to={`/news/${article.id}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {truncateText(article.content, 120)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/news/${article.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center"
                        >
                          Read more
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>0 views</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        {news && news.length >= 10 && (
          <div className="text-center mt-12">
            <button className="btn-secondary">
              Load More Articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;