/**
 * Unified API Client with Axios
 * Features: Request/Response interceptors, Token management, Error handling
 */

import axios from 'axios';

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v2';

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    
    // Return only data
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`❌ API Error [${status}]:`, data);
      
      // Handle 401 Unauthorized
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Try to refresh token
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Retry original request
          return apiClient(originalRequest);
        } else {
          // Logout user
          handleLogout();
          return Promise.reject(createError('SESSION_EXPIRED', 'Your session has expired. Please login again.'));
        }
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        return Promise.reject(createError('FORBIDDEN', data.error?.message || 'You do not have permission to perform this action.'));
      }
      
      // Handle 404 Not Found
      if (status === 404) {
        return Promise.reject(createError('NOT_FOUND', data.error?.message || 'Resource not found.'));
      }
      
      // Handle 422 Validation Error
      if (status === 422 || status === 400) {
        const validationErrors = data.error?.errors || {};
        return Promise.reject(createError('VALIDATION_ERROR', data.error?.message || 'Validation failed.', validationErrors));
      }
      
      // Handle 500 Server Error
      if (status >= 500) {
        return Promise.reject(createError('SERVER_ERROR', 'Server error occurred. Please try again later.'));
      }
      
      // Handle other errors
      return Promise.reject(createError('API_ERROR', data.error?.message || data.message || 'An error occurred.'));
      
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error:', error.message);
      return Promise.reject(createError('NETWORK_ERROR', 'Network error. Please check your connection.'));
      
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
      return Promise.reject(createError('UNKNOWN_ERROR', error.message || 'An unexpected error occurred.'));
    }
  }
);

// Helper Functions

/**
 * Get token from localStorage based on current user role
 */
function getToken() {
  // Check all possible token locations
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('user_token') ||
    localStorage.getItem('organizer_token') ||
    localStorage.getItem('admin_token')
  );
}

/**
 * Refresh authentication token
 */
async function refreshToken() {
  try {
    const token = getToken();
    if (!token) return false;
    
    // Call refresh endpoint
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-token`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.success && response.data.token) {
      // Update token in localStorage
      updateToken(response.data.token);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

/**
 * Update token in localStorage
 */
function updateToken(newToken) {
  // Update all possible token locations
  if (localStorage.getItem('token')) {
    localStorage.setItem('token', newToken);
  }
  if (localStorage.getItem('user_token')) {
    localStorage.setItem('user_token', newToken);
  }
  if (localStorage.getItem('organizer_token')) {
    localStorage.setItem('organizer_token', newToken);
  }
  if (localStorage.getItem('admin_token')) {
    localStorage.setItem('admin_token', newToken);
  }
}

/**
 * Handle user logout
 */
function handleLogout() {
  // Clear all tokens
  localStorage.removeItem('token');
  localStorage.removeItem('user_token');
  localStorage.removeItem('organizer_token');
  localStorage.removeItem('admin_token');
  localStorage.removeItem('user');
  localStorage.removeItem('organizer');
  localStorage.removeItem('admin');
  
  // Redirect to login
  window.location.href = '/login';
}

/**
 * Create standardized error object
 */
function createError(code, message, details = null) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

/**
 * API Request wrapper with loading state
 */
export async function apiRequest(requestFn, options = {}) {
  const { onSuccess, onError, showLoading = true } = options;
  
  try {
    if (showLoading) {
      // You can dispatch loading action here if using Redux
      // or set loading state in Context
    }
    
    const data = await requestFn();
    
    if (onSuccess) {
      onSuccess(data);
    }
    
    return { data, error: null };
    
  } catch (error) {
    if (onError) {
      onError(error);
    }
    
    return { data: null, error };
    
  } finally {
    if (showLoading) {
      // Clear loading state
    }
  }
}

export default apiClient;
