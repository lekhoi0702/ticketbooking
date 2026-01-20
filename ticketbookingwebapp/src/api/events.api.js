/**
 * Events API
 * All event-related API calls using new v2 endpoints
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const eventsApi = {
  /**
   * Get all events with filters
   */
  getAll: async (params = {}) => {
    return apiClient.get(ENDPOINTS.EVENTS.LIST, { params });
  },
  
  /**
   * Get single event by ID
   */
  getById: async (eventId) => {
    return apiClient.get(ENDPOINTS.EVENTS.DETAIL(eventId));
  },
  
  /**
   * Get featured events
   */
  getFeatured: async (limit = 10) => {
    return apiClient.get(ENDPOINTS.EVENTS.FEATURED, { params: { limit } });
  },
  
  /**
   * Get upcoming events
   */
  getUpcoming: async (limit = 20) => {
    return apiClient.get(ENDPOINTS.EVENTS.UPCOMING, { params: { limit } });
  },
  
  /**
   * Search events
   */
  search: async (query, limit = 20) => {
    return apiClient.get(ENDPOINTS.EVENTS.SEARCH, {
      params: { q: query, limit }
    });
  },
  
  /**
   * Get ticket types for event
   */
  getTicketTypes: async (eventId) => {
    return apiClient.get(ENDPOINTS.EVENTS.TICKET_TYPES(eventId));
  },
  
  /**
   * Get recommended events
   */
  getRecommended: async (eventId, limit = 5) => {
    return apiClient.get(ENDPOINTS.EVENTS.RECOMMENDED(eventId), {
      params: { limit }
    });
  },
};

export default eventsApi;
