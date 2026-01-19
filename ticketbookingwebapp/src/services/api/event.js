import { API_BASE_URL } from '@shared/constants';

export const eventApi = {
    async getEvents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/events?${queryString}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getEvent(eventId) {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getFeaturedEvents(limit = 10) {
        const response = await fetch(`${API_BASE_URL}/events/featured?limit=${limit}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getEventsByCategory(categoryId, limit = 20) {
        const response = await fetch(`${API_BASE_URL}/events?category_id=${categoryId}&limit=${limit}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async searchEvents(query) {
        const response = await fetch(`${API_BASE_URL}/events/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getCategory(categoryId) {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getCategories() {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getVenues() {
        const response = await fetch(`${API_BASE_URL}/venues`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getVenueById(venueId) {
        const response = await fetch(`${API_BASE_URL}/venues/${venueId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getPublicBanners() {
        const response = await fetch(`${API_BASE_URL}/banners`);
        if (!response.ok) throw new Error('Failed to fetch banners');
        return await response.json();
    },

    async getRecommendedEvents(eventId, limit = 8) {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/recommended?limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch recommended events');
        return await response.json();
    },

    async getTicketTypes(eventId) {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/ticket-types`);
        if (!response.ok) throw new Error('Failed to fetch ticket types');
        return await response.json();
    },

    async toggleFavorite(userId, eventId, token) {
        const response = await fetch(`${API_BASE_URL}/events/favorites/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId, event_id: eventId })
        });
        if (!response.ok) throw new Error('Failed to toggle favorite');
        return await response.json();
    },

    async getFavoriteEvents(userId, token) {
        const response = await fetch(`${API_BASE_URL}/events/favorites/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch favorites');
        return await response.json();
    },

    async getFavoriteEventIds(userId, token) {
        const response = await fetch(`${API_BASE_URL}/events/favorites/ids/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch favorite IDs');
        return await response.json();
    },
};
