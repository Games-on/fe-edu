// Environment and localStorage management utility

export const ENV_KEY = 'app_environment';
export const TOKEN_KEY = 'accessToken';
export const BUILD_TIMESTAMP_KEY = 'build_timestamp';

// Get current environment
export const getCurrentEnv = () => {
  return process.env.NODE_ENV || 'development';
};

// Get build timestamp (different for each build)
export const getBuildTimestamp = () => {
  // Use build time or app version to detect new builds
  return process.env.REACT_APP_BUILD_TIME || Date.now().toString();
};

// Check if this is a fresh build/deployment
export const isFreshBuild = () => {
  const currentTimestamp = getBuildTimestamp();
  const storedTimestamp = localStorage.getItem(BUILD_TIMESTAMP_KEY);
  
  console.log('🔍 Build check:', { current: currentTimestamp, stored: storedTimestamp });
  
  return !storedTimestamp || storedTimestamp !== currentTimestamp;
};

// Check if environment changed since last run
export const hasEnvironmentChanged = () => {
  const currentEnv = getCurrentEnv();
  const storedEnv = localStorage.getItem(ENV_KEY);
  
  console.log('🔍 Environment check:', { current: currentEnv, stored: storedEnv });
  
  return storedEnv && storedEnv !== currentEnv;
};

// Force clear localStorage for production builds
export const forceProductionClear = () => {
  const currentEnv = getCurrentEnv();
  
  if (currentEnv === 'production') {
    console.log('🏭 Production environment detected, clearing authentication...');
    
    // Always clear auth data in production for security
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Clear any auth-related keys
    const authKeys = ['token', 'auth', 'session', 'login', 'admin'];
    Object.keys(localStorage).forEach(key => {
      if (authKeys.some(authKey => key.toLowerCase().includes(authKey))) {
        localStorage.removeItem(key);
        console.log(`🗑️ [PRODUCTION] Removed: ${key}`);
      }
    });
    
    console.log('✅ Production authentication cleared');
    return true;
  }
  
  return false;
};

// Clear localStorage if environment changed
export const clearLocalStorageOnEnvChange = () => {
  if (hasEnvironmentChanged()) {
    console.log('🧹 Environment changed, clearing localStorage...');
    
    // Clear auth-related data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    
    // Clear any other app-specific data that might be invalid
    const keysToKeep = ['theme', 'language', 'preferences']; // Keep user preferences
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key) && key !== ENV_KEY) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
      }
    });
    
    console.log('✅ localStorage cleared for environment change');
  }
  
  // Update stored environment
  const currentEnv = getCurrentEnv();
  localStorage.setItem(ENV_KEY, currentEnv);
  console.log('📝 Environment stored:', currentEnv);
};

// Check if token exists and is valid format
export const isValidToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic token format validation
  if (token.length < 10) {
    return false;
  }
  
  // Check if it looks like a JWT token
  if (token.includes('.') && token.split('.').length === 3) {
    return true;
  }
  
  // Check if it's a basic token format
  if (token.length > 20 && /^[A-Za-z0-9+/=.-]+$/.test(token)) {
    return true;
  }
  
  return false;
};

// Clear invalid tokens
export const clearInvalidTokens = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  if (token && !isValidToken(token)) {
    console.log('🧹 Invalid token format detected, removing...');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user');
    return true;
  }
  
  return false;
};

// Initialize localStorage management
export const initializeLocalStorage = () => {
  console.log('🚀 Initializing localStorage management...');
  
  // 🔐 COMMENTED OUT: Auto-clear authentication (for testing)
  // console.log('🧹 Clearing authentication for fresh start...');
  // localStorage.removeItem(TOKEN_KEY);
  // localStorage.removeItem('user');
  // localStorage.removeItem('refreshToken');
  
  // Clear any other auth-related data
  // const authKeys = ['token', 'auth', 'session', 'login', 'admin'];
  // Object.keys(localStorage).forEach(key => {
  //   if (authKeys.some(authKey => key.toLowerCase().includes(authKey))) {
  //     localStorage.removeItem(key);
  //   }
  // });
  
  // Update build timestamp
  const currentTimestamp = getBuildTimestamp();
  localStorage.setItem(BUILD_TIMESTAMP_KEY, currentTimestamp);
  
  console.log('✅ LocalStorage management initialized - auth tokens preserved');
};