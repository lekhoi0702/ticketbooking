/**
 * useEvents Queries
 * React Query hooks for events
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../../api';
import { handleApiError, showSuccess } from '../../utils/errorHandler';

// Query keys
export const EVENTS_KEYS = {
  all: ['events'],
  lists: () => [...EVENTS_KEYS.all, 'list'],
  list: (filters) => [...EVENTS_KEYS.lists(), filters],
  details: () => [...EVENTS_KEYS.all, 'detail'],
  detail: (id) => [...EVENTS_KEYS.details(), id],
  featured: () => [...EVENTS_KEYS.all, 'featured'],
  upcoming: () => [...EVENTS_KEYS.all, 'upcoming'],
  search: (query) => [...EVENTS_KEYS.all, 'search', query],
};

/**
 * Get all events with filters
 */
export const useEvents = (params = {}, options = {}) => {
  return useQuery({
    queryKey: EVENTS_KEYS.list(params),
    queryFn: () => eventsApi.getAll(params),
    ...options,
  });
};

/**
 * Get single event
 */
export const useEvent = (eventId, options = {}) => {
  return useQuery({
    queryKey: EVENTS_KEYS.detail(eventId),
    queryFn: () => eventsApi.getById(eventId),
    enabled: !!eventId, // Don't fetch if no eventId
    ...options,
  });
};

/**
 * Get featured events
 */
export const useFeaturedEvents = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: EVENTS_KEYS.featured(),
    queryFn: () => eventsApi.getFeatured(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Get upcoming events
 */
export const useUpcomingEvents = (limit = 20, options = {}) => {
  return useQuery({
    queryKey: EVENTS_KEYS.upcoming(),
    queryFn: () => eventsApi.getUpcoming(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Search events
 */
export const useSearchEvents = (query, limit = 20, options = {}) => {
  return useQuery({
    queryKey: EVENTS_KEYS.search(query),
    queryFn: () => eventsApi.search(query, limit),
    enabled: !!query && query.length >= 2, // Only search if query is at least 2 chars
    ...options,
  });
};

// Example mutation (if needed)
export const useCreateEvent = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData) => eventsApi.create(eventData),
    onSuccess: (data) => {
      // Invalidate events list to refetch
      queryClient.invalidateQueries({ queryKey: EVENTS_KEYS.lists() });
      showSuccess('Tạo sự kiện thành công!');
    },
    onError: (error) => {
      handleApiError(error);
    },
    ...options,
  });
};
