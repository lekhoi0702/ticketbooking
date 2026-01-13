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

    async updateEventStatus(eventId, data) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update event status');
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
    }
};
