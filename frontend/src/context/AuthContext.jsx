// Frontend/src/context/AuthContext.jsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = api.getToken();
      const savedUser = api.getUser();
      
      if (token && savedUser) {
        // Verify token is still valid
        try {
          const response = await api.getCurrentUser();
          if (response.status === 'success') {
            setUser(response.data || response.user);
          } else {
            // Token invalid, clear auth
            api.clearAuth();
            setUser(null);
          }
        } catch (err) {
          // Token invalid, clear auth
          api.clearAuth();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      api.clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.login(username, password);
      
      console.log('Login response:', response);
      
      if (response.status === 'success' || response.token) {
        const userData = response.data?.user || response.user;
        
        if (userData) {
          setUser(userData);
          return { 
            success: true, 
            user: userData 
          };
        } else {
          throw new Error('No user data received');
        }
      }
      
      return { 
        success: false, 
        message: response.message || 'Đăng nhập thất bại' 
      };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { 
        success: false, 
        message: error.message || 'Đăng nhập thất bại' 
      };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.register(userData);
      
      if (response.status === 'success') {
        const user = response.data?.user || response.user;
        setUser(user);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.message 
      };
    } catch (error) {
      setError(error.message);
      return { 
        success: false, 
        message: error.message 
      };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await api.forgotPassword(email);
      return { 
        success: true, 
        message: response.message 
      };
    } catch (error) {
      setError(error.message);
      return { 
        success: false, 
        message: error.message 
      };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;