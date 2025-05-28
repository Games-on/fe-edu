import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Just check auth state without any force clearing
    // localStorage is already cleared by localStorageManager
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    console.log('Checking auth with token:', token ? 'Token exists' : 'No token');
    
    if (!token) {
      console.log('No token found, setting loading to false');
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      // Validate token format first
      if (typeof token !== 'string' || token.length < 10) {
        console.log('❌ Invalid token format, removing');
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid token format' });
        return;
      }

      const response = await authService.getAccount();
      console.log('Account response:', response);
      
      // Handle both wrapped and unwrapped response formats
      let userData = null;
      
      if (response && response.success && response.data) {
        // Wrapped format: { success: true, data: { id, email, name, role } }
        userData = response.data;
        console.log('✅ Wrapped format detected, user data:', userData);
      } else if (response && response.id && response.email) {
        // Direct format: { id, email, name, role } (already unwrapped by API client)
        userData = response;
        console.log('✅ Direct format detected, user data:', userData);
      } else {
        console.log('❌ Invalid response format:', response);
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid token response' });
        return;
      }
      
      // Additional validation for user data
      if (!userData.id || !userData.email) {
        console.log('❌ Incomplete user data, removing token');
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Incomplete user data' });
        return;
      }
      
      console.log('✅ Auth check successful, user data:', userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: userData },
      });
    } catch (error) {
      console.log('❌ Auth check failed:', error);
      
      // Clear token for any authentication errors
      if (error.response?.status === 401 || 
          error.response?.status === 403 ||
          error.message?.includes('token') ||
          error.message?.includes('unauthorized')) {
        console.log('Authentication error, removing token');
        localStorage.removeItem('accessToken');
      }
      
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.login(credentials);
      console.log('=== LOGIN RESPONSE DEBUG ===');
      console.log('Full response:', response);
      console.log('response.success:', response?.success);
      console.log('response.data:', response?.data);
      console.log('response.data.accessToken:', response?.data?.accessToken);
      console.log('response.data.user:', response?.data?.user);
      console.log('Response keys:', Object.keys(response || {}));
      if (response?.data) {
        console.log('Data keys:', Object.keys(response.data || {}));
      }
      
      // Backend returns: { success: true, message: "...", data: { access_token: "...", user: {...} } }
      let accessToken, user;
      
      if (response && response.success && response.data) {
        // Standard backend format - try both field names
        accessToken = response.data.accessToken || response.data.access_token;
        user = response.data.user;
        console.log('Method 1 - Extracted accessToken:', accessToken ? 'Token received' : 'No token');
        console.log('Method 1 - Extracted user:', user);
      } else if (response && response.data && (response.data.accessToken || response.data.access_token)) {
        // Alternative format: { data: { accessToken/access_token, user } }
        accessToken = response.data.accessToken || response.data.access_token;
        user = response.data.user;
        console.log('Method 2 - Extracted accessToken:', accessToken ? 'Token received' : 'No token');
      } else if (response && (response.accessToken || response.access_token)) {
        // Direct format: { accessToken/access_token, user }
        accessToken = response.accessToken || response.access_token;
        user = response.user;
        console.log('Method 3 - Extracted accessToken:', accessToken ? 'Token received' : 'No token');
      } else {
        console.error('Invalid login response format:', response);
        throw new Error('Invalid login response format');
      }
      
      if (!accessToken) {
        console.error('❌ No access token found in response');
        console.error('Response structure:', JSON.stringify(response, null, 2));
        throw new Error('No access token received');
      }
      
      if (!user) {
        console.error('No user data found in response');
        throw new Error('No user data received');
      }
      
      console.log('✅ Storing token and user data...');
      localStorage.setItem('accessToken', accessToken);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user },
      });
      
      console.log('✅ Login successful, user authenticated');
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response);
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.register(userData);
      console.log('✅ Registration successful:', response);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      dispatch({ type: 'AUTH_FAILURE', payload: error.response?.data?.message || error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Complete cleanup
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      // Clear any other auth-related data
      const authKeys = ['token', 'auth', 'session', 'login'];
      Object.keys(localStorage).forEach(key => {
        if (authKeys.some(authKey => key.toLowerCase().includes(authKey))) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('✅ Complete logout and localStorage cleanup');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};