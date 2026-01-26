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

    async getEventShowtimes(eventId) {
        const response = await fetch(`${API_BASE_URL}/admin/events/${eventId}/showtimes`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch event showtimes: ${response.status} ${response.statusText}`);
        }
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
            const err = await response.json();
            const msg = err?.error?.message || err?.message || 'Khôi phục mật khẩu thất bại';
            throw new Error(msg);
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

    // Event deletion request feature removed (no DB table)

    async getAdminCategories() {
        const response = await fetch(`${API_BASE_URL}/admin/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return await response.json();
    },

    async createCategory(data) {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            headers,
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

};
