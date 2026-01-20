/**
 * Authentication API
 * All auth-related API calls using new v2 endpoints
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const authApi = {
  /**
   * User login
   */
  login: async (credentials) => {
    return apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
  },
  
  /**
   * User registration
   */
  register: async (userData) => {
    return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
  },
  
  /**
   * Change password
   */
  changePassword: async (passwords) => {
    return apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, passwords);
  },
  
  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return apiClient.get(ENDPOINTS.AUTH.ME);
  },
  
  /**
   * Refresh token
   */
  refreshToken: async () => {
    return apiClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
  },
};

export default authApi;
