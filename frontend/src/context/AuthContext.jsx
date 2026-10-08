import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('devtrack_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('devtrack_token'));
  const [loading, setLoading] = useState(!user);

  // Initialize and load current user profile from backend
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('devtrack_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response?.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('devtrack_user', JSON.stringify(response.data.user));
      } else {
        throw new Error('User profile not returned');
      }
    } catch (err) {
      console.error('Failed to authenticate stored token:', err);
      // Only clear credentials if server explicitly rejected with 401 Unauthorized
      if (err.response?.status === 401) {
        localStorage.removeItem('devtrack_token');
        localStorage.removeItem('devtrack_user');
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    if (response?.data?.token && response?.data?.user) {
      localStorage.setItem('devtrack_token', response.data.token);
      localStorage.setItem('devtrack_user', JSON.stringify(response.data.user));
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response?.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    if (response?.data?.token && response?.data?.user) {
      localStorage.setItem('devtrack_token', response.data.token);
      localStorage.setItem('devtrack_user', JSON.stringify(response.data.user));
      setToken(response.data.token);
      setUser(response.data.user);
      return response.data.user;
    }
    throw new Error(response?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('devtrack_token');
    localStorage.removeItem('devtrack_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      localStorage.setItem('devtrack_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser: fetchCurrentUser,
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'project_manager' || user?.role === 'admin',
        isDeveloper: user?.role === 'developer',
      }}
    >
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
