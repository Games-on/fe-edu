import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X, Calendar, Users, MapPin, Trophy, FileText, Upload } from 'lucide-react';
import { tournamentService } from '../../services';
import { 
  SPORT_TYPES, 
  SPORT_TYPE_LABELS,
  TOURNAMENT_STATUS,
  VALIDATION_RULES,
  QUERY_KEYS
} from '../../utils/constants';
import { formatDateTimeForInput } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TournamentCreateForm = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      sportType: 'FOOTBALL',
      maxTeams: 16,
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      rules: '',
      prizeInfo: '',
      contactInfo: ''
    },
    mode: 'onChange'
  });

  const createTournamentMutation = useMutation(
    (tournamentData) => {
      console.log('🚀 Calling tournamentService.createTournament with:', tournamentData);
      return tournamentService.createTournament(tournamentData);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Tournament created successfully:', response);
        toast.success('Tạo giải đấu thành công!');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
        onSuccess?.(response?.data || response);
        handleClose();
      },
      onError: (error) => {
        console.error('❌ Tournament creation failed:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           'An error occurred while creating the tournament.';
        
        toast.error(errorMessage);
        setIsSubmitting(false);
      }
    }
  );

  const watchStartDate = watch('startDate');

  const onSubmit = async (data) => {
    try {
      console.log('📝 Form submitted with data:', data);
      setIsSubmitting(true);
      
      // Validate required fields
      if (!data.name || !data.description || !data.location || !data.contactInfo) {
        toast.error('Please fill in all required information');
        setIsSubmitting(false);
        return;
      }

      // Validate dates
      if (!data.startDate || !data.endDate || !data.registrationDeadline) {
        toast.error('Please select full date');
        setIsSubmitting(false);
        return;
      }

      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const regDeadline = new Date(data.registrationDeadline);
      const now = new Date();
      
      if (regDeadline <= now) {
        toast.error('Hạn đăng ký phải sau thời điểm hiện tại');
        setIsSubmitting(false);
        return;
      }
      
      if (regDeadline >= startDate) {
        toast.error('Hạn đăng ký phải trước ngày bắt đầu giải đấu');
        setIsSubmitting(false);
        return;
      }
      
      if (startDate >= endDate) {
        toast.error('Ngày kết thúc phải sau ngày bắt đầu');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare tournament data to match backend expectations
      const tournamentData = {
        name: data.name.trim(),
        description: data.description.trim(),
        sportType: data.sportType || 'FOOTBALL',
        maxTeams: parseInt(data.maxTeams) || 16,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        registrationDeadline: regDeadline.toISOString(),
        location: data.location.trim(),
        rules: data.rules?.trim() || '',
        prizeInfo: data.prizeInfo?.trim() || '',
        contactInfo: data.contactInfo.trim()
      };
      
      console.log('🎯 Final tournament data to send:', tournamentData);
      await createTournamentMutation.mutateAsync(tournamentData);
    } catch (error) {
      console.error('💥 Tournament creation error in onSubmit:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsSubmitting(false);
    onClose();
  };

  // Generate min dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const minStartDate = formatDateTimeForInput(tomorrow);
  const minEndDate = watchStartDate ? 
    formatDateTimeForInput(new Date(new Date(watchStartDate).getTime() + 24 * 60 * 60 * 1000)) : 
    minStartDate;
  const maxRegDeadline = watchStartDate ? 
    formatDateTimeForInput(new Date(new Date(watchStartDate).getTime() - 24 * 60 * 60 * 1000)) : 
    '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Tournament</h2>
              <p className="text-sm text-gray-600">Fill in the information to create a tournament</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tournament Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Tournament name is required',
                    minLength: {
                      value: 3,
                      message: 'Tournament name must be at least 3 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Tournament name cannot exceed 100 characters'
                    }
                  })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter tournament name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Sport Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <select
                  {...register('sportType', { required: 'Please select a sport' })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.sportType ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="FOOTBALL">Football</option>
                  <option value="BASKETBALL">Basketball</option>
                  <option value="VOLLEYBALL">Volleyball</option>
                  <option value="BADMINTON">Badminton</option>
                  <option value="TENNIS">Tennis</option>
                  <option value="PING_PONG">League of Legends</option>
                  <option value="PING_PONG">Bida</option>
                  <option value="GENERAL">Other</option>
                </select>
                {errors.sportType && (
                  <p className="mt-1 text-sm text-red-600">{errors.sportType.message}</p>
                )}
              </div>

              {/* Max Teams */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum number of teams *
                </label>
                <select
                  {...register('maxTeams', { 
                    required: 'Please select maximum number of teams'
                  })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.maxTeams ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value={4}>4 teams</option>
                  <option value={8}>8 teams</option>
                  <option value={16}>16 teams</option>
                  <option value={32}>32 teams</option>
                  <option value={64}>64 teams</option>
                </select>
                {errors.maxTeams && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxTeams.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament Description *
              </label>
              <textarea
                {...register('description', {
                  required: 'Tournament description is required',
                  minLength: { value: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
                })}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Detailed description of the tournament"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate', { required: 'Start date is required' })}
                  min={minStartDate}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startDate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  {...register('endDate', { required: 'End date is required' })}
                  min={minEndDate}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endDate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration deadline *
                </label>
                <input
                  type="datetime-local"
                  {...register('registrationDeadline', { required: 'Registration deadline is mandatory' })}
                  min={formatDateTimeForInput(today)}
                  max={maxRegDeadline}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.registrationDeadline ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.registrationDeadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.location ? 'border-red-500' : ''}`}
                placeholder="Enter the venue"
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact information *
              </label>
              <input
                type="text"
                {...register('contactInfo', { required: 'Contact information is required' })}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactInfo ? 'border-red-500' : ''}`}
                placeholder="Contact email or phone number"
                disabled={isSubmitting}
              />
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competition rules
                </label>
                <textarea
                  {...register('rules')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Description of competition rules and regulations"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Award Information
                </label>
                <textarea
                  {...register('prizeInfo')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Prize and reward descriptions"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Create a tournament
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentCreateForm;