import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, Trophy, Users, Calendar, MapPin } from 'lucide-react';
import { tournamentService } from '../services';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/helpers';

const TournamentsPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('startDate');

  const { data: tournaments, isLoading, error } = useQuery(
    ['tournaments', { page, searchTerm, status: statusFilter, sortBy }],
    () => tournamentService.getAllTournaments({
      page,
      limit: 12,
      search: searchTerm,
      status: statusFilter,
      sortBy,
    }),
    {
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      select: (response) => {
        console.log('Tournaments Page Response:', response);
        // Handle different response formats
        let data = [];
        let pagination = {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        };

        if (Array.isArray(response)) {
          data = response;
        } else if (response?.data && Array.isArray(response.data)) {
          data = response.data;
          pagination = response.pagination || pagination;
        } else if (response?.data?.content && Array.isArray(response.data.content)) {
          data = response.data.content;
          pagination = response.data.pagination || pagination;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
          pagination = response.pagination || pagination;
        }

        return {
          data,
          pagination
        };
      }
    }
  );

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const sortOptions = [
    { value: 'startDate', label: 'Start Date' },
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Created Date' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading tournaments. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tournaments</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover exciting sports competitions and join the action
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field min-w-[150px]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field min-w-[150px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort by {option.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </button>
            </div>
          </form>
        </div>

        {/* Tournament Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : tournaments?.data?.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tournaments?.data?.map((tournament) => (
                <div key={tournament.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="relative mb-4">
                    <div className="bg-gradient-to-r from-primary-500 to-sports-purple h-48 rounded-lg flex items-center justify-center">
                      <Trophy className="h-20 w-20 text-white" />
                    </div>
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {tournament.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {tournament.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Start: {formatDate(tournament.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Max {tournament.maxTeams} teams</span>
                    </div>
                    {tournament.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{tournament.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/tournaments/${tournament.id}`}
                      className="btn-primary flex-1 text-center"
                    >
                      View Details
                    </Link>
                    {tournament.status === 'UPCOMING' && (
                      <Link
                        to={`/tournaments/${tournament.id}/register`}
                        className="btn-secondary"
                      >
                        Register
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {tournaments?.pagination?.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-gray-600">
                  Page {page} of {tournaments.pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= tournaments.pagination.totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;