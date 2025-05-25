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
} from '../../utils/constants.safe';
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
      sportType: SPORT_TYPES.FOOTBALL,
      maxTeams: 16,
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      location: '',
      rules: '',
      prizeInfo: '',
      contactInfo: '',
      status: TOURNAMENT_STATUS.DRAFT
    },
    mode: 'onChange'
  });

  const createTournamentMutation = useMutation(
    (tournamentData) => tournamentService.createTournament(tournamentData),
    {
      onSuccess: (response) => {
        toast.success('Tao giai dau thanh cong!');
        queryClient.invalidateQueries(QUERY_KEYS.TOURNAMENTS);
        onSuccess?.(response.data);
        handleClose();
      },
      onError: (error) => {
        toast.error(error.errorMessage || 'Co loi xay ra khi tao giai dau');
        setIsSubmitting(false);
      }
    }
  );

  const watchStartDate = watch('startDate');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const regDeadline = new Date(data.registrationDeadline);
      
      if (regDeadline >= startDate) {
        toast.error('Han dang ky phai truoc ngay bat dau giai dau');
        setIsSubmitting(false);
        return;
      }
      
      if (startDate >= endDate) {
        toast.error('Ngay ket thuc phai sau ngay bat dau');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare tournament data
      const tournamentData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        registrationDeadline: new Date(data.registrationDeadline).toISOString(),
        maxTeams: parseInt(data.maxTeams),
        currentTeams: 0
      };
      
      console.log('Creating tournament with data:', tournamentData);
      await createTournamentMutation.mutateAsync(tournamentData);
    } catch (error) {
      console.error('Tournament creation error:', error);
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
              <h2 className="text-xl font-bold text-gray-900">Tao Giai Dau Moi</h2>
              <p className="text-sm text-gray-600">Dien thong tin de tao giai dau</p>
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
                  Ten giai dau *
                </label>
                <input
                  type="text"
                  {...register('name', {
                    required: 'Ten giai dau la bat buoc',
                    minLength: {
                      value: VALIDATION_RULES.TOURNAMENT_NAME.MIN_LENGTH,
                      message: `Ten giai dau phai co it nhat ${VALIDATION_RULES.TOURNAMENT_NAME.MIN_LENGTH} ky tu`
                    },
                    maxLength: {
                      value: VALIDATION_RULES.TOURNAMENT_NAME.MAX_LENGTH,
                      message: `Ten giai dau khong duoc vuot qua ${VALIDATION_RULES.TOURNAMENT_NAME.MAX_LENGTH} ky tu`
                    }
                  })}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Nhap ten giai dau"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Sport Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mon the thao *
                </label>
                <select
                  {...register('sportType', { required: 'Vui long chon mon the thao' })}
                  className={`input-field ${errors.sportType ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                >
                  {Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.sportType && (
                  <p className="mt-1 text-sm text-red-600">{errors.sportType.message}</p>
                )}
              </div>

              {/* Max Teams */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  So doi toi da *
                </label>
                <select
                  {...register('maxTeams', { 
                    required: 'Vui long chon so doi toi da',
                    min: { value: 4, message: 'It nhat 4 doi' },
                    max: { value: 64, message: 'Toi da 64 doi' }
                  })}
                  className={`input-field ${errors.maxTeams ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                >
                  {[4, 8, 16, 32, 64].map(num => (
                    <option key={num} value={num}>{num} doi</option>
                  ))}
                </select>
                {errors.maxTeams && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxTeams.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mo ta giai dau *
              </label>
              <textarea
                {...register('description', {
                  required: 'Mo ta giai dau la bat buoc',
                  minLength: { value: 10, message: 'Mo ta phai co it nhat 10 ky tu' }
                })}
                rows={3}
                className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Mo ta chi tiet ve giai dau"
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
                  Ngay bat dau *
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate', { required: 'Ngay bat dau la bat buoc' })}
                  min={minStartDate}
                  className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngay ket thuc *
                </label>
                <input
                  type="datetime-local"
                  {...register('endDate', { required: 'Ngay ket thuc la bat buoc' })}
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
                  Han dang ky *
                </label>
                <input
                  type="datetime-local"
                  {...register('registrationDeadline', { required: 'Han dang ky la bat buoc' })}
                  min={formatDateTimeForInput(today)}
                  max={maxRegDeadline}
                  className={`input-field ${errors.registrationDeadline ? 'border-red-500' : ''}`}
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
                Dia diem *
              </label>
              <input
                type="text"
                {...register('location', { required: 'Dia diem la bat buoc' })}
                className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                placeholder="Nhap dia diem to chuc"
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
                  Luat thi dau
                </label>
                <textarea
                  {...register('rules')}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Mo ta luat thi dau va quy dinh"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thong tin giai thuong
                </label>
                <textarea
                  {...register('prizeInfo')}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Mo ta giai thuong va phan thuong"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thong tin lien he *
              </label>
              <input
                type="text"
                {...register('contactInfo', { required: 'Thong tin lien he la bat buoc' })}
                className={`input-field ${errors.contactInfo ? 'border-red-500' : ''}`}
                placeholder="Email hoac so dien thoai lien he"
                disabled={isSubmitting}
              />
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
              )}
            </div>

            {/* Tournament Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trang thai ban dau
              </label>
              <select
                {...register('status')}
                className="input-field"
                disabled={isSubmitting}
              >
                <option value={TOURNAMENT_STATUS.DRAFT}>Ban nhap</option>
                <option value={TOURNAMENT_STATUS.REGISTRATION_OPEN}>Mo dang ky</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Huy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Dang tao...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Tao giai dau
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
