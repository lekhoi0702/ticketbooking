/**
 * Orders API
 * All order-related API calls using new v2 endpoints
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export const ordersApi = {
  /**
   * Create new order
   */
  create: async (orderData) => {
    return apiClient.post(ENDPOINTS.ORDERS.CREATE, orderData);
  },
  
  /**
   * Get order by ID
   */
  getById: async (orderId) => {
    return apiClient.get(ENDPOINTS.ORDERS.DETAIL(orderId));
  },
  
  /**
   * Get order by code
   */
  getByCode: async (orderCode) => {
    return apiClient.get(ENDPOINTS.ORDERS.BY_CODE(orderCode));
  },
  
  /**
   * Get user orders
   */
  getUserOrders: async (userId) => {
    return apiClient.get(ENDPOINTS.ORDERS.USER_ORDERS(userId));
  },
  
  /**
   * Cancel order
   */
  cancel: async (orderId, reason) => {
    return apiClient.post(ENDPOINTS.ORDERS.CANCEL(orderId), { reason });
  },
  
  /**
   * Get user tickets
   */
  getUserTickets: async (userId) => {
    return apiClient.get(ENDPOINTS.ORDERS.USER_TICKETS(userId));
  },
  
  /**
   * Validate discount code
   */
  validateDiscount: async (discountCode, totalAmount) => {
    return apiClient.post(ENDPOINTS.ORDERS.VALIDATE_DISCOUNT, {
      discount_code: discountCode,
      total_amount: totalAmount
    });
  },
};

export default ordersApi;
