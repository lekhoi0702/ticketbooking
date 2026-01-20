/**
 * API Endpoint Constants
 * Centralized endpoint management
 */

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  
  // Events
  EVENTS: {
    LIST: '/events',
    DETAIL: (id) => `/events/${id}`,
    FEATURED: '/events/featured',
    UPCOMING: '/events/upcoming',
    SEARCH: '/events/search',
    TICKET_TYPES: (id) => `/events/${id}/ticket-types`,
    RECOMMENDED: (id) => `/events/${id}/recommended`,
  },
  
  // Orders
  ORDERS: {
    CREATE: '/orders/create',
    DETAIL: (id) => `/orders/${id}`,
    BY_CODE: (code) => `/orders/${code}/status`,
    USER_ORDERS: (userId) => `/orders/user/${userId}`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    USER_TICKETS: (userId) => `/tickets/user/${userId}`,
    VALIDATE_DISCOUNT: '/orders/validate-discount',
  },
  
  // Organizer (Legacy endpoints - until refactored)
  ORGANIZER: {
    EVENTS: '/organizer/events',
    EVENT_DETAIL: (id) => `/organizer/events/${id}`,
    CREATE_EVENT: '/organizer/events',
    UPDATE_EVENT: (id) => `/organizer/events/${id}`,
    DELETE_EVENT: (id) => `/organizer/events/${id}`,
    DASHBOARD_STATS: '/organizer/dashboard/stats',
    ORDERS: '/organizer/orders',
    VENUES: '/organizer/venues',
    DISCOUNTS: '/organizer/discounts',
  },
  
  // Admin (Legacy endpoints - until refactored)
  ADMIN: {
    DASHBOARD: '/admin/stats',
    USERS: '/admin/users',
    EVENTS: '/admin/events',
    ORDERS: '/admin/orders',
    CATEGORIES: '/admin/categories',
    BANNERS: '/admin/banners',
  },
};

export default ENDPOINTS;
