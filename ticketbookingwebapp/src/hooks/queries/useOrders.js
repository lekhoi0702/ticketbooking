/**
 * useOrders Queries
 * React Query hooks for orders
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api';
import { handleApiError, showSuccess } from '../../utils/errorHandler';

// Query keys
export const ORDERS_KEYS = {
  all: ['orders'],
  lists: () => [...ORDERS_KEYS.all, 'list'],
  list: (userId) => [...ORDERS_KEYS.lists(), userId],
  details: () => [...ORDERS_KEYS.all, 'detail'],
  detail: (id) => [...ORDERS_KEYS.details(), id],
  byCode: (code) => [...ORDERS_KEYS.all, 'code', code],
  tickets: (userId) => [...ORDERS_KEYS.all, 'tickets', userId],
};

/**
 * Get user orders
 */
export const useUserOrders = (userId, options = {}) => {
  return useQuery({
    queryKey: ORDERS_KEYS.list(userId),
    queryFn: () => ordersApi.getUserOrders(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Get order by ID
 */
export const useOrder = (orderId, options = {}) => {
  return useQuery({
    queryKey: ORDERS_KEYS.detail(orderId),
    queryFn: () => ordersApi.getById(orderId),
    enabled: !!orderId,
    ...options,
  });
};

/**
 * Get order by code
 */
export const useOrderByCode = (orderCode, options = {}) => {
  return useQuery({
    queryKey: ORDERS_KEYS.byCode(orderCode),
    queryFn: () => ordersApi.getByCode(orderCode),
    enabled: !!orderCode,
    ...options,
  });
};

/**
 * Get user tickets
 */
export const useUserTickets = (userId, options = {}) => {
  return useQuery({
    queryKey: ORDERS_KEYS.tickets(userId),
    queryFn: () => ordersApi.getUserTickets(userId),
    enabled: !!userId,
    ...options,
  });
};

/**
 * Create order mutation
 */
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData) => ordersApi.create(orderData),
    onSuccess: (data, variables) => {
      // Invalidate user orders
      if (variables.user_id) {
        queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.list(variables.user_id) });
      }
      showSuccess('Đặt vé thành công!');
    },
    onError: (error) => {
      handleApiError(error);
    },
    ...options,
  });
};

/**
 * Cancel order mutation
 */
export const useCancelOrder = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, reason }) => ordersApi.cancel(orderId, reason),
    onSuccess: (data, variables) => {
      // Invalidate order details and lists
      queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.detail(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.lists() });
      showSuccess('Hủy đơn hàng thành công!');
    },
    onError: (error) => {
      handleApiError(error);
    },
    ...options,
  });
};
