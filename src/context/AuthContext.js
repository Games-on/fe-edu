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
      const response = await authService.getAccount();
      console.log('Account response:', response);
      
      // Backend returns: { success: true, message: "...", data: { id, email, name, role } }
      if (response && response.success && response.data) {
        console.log('✅ Auth check successful, user data:', response.data);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data },
        });
      } else {
        console.log('❌ Invalid response format:', response);
        localStorage.removeItem('accessToken');
        dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid token response' });
      }
    } catch (error) {
      console.log('❌ Auth check failed:', error);
      // Don't remove token immediately, might be network issue
      if (error.response?.status === 401) {
        console.log('401 error, removing token');
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
      return response;
    } catch (error) {
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
      localStorage.removeItem('accessToken');
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