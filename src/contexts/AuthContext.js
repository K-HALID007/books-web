"use client";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '@/lib/api';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        // Don't set user/token/isAuthenticated for registration
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // Start with loading true
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');
      
      if (token && user) {
        try {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              token,
              user: JSON.parse(user),
            },
          });
        } catch (error) {
          // If parsing fails, clear invalid data
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        // No token found, set loading to false
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authAPI.login(credentials);
      
      // Store in sessionStorage (clears when browser closes)
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify({
        id: response.id,
        name: response.name,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        phone: response.phone,
        dateOfBirth: response.dateOfBirth,
        gender: response.gender,
        country: response.country,
        city: response.city,
        favoriteGenres: response.favoriteGenres,
        bio: response.bio,
      }));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: response.token,
          user: {
            id: response.id,
            name: response.name,
            firstName: response.firstName,
            lastName: response.lastName,
            email: response.email,
            phone: response.phone,
            dateOfBirth: response.dateOfBirth,
            gender: response.gender,
            country: response.country,
            city: response.city,
            favoriteGenres: response.favoriteGenres,
            bio: response.bio,
          },
        },
      });
      
      return response;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      });
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      const response = await authAPI.register(userData);
      
      // Don't automatically log in after registration
      // Just clear the loading state and any errors
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          token: null,
          user: null,
        },
      });
      
      // Set authentication state to false after successful registration
      dispatch({ type: 'LOGOUT' });
      
      return response;
    } catch (error) {
      dispatch({
        type: 'REGISTER_FAILURE',
        payload: error.message,
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    dispatch({ type: 'LOGIN_START' }); // Reuse loading state
    
    try {
      const response = await authAPI.updateProfile(profileData);
      
      // Update sessionStorage with new user data
      sessionStorage.setItem('user', JSON.stringify(response));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: state.token,
          user: response,
        },
      });
      
      return response;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message,
      });
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;