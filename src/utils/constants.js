// Sport Types - phù hợp với backend enum
export const SPORT_TYPES = {
  FOOTBALL: 'FOOTBALL',
  BASKETBALL: 'BASKETBALL',
  VOLLEYBALL: 'VOLLEYBALL',
  BADMINTON: 'BADMINTON',
  TENNIS: 'TENNIS',
  PING_PONG: 'PING_PONG',
  GENERAL: 'GENERAL'
};

export const SPORT_TYPE_LABELS = {
  [SPORT_TYPES.FOOTBALL]: 'Bóng đá',
  [SPORT_TYPES.BASKETBALL]: 'Bóng rổ', 
  [SPORT_TYPES.VOLLEYBALL]: 'Bóng chuyền',
  [SPORT_TYPES.BADMINTON]: 'Cầu lông',
  [SPORT_TYPES.TENNIS]: 'Quần vợt',
  [SPORT_TYPES.PING_PONG]: 'Bóng bàn',
  [SPORT_TYPES.GENERAL]: 'Tổng hợp'
};

// Tournament Status - match với backend
export const TOURNAMENT_STATUS = {
  DRAFT: 'DRAFT',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const TOURNAMENT_STATUS_LABELS = {
  [TOURNAMENT_STATUS.DRAFT]: 'Bản nháp',
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: 'Mở đăng ký',
  [TOURNAMENT_STATUS.REGISTRATION_CLOSED]: 'Đóng đăng ký',
  [TOURNAMENT_STATUS.IN_PROGRESS]: 'Đang diễn ra',
  [TOURNAMENT_STATUS.COMPLETED]: 'Đã hoàn thành',
  [TOURNAMENT_STATUS.CANCELLED]: 'Đã hủy'
};

// Match Status - match với backend
export const MATCH_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  POSTPONED: 'POSTPONED'
};

export const MATCH_STATUS_LABELS = {
  [MATCH_STATUS.SCHEDULED]: 'Đã lên lịch',
  [MATCH_STATUS.IN_PROGRESS]: 'Đang diễn ra',
  [MATCH_STATUS.COMPLETED]: 'Đã hoàn thành',
  [MATCH_STATUS.CANCELLED]: 'Đã hủy',
  [MATCH_STATUS.POSTPONED]: 'Hoãn'
};

// Team Status - match với backend
export const TEAM_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  ELIMINATED: 'ELIMINATED'
};

export const TEAM_STATUS_LABELS = {
  [TEAM_STATUS.PENDING]: 'Chờ duyệt',
  [TEAM_STATUS.CONFIRMED]: 'Đã xác nhận',
  [TEAM_STATUS.REJECTED]: 'Bị từ chối',
  [TEAM_STATUS.ELIMINATED]: 'Bị loại'
};

// User Roles - match với backend
export const USER_ROLES = {
  USER: 'USER',
  ORGANIZER: 'ORGANIZER',
  ADMIN: 'ADMIN'
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.USER]: 'Người dùng',
  [USER_ROLES.ORGANIZER]: 'Tổ chức',
  [USER_ROLES.ADMIN]: 'Quản trị viên'
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// API endpoints paths
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    ACCOUNT: '/api/v1/auth/account',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh'
  },
  TOURNAMENTS: {
    BASE: '/api/tournaments',
    START: (id) => `/api/tournaments/${id}/start`,
    TEAMS: (id) => `/api/tournaments/${id}/teams`,
    MATCHES: (id) => `/api/tournaments/${id}/matches`,
    BRACKET: (id) => `/api/tournaments/${id}/bracket`,
    REGISTER: (id) => `/api/tournaments/${id}/register`,
    GENERATE_BRACKET: (id) => `/api/tournaments/${id}/generate-bracket`,
    START_KNOCKOUT: (id) => `/api/tournaments/${id}/start-knockout`,
    ADVANCE_ROUND: (id) => `/api/tournaments/${id}/advance-round`,
    COMPLETE: (id) => `/api/tournaments/${id}/complete`
  },
  TEAMS: {
    BASE: '/api/teams'
  },
  MATCHES: {
    BASE: '/api/matches',
    SCORE: (id) => `/api/matches/${id}/score`,
    STATUS: (id) => `/api/matches/${id}/status`
  },
  NEWS: {
    BASE: '/api/v1/news',
    UPLOADS: (id) => `/api/v1/news/uploads/${id}`,
    IMAGE: (imageName) => `/api/v1/news/image/${imageName}`
  }
};

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Theme colors (Tailwind classes)
export const THEME_COLORS = {
  PRIMARY: 'text-primary-600',
  SPORTS_ORANGE: 'text-sports-orange',
  SPORTS_GREEN: 'text-sports-green',
  SPORTS_PURPLE: 'text-sports-purple',
  SPORTS_PINK: 'text-sports-pink'
};

// Status color mapping cho UI
export const STATUS_COLORS = {
  // Tournament Status
  [TOURNAMENT_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: 'bg-blue-100 text-blue-800',
  [TOURNAMENT_STATUS.REGISTRATION_CLOSED]: 'bg-yellow-100 text-yellow-800',
  [TOURNAMENT_STATUS.IN_PROGRESS]: 'bg-green-100 text-green-800',
  [TOURNAMENT_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800',
  [TOURNAMENT_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  
  // Match Status
  [MATCH_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [MATCH_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [MATCH_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [MATCH_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
  [MATCH_STATUS.POSTPONED]: 'bg-orange-100 text-orange-800',
  
  // Team Status
  [TEAM_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [TEAM_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [TEAM_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [TEAM_STATUS.ELIMINATED]: 'bg-gray-100 text-gray-800'
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences'
};

// Query keys cho React Query
export const QUERY_KEYS = {
  TOURNAMENTS: 'tournaments',
  TOURNAMENT: 'tournament',
  TEAMS: 'teams',
  TEAM: 'team',
  MATCHES: 'matches',
  MATCH: 'match',
  NEWS: 'news',
  NEWS_ITEM: 'news-item',
  USER: 'user',
  BRACKET: 'bracket'
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: "yyyy-MM-dd'T'HH:mm",
  API: "yyyy-MM-dd'T'HH:mm:ss'Z'"
};

// Validation rules
export const VALIDATION_RULES = {
  TOURNAMENT_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  },
  TEAM_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 50
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

export default {
  SPORT_TYPES,
  SPORT_TYPE_LABELS,
  TOURNAMENT_STATUS,
  TOURNAMENT_STATUS_LABELS,
  MATCH_STATUS,
  MATCH_STATUS_LABELS,
  TEAM_STATUS,
  TEAM_STATUS_LABELS,
  USER_ROLES,
  USER_ROLE_LABELS,
  PAGINATION_DEFAULTS,
  FILE_UPLOAD,
  API_ENDPOINTS,
  TOAST_TYPES,
  THEME_COLORS,
  STATUS_COLORS,
  STORAGE_KEYS,
  QUERY_KEYS,
  DATE_FORMATS,
  VALIDATION_RULES
};
