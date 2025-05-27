import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { X, Users, Mail, Palette, FileText, Image, Trophy } from 'lucide-react';
import { teamService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TeamRegistrationModal = ({ isOpen, onClose, tournament, onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    teamName: '',
    teamColor: '#3B82F6',
    memberCount: 1,
    contactInfo: user?.email || '',
    logoUrl: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const registrationMutation = useMutation(
    (registrationData) => {
      console.log('🚀 Calling teamService.registerTeam with data:', registrationData);
      console.log('🎯 Tournament ID:', tournament.id);
      console.log('🔗 Full URL will be:', `http://localhost:8080/api/tournaments/${tournament.id}/register`);
      return teamService.registerTeam(tournament.id, registrationData);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Team registration successful:', response);
        
        // Show detailed success message
        toast.success(
          `🎉 Đăng ký thành công!\n` +
          `Đội "${formData.teamName}" đã được đăng ký vào giải đấu "${tournament.name}".\n` +
          `Chúc bạn thi đấu thành công!`,
          {
            duration: 6000,
            style: {
              background: '#10B981',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            },
            icon: '🏆',
          }
        );
        
        // Invalidate related queries to refresh data
        queryClient.invalidateQueries(['tournament', tournament.id]);
        queryClient.invalidateQueries(['tournament-teams', tournament.id]);
        
        onSuccess?.(response);
        handleClose();
      },
      onError: (error) => {
        console.error('❌ Team registration failed:', error);
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          stack: error.stack
        });
        
        // Extract error message with fallbacks
        let errorMessage = 'Có lỗi xảy ra khi đăng ký team';
        
        if (error.response?.status === 500) {
          errorMessage = 'Lỗi server (500). Vui lòng kiểm tra logs backend và thử lại.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Bạn cần đăng nhập để đăng ký team.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Bạn không có quyền đăng ký team cho giải đấu này.';
        } else if (error.response?.status === 400) {
          errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Tên team là bắt buộc';
    } else if (formData.teamName.length < 3) {
      newErrors.teamName = 'Tên team phải có ít nhất 3 ký tự';
    }

    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'Thông tin liên hệ là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo)) {
      newErrors.contactInfo = 'Email không hợp lệ';
    }

    if (formData.memberCount < 1) {
      newErrors.memberCount = 'Số thành viên phải lớn hơn 0';
    } else if (formData.memberCount > 20) {
      newErrors.memberCount = 'Số thành viên không được vượt quá 20';
    }

    if (formData.logoUrl && !/^https?:\/\/.+/.test(formData.logoUrl)) {
      newErrors.logoUrl = 'URL logo không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const registrationData = {
      teamName: formData.teamName.trim(),
      teamColor: formData.teamColor,
      memberCount: parseInt(formData.memberCount),
      contactInfo: formData.contactInfo.trim(),
      logoUrl: formData.logoUrl.trim() || null,
      notes: formData.notes.trim() || null
    };

    console.log('🚀 Submitting team registration:', registrationData);
    registrationMutation.mutate(registrationData);
  };

  const handleClose = () => {
    if (!registrationMutation.isLoading) {
      setFormData({
        teamName: '',
        teamColor: '#3B82F6',
        memberCount: 1,
        contactInfo: user?.email || '',
        logoUrl: '',
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Đăng ký tham gia giải đấu</h2>
              <p className="text-sm text-gray-600">{tournament.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={registrationMutation.isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đội <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.teamName ? 'border-red-500' : ''
                  }`}
                  placeholder="Nhập tên đội của bạn"
                  disabled={registrationMutation.isLoading}
                />
              </div>
              {errors.teamName && (
                <p className="mt-1 text-sm text-red-600">{errors.teamName}</p>
              )}
            </div>

            {/* Team Color & Member Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu đội
                </label>
                <div className="relative">
                  <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="color"
                    name="teamColor"
                    value={formData.teamColor}
                    onChange={handleInputChange}
                    className="pl-10 w-full h-10 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={registrationMutation.isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số thành viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="memberCount"
                  value={formData.memberCount}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.memberCount ? 'border-red-500' : ''
                  }`}
                  disabled={registrationMutation.isLoading}
                />
                {errors.memberCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.memberCount}</p>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email liên hệ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contactInfo ? 'border-red-500' : ''
                  }`}
                  placeholder="email@example.com"
                  disabled={registrationMutation.isLoading}
                />
              </div>
              {errors.contactInfo && (
                <p className="mt-1 text-sm text-red-600">{errors.contactInfo}</p>
              )}
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Logo đội (tuỳ chọn)
              </label>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  className={`pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.logoUrl ? 'border-red-500' : ''
                  }`}
                  placeholder="https://example.com/logo.png"
                  disabled={registrationMutation.isLoading}
                />
              </div>
              {errors.logoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.logoUrl}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú (tuỳ chọn)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Kinh nghiệm, mục tiêu, hoặc thông tin thêm về đội..."
                  disabled={registrationMutation.isLoading}
                />
              </div>
            </div>

            {/* Tournament Info Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Thông tin giải đấu</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Tên:</strong> {tournament.name}</p>
                <p><strong>Thể loại:</strong> {tournament.sportType || 'Tổng hợp'}</p>
                <p><strong>Số đội tối đa:</strong> {tournament.maxTeams}</p>
                <p><strong>Đã đăng ký:</strong> {tournament.currentTeams || 0} đội</p>
                {tournament.startDate && (
                  <p><strong>Ngày bắt đầu:</strong> {new Date(tournament.startDate).toLocaleDateString('vi-VN')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={registrationMutation.isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={registrationMutation.isLoading}
            >
              {registrationMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang đăng ký...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  Đăng ký tham gia
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamRegistrationModal;
