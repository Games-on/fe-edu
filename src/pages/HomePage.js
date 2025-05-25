import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Trophy, Users, Calendar, Target, ArrowRight, Play, Star } from 'lucide-react';
import { tournamentServiceFixed as tournamentService } from '../services/tournamentServiceFixed';
import { newsService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';

const HomePage = () => {
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    ['tournaments', { page: 1, limit: 3 }],
    () => tournamentService.getAllTournaments({ page: 1, limit: 3 }),
    { 
      staleTime: 5 * 60 * 1000,
      select: (response) => {
        console.log('🏆 [HomePage] Tournaments API Response:', response);
        
        // tournamentServiceFixed already handles the response format and returns { data: [...], pagination: {...} }
        if (response && Array.isArray(response.data)) {
          console.log('🏆 [HomePage] Found tournaments:', response.data.length);
          return response.data;
        }
        
        // Fallback for other formats
        if (Array.isArray(response)) {
          return response;
        }
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (response?.data?.content && Array.isArray(response.data.content)) {
          return response.data.content;
        }
        if (response?.data?.tournaments && Array.isArray(response.data.tournaments)) {
          return response.data.tournaments;
        }
        
        // Fallback to empty array
        console.warn('⚠️ [HomePage] Tournaments data is not an array:', response);
        return [];
      }
    }
  );

  const { data: news, isLoading: newsLoading } = useQuery(
    'recent-news',
    () => newsService.getAllNews(),
    { 
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        console.log('News API Response:', data);
        // Handle different response formats
        let newsArray = [];
        if (Array.isArray(data)) {
          newsArray = data;
        } else if (data?.data && Array.isArray(data.data)) {
          newsArray = data.data;
        } else {
          console.warn('News data is not an array:', data);
          newsArray = [];
        }
        return newsArray.slice(0, 3); // Take only first 3 news items
      }
    }
  );

  const stats = [
    { icon: Trophy, label: 'Active Tournaments', value: '15+', color: 'text-sports-orange' },
    { icon: Users, label: 'Registered Teams', value: '200+', color: 'text-sports-green' },
    { icon: Calendar, label: 'Matches Played', value: '500+', color: 'text-sports-purple' },
    { icon: Target, label: 'Success Rate', value: '98%', color: 'text-sports-pink' },
  ];

  const features = [
    {
      title: 'Tournament Management',
      description: 'Create and manage tournaments with ease. Handle registrations, scheduling, and results.',
      icon: Trophy,
    },
    {
      title: 'Team Registration',
      description: 'Simple team registration process with member management and documentation.',
      icon: Users,
    },
    {
      title: 'Live Scoring',
      description: 'Real-time match scoring and live updates for all tournament participants.',
      icon: Play,
    },
    {
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and reporting for tournament insights and performance.',
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-sports-purple min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-sports-orange to-sports-pink bg-clip-text text-transparent">
                EduSports
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto animate-slide-up">
              The ultimate tournament management system for educational sports. 
              Organize, compete, and celebrate athletic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/tournaments"
                className="bg-sports-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Trophy className="h-5 w-5" />
                <span>View Tournaments</span>
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-900 font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Users className="h-5 w-5" />
                <span>Join Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Sports Tournaments
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From registration to final results, our comprehensive platform handles every aspect 
              of tournament management with professional-grade tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-primary-500 to-sports-purple p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Tournaments</h2>
              <p className="text-xl text-gray-600">Join exciting competitions happening now</p>
            </div>
            <Link
              to="/tournaments"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {tournamentsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(tournaments || []).slice(0, 3).map((tournament) => (
                <div key={tournament.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="relative mb-4">
                    <div className="bg-gradient-to-r from-primary-500 to-sports-purple h-40 rounded-lg flex items-center justify-center">
                      <Trophy className="h-16 w-16 text-white" />
                    </div>
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tournament.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{tournament.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>Start: {formatDate(tournament.startDate)}</span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{tournament.maxTeams} teams</span>
                    </span>
                  </div>
                  <Link
                    to={`/tournaments/${tournament.id}`}
                    className="btn-primary w-full text-center"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h2>
              <p className="text-xl text-gray-600">Stay updated with the latest sports news</p>
            </div>
            <Link
              to="/news"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {newsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(news || []).map((article) => (
                <div key={article.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-sports-green to-sports-pink h-40 rounded-lg mb-4 flex items-center justify-center">
                    <Star className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{article.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {formatDate(article.createdAt)}
                    </span>
                    <Link
                      to={`/news/${article.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-sports-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Sports Journey?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of athletes and organizers who trust EduSports for their tournament management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-colors duration-300"
            >
              Get Started Today
            </Link>
            <Link
              to="/tournaments"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-lg transition-all duration-300"
            >
              Explore Tournaments
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;