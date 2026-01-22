import { API_BASE_URL } from '@shared/constants';

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
    },

    async getEventDeletionRequests(status = 'PENDING') {
        const params = status ? `?status=${status}` : '';
        const response = await fetch(`${API_BASE_URL}/admin/event-deletion-requests${params}`);
        if (!response.ok) throw new Error('Failed to fetch deletion requests');
        return await response.json();
    },

    async approveEventDeletionRequest(requestId, data) {
        const response = await fetch(`${API_BASE_URL}/admin/event-deletion-requests/${requestId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to approve deletion request');
        }
        return await response.json();
    },

    async rejectEventDeletionRequest(requestId, data) {
        const response = await fetch(`${API_BASE_URL}/admin/event-deletion-requests/${requestId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reject deletion request');
        }
        return await response.json();
    },

    async createCategory(data) {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create category');
        }
        return await response.json();
    },

    async updateCategory(categoryId, data) {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update category');
        }
        return await response.json();
    },

    async deleteCategory(categoryId) {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete category');
        }
        return await response.json();
    },

    // Banner Management
    async getBanners() {
        const response = await fetch(`${API_BASE_URL}/admin/banners`);
        if (!response.ok) throw new Error('Failed to fetch banners');
        return await response.json();
    },

    async createBanner(data) {
        // data should be FormData
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Don't set Content-Type for FormData - browser will set it with boundary
        
        const response = await fetch(`${API_BASE_URL}/admin/banners`, {
            method: 'POST',
            headers: headers,
            body: data
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create banner');
        }
        return await response.json();
    },

    async updateBanner(bannerId, data) {
        // data should be FormData
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Don't set Content-Type for FormData - browser will set it with boundary
        
        const response = await fetch(`${API_BASE_URL}/admin/banners/${bannerId}`, {
            method: 'PUT',
            headers: headers,
            body: data
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update banner');
        }
        return await response.json();
    },

    async deleteBanner(bannerId) {
        const response = await fetch(`${API_BASE_URL}/admin/banners/${bannerId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete banner');
        }
        return await response.json();
    },

    // Discount Management
    async getAllDiscounts(eventId = null) {
        const params = eventId ? `?event_id=${eventId}` : '';
        const response = await fetch(`${API_BASE_URL}/admin/discounts${params}`);
        if (!response.ok) throw new Error('Failed to fetch discounts');
        return await response.json();
    },

    async getEventDiscounts(eventId) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/discounts`);
        if (!response.ok) throw new Error('Failed to fetch event discounts');
        return await response.json();
    },

    // Audit Logs Management
    async getAuditLogs(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.user_id) queryParams.append('user_id', params.user_id);
        if (params.action) queryParams.append('action', params.action);
        if (params.entity_type) queryParams.append('entity_type', params.entity_type);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.per_page) queryParams.append('per_page', params.per_page);
        
        const response = await fetch(`${API_BASE_URL}/admin/audit-logs?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch audit logs');
        return await response.json();
    },

    async getOrganizerAuditLogs(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.per_page) queryParams.append('per_page', params.per_page);
        if (params.table_name) queryParams.append('table_name', params.table_name);
        if (params.action) queryParams.append('action', params.action);
        
        const response = await fetch(`${API_BASE_URL}/admin/audit-logs/organizers?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch organizer audit logs');
        return await response.json();
    },

    async getAuditLogsStats() {
        const response = await fetch(`${API_BASE_URL}/admin/audit-logs/stats`);
        if (!response.ok) throw new Error('Failed to fetch audit logs stats');
        return await response.json();
    },

    async getAuditLogActionTypes() {
        const response = await fetch(`${API_BASE_URL}/admin/audit-logs/actions`);
        if (!response.ok) throw new Error('Failed to fetch audit log action types');
        return await response.json();
    },

    async getUserAuditLogs(userId, params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.per_page) queryParams.append('per_page', params.per_page);
        
        const response = await fetch(`${API_BASE_URL}/admin/audit-logs/user/${userId}?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch user audit logs');
        return await response.json();
    },

    async getEntityAuditLogs(entityType, entityId) {
        const response = await fetch(`${API_BASE_URL}/admin/audit-logs/entity/${entityType}/${entityId}`);
        if (!response.ok) throw new Error('Failed to fetch entity audit logs');
        return await response.json();
    }
};
