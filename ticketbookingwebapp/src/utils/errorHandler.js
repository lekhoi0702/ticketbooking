/**
 * Error Handling Utilities
 * Centralized error handling and user-friendly messages
 */

import { message as antMessage } from 'antd';

/**
 * Error type mapping to user-friendly messages
 */
const ERROR_MESSAGES = {
  // Network Errors
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.',
  TIMEOUT_ERROR: 'Yêu cầu quá lâu. Vui lòng thử lại.',
  
  // Authentication Errors
  UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  
  // Authorization Errors
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  INSUFFICIENT_PERMISSION: 'Bạn không có quyền truy cập tài nguyên này.',
  
  // Resource Errors
  NOT_FOUND: 'Không tìm thấy tài nguyên.',
  RESOURCE_NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  
  // Validation Errors
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  
  // Business Logic Errors
  INSUFFICIENT_STOCK: 'Không đủ số lượng vé.',
  SEAT_ALREADY_BOOKED: 'Ghế đã được đặt.',
  ORDER_ALREADY_CANCELLED: 'Đơn hàng đã bị hủy.',
  INVALID_DISCOUNT: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.',
  
  // Server Errors
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định.',
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;
  
  // If error has code, map to friendly message
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // If error has message, use it
  if (error.message) {
    return error.message;
  }
  
  // Fallback
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Show error message to user
 */
export const showError = (error, duration = 5) => {
  const message = getErrorMessage(error);
  antMessage.error(message, duration);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error:', error);
  }
};

/**
 * Show success message to user
 */
export const showSuccess = (message, duration = 3) => {
  antMessage.success(message, duration);
};

/**
 * Show info message to user
 */
export const showInfo = (message, duration = 3) => {
  antMessage.info(message, duration);
};

/**
 * Show warning message to user
 */
export const showWarning = (message, duration = 3) => {
  antMessage.warning(message, duration);
};

/**
 * Handle API error with user feedback
 */
export const handleApiError = (error) => {
  showError(error);
  
  // Additional logging or error reporting can be added here
  // e.g., send to Sentry, LogRocket, etc.
  
  return error;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return [];
  }
  
  return Object.entries(errors).map(([field, messages]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    return {
      field,
      messages: messageArray,
      message: messageArray.join(', '),
    };
  });
};

export default {
  getErrorMessage,
  showError,
  showSuccess,
  showInfo,
  showWarning,
  handleApiError,
  formatValidationErrors,
};
