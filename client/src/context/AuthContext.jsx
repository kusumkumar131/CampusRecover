import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth persistence on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('campus_recover_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.success && response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log('No active session.');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (emailOrStudentId, password) => {
    try {
      const response = await authService.login({ emailOrStudentId, password });
      if (response.success && response.data.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || (error.message === 'Network Error'
          ? 'Cannot reach the server. Please try again.'
          : 'Login failed. Please verify credentials.')
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.data.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || (error.message === 'Network Error'
          ? 'Cannot reach the server. Please try again.'
          : 'Registration failed.')
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('campus_recover_token');
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
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
