// Safe constants without Unicode characters

// Sport Types
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
  [SPORT_TYPES.FOOTBALL]: 'Bong da',
  [SPORT_TYPES.BASKETBALL]: 'Bong ro', 
  [SPORT_TYPES.VOLLEYBALL]: 'Bong chuyen',
  [SPORT_TYPES.BADMINTON]: 'Cau long',
  [SPORT_TYPES.TENNIS]: 'Quan vot',
  [SPORT_TYPES.PING_PONG]: 'Bong ban',
  [SPORT_TYPES.GENERAL]: 'Tong hop'
};

// Tournament Status
export const TOURNAMENT_STATUS = {
  DRAFT: 'DRAFT',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const TOURNAMENT_STATUS_LABELS = {
  [TOURNAMENT_STATUS.DRAFT]: 'Ban nhap',
  [TOURNAMENT_STATUS.REGISTRATION_OPEN]: 'Mo dang ky',
  [TOURNAMENT_STATUS.REGISTRATION_CLOSED]: 'Dong dang ky',
  [TOURNAMENT_STATUS.IN_PROGRESS]: 'Dang dien ra',
  [TOURNAMENT_STATUS.COMPLETED]: 'Da hoan thanh',
  [TOURNAMENT_STATUS.CANCELLED]: 'Da huy'
};

// Match Status
export const MATCH_STATUS = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  POSTPONED: 'POSTPONED'
};

export const MATCH_STATUS_LABELS = {
  [MATCH_STATUS.SCHEDULED]: 'Da len lich',
  [MATCH_STATUS.IN_PROGRESS]: 'Dang dien ra',
  [MATCH_STATUS.COMPLETED]: 'Da hoan thanh',
  [MATCH_STATUS.CANCELLED]: 'Da huy',
  [MATCH_STATUS.POSTPONED]: 'Hoan'
};

// Team Status
export const TEAM_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  ELIMINATED: 'ELIMINATED'
};

export const TEAM_STATUS_LABELS = {
  [TEAM_STATUS.PENDING]: 'Cho duyet',
  [TEAM_STATUS.CONFIRMED]: 'Da xac nhan',
  [TEAM_STATUS.REJECTED]: 'Bi tu choi',
  [TEAM_STATUS.ELIMINATED]: 'Bi loai'
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  ORGANIZER: 'ORGANIZER', 
  ADMIN: 'ADMIN'
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.STUDENT]: 'Sinh vien',
  [USER_ROLES.ORGANIZER]: 'To chuc',
  [USER_ROLES.ADMIN]: 'Quan tri vien'
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

// Query keys for React Query
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

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences'
};

// Status color mapping for UI
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

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: "yyyy-MM-dd'T'HH:mm",
  API: "yyyy-MM-dd'T'HH:mm:ss'Z'"
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
  QUERY_KEYS,
  VALIDATION_RULES,
  STORAGE_KEYS,
  STATUS_COLORS,
  DATE_FORMATS
};
