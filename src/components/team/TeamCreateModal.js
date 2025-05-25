import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { X, Users, Trophy, Loader2 } from 'lucide-react';
import { tournamentService, teamService } from '../../services';
import toast from 'react-hot-toast';

const TeamCreateModal = ({ isOpen, onClose }) => {
  const [selectedTournament, setSelectedTournament] = useState('');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch available tournaments for registration
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery(
    'available-tournaments',
    () => tournamentService.getAllTournaments({ 
      page: 1, 
      limit: 50,
      status: 'REGISTRATION_OPEN' 
    }),
    {
      enabled: isOpen,
      select: (response) => response?.data || []
    }
  );

  // Team registration mutation
  const registerTeamMutation = useMutation(
    ({ tournamentId, teamData }) => teamService.registerTeam(tournamentId, teamData),
    {
      onSuccess: (response) => {
        toast.success('Team registered successfully!');
        queryClient.invalidateQueries('user-teams');
        queryClient.invalidateQueries('user-tournaments');
        reset();
        setSelectedTournament('');
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to register team');
      },
    }
  );

  const onSubmit = async (data) => {
    if (!selectedTournament) {
      toast.error('Please select a tournament');
      return;
    }

    registerTeamMutation.mutate({
      tournamentId: selectedTournament,
      teamData: {
        teamName: data.teamName,
        teamColor: data.teamColor,
        memberCount: parseInt(data.memberCount),
        contactInfo: data.contactInfo,
        logoUrl: data.logoUrl,
        notes: data.notes,
      },
    });
  };

  const handleClose = () => {
    reset();
    setSelectedTournament('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Team</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Tournament Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tournament <span className="text-red-500">*</span>
            </label>
            {tournamentsLoading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading tournaments...</span>
              </div>
            ) : (
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Choose a tournament to join</option>
                {tournaments?.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name} ({tournament.currentTeams || 0}/{tournament.maxTeams} teams)
                  </option>
                ))}
              </select>
            )}
            {tournaments?.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                No tournaments currently open for registration.
              </p>
            )}
          </div>

          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('teamName', {
                required: 'Team name is required',
                maxLength: {
                  value: 100,
                  message: 'Team name must not exceed 100 characters',
                },
              })}
              type="text"
              className="input-field"
              placeholder="Enter your team name"
            />
            {errors.teamName && (
              <p className="mt-1 text-sm text-red-600">{errors.teamName.message}</p>
            )}
          </div>

          {/* Team Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                {...register('teamColor', {
                  pattern: {
                    value: /^#[A-Fa-f0-9]{6}$/,
                    message: 'Team color must be a valid hex color code',
                  },
                })}
                type="color"
                className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                defaultValue="#3B82F6"
              />
              <input
                {...register('teamColor')}
                type="text"
                className="input-field flex-1"
                placeholder="#3B82F6"
              />
            </div>
            {errors.teamColor && (
              <p className="mt-1 text-sm text-red-600">{errors.teamColor.message}</p>
            )}
          </div>

          {/* Member Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Count <span className="text-red-500">*</span>
            </label>
            <input
              {...register('memberCount', {
                required: 'Member count is required',
                min: {
                  value: 1,
                  message: 'Member count must be at least 1',
                },
                max: {
                  value: 50,
                  message: 'Member count must not exceed 50',
                },
              })}
              type="number"
              min="1"
              max="50"
              className="input-field"
              placeholder="Number of team members"
            />
            {errors.memberCount && (
              <p className="mt-1 text-sm text-red-600">{errors.memberCount.message}</p>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </label>
            <input
              {...register('contactInfo', {
                maxLength: {
                  value: 500,
                  message: 'Contact info must not exceed 500 characters',
                },
              })}
              type="text"
              className="input-field"
              placeholder="Email, phone, or other contact details"
            />
            {errors.contactInfo && (
              <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
            )}
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Logo URL (Optional)
            </label>
            <input
              {...register('logoUrl', {
                maxLength: {
                  value: 500,
                  message: 'Logo URL must not exceed 500 characters',
                },
              })}
              type="url"
              className="input-field"
              placeholder="https://example.com/logo.png"
            />
            {errors.logoUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.logoUrl.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              {...register('notes', {
                maxLength: {
                  value: 1000,
                  message: 'Notes must not exceed 1000 characters',
                },
              })}
              rows={3}
              className="input-field"
              placeholder="Any additional information about your team..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registerTeamMutation.isLoading || !selectedTournament}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {registerTeamMutation.isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span>Create Team</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamCreateModal;