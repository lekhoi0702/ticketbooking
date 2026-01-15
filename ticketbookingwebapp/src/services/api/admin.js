import { API_BASE_URL } from '../../constants';

export const adminApi = {
    async getAdminStats() {
        const response = await fetch(`${API_BASE_URL}/admin/stats`);
        if (!response.ok) throw new Error('Failed to fetch admin stats');
        return await response.json();
    },

    async getAllUsers() {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return await response.json();
    },

    async createUser(userData) {
        const response = await fetch(`${API_BASE_URL}/admin/users/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }
        return await response.json();
    },

    async getAllAdminEvents() {
        const response = await fetch(`${API_BASE_URL}/admin/events`);
        if (!response.ok) throw new Error('Failed to fetch admin events');
        return await response.json();
    },

    async adminUpdateEventStatus(eventId, data) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(data instanceof FormData ? data : Object.entries(data)))
        });
        if (!response.ok) throw new Error('Failed to update event status');
        return await response.json();
    },

    async adminDeleteEvent(eventId) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete event');
        }
        return await response.json();
    },

    async getAllAdminOrders() {
        const response = await fetch(`${API_BASE_URL}/admin/orders`);
        if (!response.ok) throw new Error('Failed to fetch admin orders');
        return await response.json();
    },

    async resetUserPassword(userId) {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reset password');
        }
        return await response.json();
    },

    async toggleUserLock(userId, isLocked) {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-lock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_locked: isLocked })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to toggle user lock');
        }
        return await response.json();
    },

    async getAllVenues() {
        const response = await fetch(`${API_BASE_URL}/admin/venues`);
        if (!response.ok) throw new Error('Failed to fetch venues');
        return await response.json();
    },

    async updateVenueSeats(venueId, areaData) {
        const response = await fetch(`${API_BASE_URL}/admin/venues/${venueId}/seats`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(areaData)
        });
        if (!response.ok) throw new Error('Failed to update venue seats');
        return await response.json();
    },

    async updateVenueStatus(venueId, status) {
        const response = await fetch(`${API_BASE_URL}/admin/venues/${venueId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update venue status');
        return await response.json();
    },

    async processOrderCancellation(orderId, action) {
        const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/cancellation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }) // action: 'approve' or 'reject'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to process cancellation');
        }
        return await response.json();
    }
};
