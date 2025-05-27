import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { 
  Play, 
  Trophy, 
  ArrowRight, 
  CheckCircle, 
  Settings,
  Users,
  Target,
  Award,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { tournamentKnockoutService } from '../../services';
import toast from 'react-hot-toast';

const TournamentManagement = ({ tournament, onTournamentUpdate }) => {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate Bracket Mutation
  const generateBracketMutation = useMutation(
    () => {
      console.log('🎯 Generating bracket for tournament:', tournament.id);
      return tournamentKnockoutService.generateBracket(tournament.id, {
        matchType: 'KNOCKOUT',
        randomSeed: true
      });
    },
    {
      onSuccess: (response) => {
        console.log('✅ Bracket generated successfully:', response);
        toast.success('🎯 Bracket đã được tạo thành công!', {
          duration: 5000,
          icon: '🏆'
        });
        
        // Refresh tournament and bracket data
        queryClient.invalidateQueries(['tournament', tournament.id]);
        queryClient.invalidateQueries(['tournament-bracket', tournament.id]);
        queryClient.invalidateQueries(['tournament-matches', tournament.id]);
        
        onTournamentUpdate?.();
      },
      onError: (error) => {
        console.error('❌ Bracket generation failed:', error);
        const errorMessage = error.response?.data?.message || 'Không thể tạo bracket. Vui lòng thử lại.';
        toast.error(`❌ ${errorMessage}`, {
          duration: 6000
        });
      }
    }
  );

  // Start Tournament Mutation
  const startTournamentMutation = useMutation(
    () => {
      console.log('🚀 Starting knockout tournament:', tournament.id);
      return tournamentKnockoutService.startKnockout(tournament.id);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Tournament started successfully:', response);
        toast.success('🚀 Tournament đã bắt đầu!', {
          duration: 5000,
          icon: '🏁'
        });
        
        queryClient.invalidateQueries(['tournament', tournament.id]);
        onTournamentUpdate?.();
      },
      onError: (error) => {
        console.error('❌ Tournament start failed:', error);
        const errorMessage = error.response?.data?.message || 'Không thể bắt đầu tournament. Vui lòng thử lại.';
        toast.error(`❌ ${errorMessage}`, {
          duration: 6000
        });
      }
    }
  );

  // Advance Round Mutation
  const advanceRoundMutation = useMutation(
    () => {
      console.log('⏭️ Advancing to next round:', tournament.id);
      return tournamentKnockoutService.advanceRound(tournament.id);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Round advanced successfully:', response);
        toast.success('⏭️ Đã chuyển sang round tiếp theo!', {
          duration: 5000,
          icon: '🎯'
        });
        
        queryClient.invalidateQueries(['tournament', tournament.id]);
        queryClient.invalidateQueries(['tournament-bracket', tournament.id]);
        queryClient.invalidateQueries(['tournament-matches', tournament.id]);
        
        onTournamentUpdate?.();
      },
      onError: (error) => {
        console.error('❌ Round advance failed:', error);
        const errorMessage = error.response?.data?.message || 'Không thể chuyển round. Vui lòng hoàn thành tất cả matches.';
        toast.error(`❌ ${errorMessage}`, {
          duration: 6000
        });
      }
    }
  );

  // Complete Tournament Mutation
  const completeTournamentMutation = useMutation(
    () => {
      console.log('🏆 Completing tournament:', tournament.id);
      return tournamentKnockoutService.completeTournament(tournament.id);
    },
    {
      onSuccess: (response) => {
        console.log('✅ Tournament completed successfully:', response);
        toast.success('🏆 Tournament đã hoàn thành! Chúc mừng nhà vô địch!', {
          duration: 8000,
          icon: '👑'
        });
        
        queryClient.invalidateQueries(['tournament', tournament.id]);
        onTournamentUpdate?.();
      },
      onError: (error) => {
        console.error('❌ Tournament completion failed:', error);
        const errorMessage = error.response?.data?.message || 'Không thể hoàn thành tournament. Vui lòng thử lại.';
        toast.error(`❌ ${errorMessage}`, {
          duration: 6000
        });
      }
    }
  );

  const handleGenerateBracket = () => {
    if (window.confirm('Tạo bracket sẽ random shuffle tất cả teams. Bạn có chắc chắn?')) {
      generateBracketMutation.mutate();
    }
  };

  const handleStartTournament = () => {
    if (window.confirm('Bắt đầu tournament? Teams sẽ không thể đăng ký thêm.')) {
      startTournamentMutation.mutate();
    }
  };

  const handleAdvanceRound = () => {
    if (window.confirm('Chuyển sang round tiếp theo? Đảm bảo tất cả matches đã hoàn thành.')) {
      advanceRoundMutation.mutate();
    }
  };

  const handleCompleteTournament = () => {
    if (window.confirm('Hoàn thành tournament và công bố nhà vô địch?')) {
      completeTournamentMutation.mutate();
    }
  };

  const isAnyMutationLoading = 
    generateBracketMutation.isLoading || 
    startTournamentMutation.isLoading || 
    advanceRoundMutation.isLoading || 
    completeTournamentMutation.isLoading;

  // Get tournament status for conditional rendering
  const status = tournament.status;
  const canGenerateBracket = status === 'REGISTRATION' || status === 'UPCOMING';
  const canStartTournament = status === 'READY';
  const canAdvanceRound = status === 'ONGOING';
  const canCompleteTournament = status === 'ONGOING';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Tournament Management</h2>
            <p className="text-blue-100">Quản lý và điều khiển tournament knockout</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <Settings className="h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Tournament Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Tournament Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status === 'REGISTRATION' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Users className="h-4 w-4 mr-1" />
              Registration
            </div>
          </div>
          
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status === 'READY' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Target className="h-4 w-4 mr-1" />
              Ready
            </div>
          </div>
          
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status === 'ONGOING' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Clock className="h-4 w-4 mr-1" />
              Ongoing
            </div>
          </div>
          
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <Award className="h-4 w-4 mr-1" />
              Completed
            </div>
          </div>
        </div>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Generate Bracket */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                1. Generate Bracket
              </h3>
              <p className="text-sm text-gray-600">
                Tạo bracket knockout từ teams đã đăng ký. Teams sẽ được random shuffle.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleGenerateBracket}
            disabled={!canGenerateBracket || isAnyMutationLoading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              canGenerateBracket && !isAnyMutationLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {generateBracketMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang tạo bracket...</span>
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                <span>Generate Bracket</span>
              </>
            )}
          </button>
          
          {!canGenerateBracket && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Chỉ có thể tạo bracket khi tournament ở trạng thái Registration
            </div>
          )}
        </div>

        {/* Start Tournament */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Play className="h-5 w-5 mr-2 text-green-500" />
                2. Start Tournament
              </h3>
              <p className="text-sm text-gray-600">
                Bắt đầu tournament knockout. Teams sẽ không thể đăng ký thêm.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleStartTournament}
            disabled={!canStartTournament || isAnyMutationLoading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              canStartTournament && !isAnyMutationLoading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {startTournamentMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang bắt đầu...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Start Tournament</span>
              </>
            )}
          </button>
          
          {!canStartTournament && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Cần tạo bracket trước khi bắt đầu tournament
            </div>
          )}
        </div>

        {/* Advance Round */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-orange-500" />
                3. Advance Round
              </h3>
              <p className="text-sm text-gray-600">
                Chuyển sang round tiếp theo. Tạo matches mới từ winners của round hiện tại.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAdvanceRound}
            disabled={!canAdvanceRound || isAnyMutationLoading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              canAdvanceRound && !isAnyMutationLoading
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {advanceRoundMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang chuyển round...</span>
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4" />
                <span>Advance Round</span>
              </>
            )}
          </button>
          
          {!canAdvanceRound && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Chỉ có thể advance round khi tournament đang diễn ra
            </div>
          )}
        </div>

        {/* Complete Tournament */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-purple-500" />
                4. Complete Tournament
              </h3>
              <p className="text-sm text-gray-600">
                Hoàn thành tournament và công bố nhà vô địch chính thức.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCompleteTournament}
            disabled={!canCompleteTournament || isAnyMutationLoading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              canCompleteTournament && !isAnyMutationLoading
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {completeTournamentMutation.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang hoàn thành...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Complete Tournament</span>
              </>
            )}
          </button>
          
          {!canCompleteTournament && (
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Chỉ có thể hoàn thành khi tournament đang diễn ra
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 Hướng dẫn sử dụng</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>1. Generate Bracket:</strong> Tạo bracket knockout từ teams đã đăng ký (random shuffle)</p>
          <p><strong>2. Start Tournament:</strong> Bắt đầu tournament chính thức (không thể đăng ký thêm teams)</p>
          <p><strong>3. Advance Round:</strong> Hoàn thành matches → chuyển winners sang round tiếp theo</p>
          <p><strong>4. Complete Tournament:</strong> Kết thúc tournament và công bố nhà vô địch</p>
        </div>
      </div>
    </div>
  );
};

export default TournamentManagement;
