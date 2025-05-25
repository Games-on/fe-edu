import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { X, Save, Trophy, Calendar, Users, MapPin } from 'lucide-react';
import { tournamentService } from '../../services';
import { 
  SPORT_TYPES, 
  SPORT_TYPE_LABELS,
  TOURNAMENT_STATUS,
  TOURNAMENT_STATUS_LABELS,
  VALIDATION_RULES
} from '../../utils/constants.safe';
import { formatDateTimeForInput } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TournamentEditForm = ({ tournament, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      sportType: SPORT_TYPES?.FOOTBALL || 'FOOTBALL',
      maxTeams: 16,
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      rules: '',
      prizeInfo: '',
      contactInfo: '',
      status: TOURNAMENT_STATUS?.REGISTRATION || 'REGISTRATION'
    },
    mode: 'onChange'
  });

  // Populate form when tournament data changes
  useEffect(() => {
    if (tournament && isOpen) {
      reset({
        name: tournament.name || '',
        description: tournament.description || '',
        sportType: tournament.sportType || 'FOOTBALL',
        maxTeams: tournament.maxTeams || 16,
        startDate: tournament.startDate ? formatDateTimeForInput(new Date(tournament.startDate)) : '',
        endDate: tournament.endDate ? formatDateTimeForInput(new Date(tournament.endDate)) : '',
        registrationDeadline: tournament.registrationDeadline ? formatDateTimeForInput(new Date(tournament.registrationDeadline)) : '',
        location: tournament.location || '',
        rules: tournament.rules || '',
        prizeInfo: tournament.prizeInfo || '',
        contactInfo: tournament.contactInfo || '',
        status: tournament.status || 'REGISTRATION'
      });
    }
  }, [tournament, isOpen, reset]);

  const updateTournamentMutation = useMutation(
    (tournamentData) => tournamentService.updateTournament(tournament.id, tournamentData),
    {
      onSuccess: (response) => {
        toast.success('Tournament updated successfully!');
        onSuccess?.(response.data);
        handleClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update tournament');
        setIsSubmitting(false);
      }
    }
  );

  const watchStartDate = watch('startDate');
  const watchStatus = watch('status');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const regDeadline = new Date(data.registrationDeadline);
      
      if (regDeadline >= startDate) {
        toast.error('Registration deadline must be before tournament start date');
        setIsSubmitting(false);
        return;
      }
      
      if (startDate >= endDate) {
        toast.error('End date must be after start date');
        setIsSubmitting(false);
        return;
      }

      // Check if max teams is being reduced below current teams
      if (data.maxTeams < tournament.currentTeams) {
        if (!window.confirm(`Reducing max teams to ${data.maxTeams} will not affect already registered teams (${tournament.currentTeams}). Continue?`)) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare tournament data
      const tournamentData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        registrationDeadline: new Date(data.registrationDeadline).toISOString(),
        maxTeams: parseInt(data.maxTeams)
      };
      
      console.log('Updating tournament with data:', tournamentData);
      await updateTournamentMutation.mutateAsync(tournamentData);
    } catch (error) {
      console.error('Tournament update error:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }
    reset();
    setIsSubmitting(false);
    onClose();
  };

  // Generate min dates
  const today = new Date();
  const minStartDate = formatDateTimeForInput(today);
  const minEndDate = watchStartDate ? 
    formatDateTimeForInput(new Date(new Date(watchStartDate).getTime() + 24 * 60 * 60 * 1000)) : 
    minStartDate;
  const maxRegDeadline = watchStartDate ? 
    formatDateTimeForInput(new Date(new Date(watchStartDate).getTime() - 24 * 60 * 60 * 1000)) : 
    '';

  // Determine which fields should be disabled based on tournament status
  const isOngoing = tournament?.status === 'ONGOING' || tournament?.status === 'COMPLETED';
  const hasRegisteredTeams = tournament?.currentTeams > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Tournament</h2>
              <p className="text-sm text-gray-600">Update tournament information and settings</p>
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
            {/* Warning for ongoing tournaments */}
            {isOngoing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">Tournament Status Notice</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This tournament is {tournament.status.toLowerCase()}. Some fields may be restricted from editing.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                      value: VALIDATION_RULES?.TOURNAMENT_NAME?.MIN_LENGTH || 3,
                      message: `Tournament name must be at least ${VALIDATION_RULES?.TOURNAMENT_NAME?.MIN_LENGTH || 3} characters`
                    },
                    maxLength: {
                      value: VALIDATION_RULES?.TOURNAMENT_NAME?.MAX_LENGTH || 100,
                      message: `Tournament name cannot exceed ${VALIDATION_RULES?.TOURNAMENT_NAME?.MAX_LENGTH || 100} characters`
                    }
                  })}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
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
                  Sport Type *
                </label>
                <select
                  {...register('sportType', { required: 'Please select a sport type' })}
                  className={`input-field ${errors.sportType ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || hasRegisteredTeams}
                >
                  <option value="FOOTBALL">Football</option>
                  <option value="BASKETBALL">Basketball</option>
                  <option value="VOLLEYBALL">Volleyball</option>
                  <option value="BADMINTON">Badminton</option>
                  <option value="TENNIS">Tennis</option>
                </select>
                {errors.sportType && (
                  <p className="mt-1 text-sm text-red-600">{errors.sportType.message}</p>
                )}
                {hasRegisteredTeams && (
                  <p className="mt-1 text-sm text-gray-500">
                    Cannot change sport type when teams are registered
                  </p>
                )}
              </div>

              {/* Max Teams */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Teams *
                </label>
                <select
                  {...register('maxTeams', { 
                    required: 'Please select maximum teams',
                    min: { value: tournament?.currentTeams || 4, message: `Must be at least ${tournament?.currentTeams || 4} teams` }
                  })}
                  className={`input-field ${errors.maxTeams ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isOngoing}
                >
                  {[4, 8, 16, 32, 64].map(num => (
                    <option 
                      key={num} 
                      value={num} 
                      disabled={num < (tournament?.currentTeams || 0)}
                    >
                      {num} teams {num < (tournament?.currentTeams || 0) ? '(too few)' : ''}
                    </option>
                  ))}
                </select>
                {errors.maxTeams && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxTeams.message}</p>
                )}
                {tournament?.currentTeams > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Currently {tournament.currentTeams} teams registered
                  </p>
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
                  minLength: { value: 10, message: 'Description must be at least 10 characters' }
                })}
                rows={3}
                className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe the tournament details"
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
                  className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isOngoing}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
                {isOngoing && (
                  <p className="mt-1 text-sm text-gray-500">Cannot change dates for ongoing tournaments</p>
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
                  className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline *
                </label>
                <input
                  type="datetime-local"
                  {...register('registrationDeadline', { required: 'Registration deadline is required' })}
                  max={maxRegDeadline}
                  className={`input-field ${errors.registrationDeadline ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isOngoing}
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
                className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                placeholder="Enter tournament location"
                disabled={isSubmitting}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Rules
                </label>
                <textarea
                  {...register('rules')}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe tournament rules and regulations"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prize Information
                </label>
                <textarea
                  {...register('prizeInfo')}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe prizes and awards"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information *
              </label>
              <input
                type="text"
                {...register('contactInfo', { required: 'Contact information is required' })}
                className={`input-field ${errors.contactInfo ? 'border-red-500' : ''}`}
                placeholder="Email or phone number for contact"
                disabled={isSubmitting}
              />
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
              )}
            </div>

            {/* Change Summary */}
            {isDirty && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Trophy className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Pending Changes</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You have unsaved changes to this tournament. Click "Save Changes" to apply them.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !isValid || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentEditForm;