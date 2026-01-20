/**
 * API Module Exports
 * Single entry point for all API calls
 */

export { default as apiClient } from './client';
export { ENDPOINTS } from './endpoints';
export { authApi } from './auth.api';
export { eventsApi } from './events.api';
export { ordersApi } from './orders.api';

// Re-export for convenience
export default {
  auth: authApi,
  events: eventsApi,
  orders: ordersApi,
};
