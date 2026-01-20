/**
 * Refactored AuthContext
 * Features:
 * - Token auto-refresh
 * - Better error handling
 * - Persistent login state
 * - Auto logout on token expiry
 * - Role-based storage
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import { showError, showSuccess } from '../utils/errorHandler';

const AuthContext = createContext(null);

// Token expiry check (JWT decode)
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
};

// Get role from token
const getRoleFromToken = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (error) {
    return null;
  }
};

// Storage key helpers
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  REFRESH_TOKEN: 'auth_refresh_token',
};

// Role-based prefix (for backward compatibility)
const getScopePrefix = (role) => {
  if (role === 'ADMIN') return 'admin_';
  if (role === 'ORGANIZER') return 'org_';
  return 'user_';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (savedToken && savedUser) {
          // Check if token is expired
          if (isTokenExpired(savedToken)) {
            // Try to refresh token
            const refreshed = await refreshAuthToken();
            if (!refreshed) {
              // Clear expired session
              clearAuth();
            }
          } else {
            // Token is valid, restore session
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Auto token refresh before expiry
   */
  useEffect(() => {
    if (!token) return;

    // Check token expiry every minute
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        refreshAuthToken();
      }
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [token]);

  /**
   * Login user
   */
  const login = useCallback((userData, userToken) => {
    const role = getRoleFromToken(userToken);
    const prefix = getScopePrefix(role);

    // Set state
    setUser(userData);
    setToken(userToken);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.TOKEN, userToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    // Backward compatibility - also save with role prefix
    localStorage.setItem(`${prefix}token`, userToken);
    localStorage.setItem(`${prefix}user`, JSON.stringify(userData));

    setShowLoginModal(false);
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    const role = user?.role;
    const prefix = getScopePrefix(role);

    // Clear state
    clearAuth();

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

    // Backward compatibility
    localStorage.removeItem(`${prefix}token`);
    localStorage.removeItem(`${prefix}user`);

    showSuccess('Đăng xuất thành công');
  }, [user]);

  /**
   * Refresh token
   */
  const refreshAuthToken = useCallback(async () => {
    try {
      const response = await authApi.refreshToken();
      
      if (response.success && response.token) {
        // Update token
        setToken(response.token);
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);

        // Update user if provided
        if (response.user) {
          setUser(response.user);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        }

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }, []);

  /**
   * Update user profile
   */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

    // Backward compatibility
    const role = updatedUser.role;
    const prefix = getScopePrefix(role);
    localStorage.setItem(`${prefix}user`, JSON.stringify(updatedUser));
  }, []);

  /**
   * Clear auth state
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  /**
   * Trigger login modal
   */
  const triggerLogin = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  /**
   * Check if user has required role
   */
  const hasRole = useCallback((requiredRole) => {
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  }, [user]);

  const value = {
    // State
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    showLoginModal,

    // Actions
    login,
    logout,
    updateUser,
    refreshAuthToken,
    triggerLogin,
    setShowLoginModal,

    // Utilities
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

export default AuthContext;
