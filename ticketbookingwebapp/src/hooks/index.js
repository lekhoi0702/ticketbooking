/**
 * Custom Hooks - Central Export
 */

// Existing hooks (keep for backward compatibility)
export { default as useCheckout } from '../shared/hooks/useCheckout';
export { default as useCreateEvent } from '../shared/hooks/useCreateEvent';
export { default as useEventDetail } from '../shared/hooks/useEventDetail';
export { default as useEventList } from '../shared/hooks/useEventList';
export { default as useManageSeats } from '../shared/hooks/useManageSeats';
export { default as usePendingRefunds } from '../shared/hooks/usePendingRefunds';

// New hooks
export { useNotification } from './useNotification';
export { useLocalStorage } from './useLocalStorage';
export { useDebounce, useDebounceCallback } from './useDebounce';
export { useAsync } from './useAsync';

// Auth hook (from context)
export { useAuth } from '../context/AuthContext';
