/**
 * useNotification Hook
 * Wrapper around Ant Design message/notification
 */

import { message, notification } from 'antd';
import { useCallback } from 'react';

export const useNotification = () => {
  // Message API (Simple toasts)
  const showSuccess = useCallback((content, duration = 3) => {
    message.success(content, duration);
  }, []);

  const showError = useCallback((content, duration = 5) => {
    message.error(content, duration);
  }, []);

  const showInfo = useCallback((content, duration = 3) => {
    message.info(content, duration);
  }, []);

  const showWarning = useCallback((content, duration = 3) => {
    message.warning(content, duration);
  }, []);

  const showLoading = useCallback((content = 'Đang xử lý...', duration = 0) => {
    return message.loading(content, duration);
  }, []);

  // Notification API (Rich notifications with title and description)
  const notify = useCallback(({ type = 'info', title, description, duration = 4.5, placement = 'topRight' }) => {
    notification[type]({
      message: title,
      description,
      duration,
      placement,
    });
  }, []);

  const notifySuccess = useCallback(({ title, description, duration, placement }) => {
    notify({ type: 'success', title, description, duration, placement });
  }, [notify]);

  const notifyError = useCallback(({ title, description, duration, placement }) => {
    notify({ type: 'error', title, description, duration, placement });
  }, [notify]);

  const notifyInfo = useCallback(({ title, description, duration, placement }) => {
    notify({ type: 'info', title, description, duration, placement });
  }, [notify]);

  const notifyWarning = useCallback(({ title, description, duration, placement }) => {
    notify({ type: 'warning', title, description, duration, placement });
  }, [notify]);

  return {
    // Simple messages
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,

    // Rich notifications
    notify,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  };
};

export default useNotification;
