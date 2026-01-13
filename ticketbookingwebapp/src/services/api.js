import { API_BASE_URL } from '../constants';

export const api = {
    // Auth APIs
    async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return await response.json();
    },

    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return await response.json();
    },

    // Get all events with optional filters
    async getEvents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/events?${queryString}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Get single event by ID
    async getEvent(eventId) {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Get featured events
    async getFeaturedEvents(limit = 10) {
        const response = await fetch(`${API_BASE_URL}/events/featured?limit=${limit}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Get events by category
    async getEventsByCategory(categoryId, limit = 20) {
        const response = await fetch(`${API_BASE_URL}/events?category_id=${categoryId}&limit=${limit}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Search events
    async searchEvents(query) {
        const response = await fetch(`${API_BASE_URL}/events/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Get single category by ID
    async getCategory(categoryId) {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Get all categories
    async getCategories() {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Get all venues
    async getVenues() {
        const response = await fetch(`${API_BASE_URL}/venues`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Organizer - Dashboard
    async getDashboardStats(managerId = 1) {
        const response = await fetch(`${API_BASE_URL}/organizer/dashboard?manager_id=${managerId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Organizer - Get events
    async getOrganizerEvents(managerId = 1, status = null) {
        const params = new URLSearchParams({ manager_id: managerId });
        if (status) params.append('status', status);
        const response = await fetch(`${API_BASE_URL}/organizer/events?${params}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Organizer - Create event
    async createEvent(formData) {
        const response = await fetch(`${API_BASE_URL}/organizer/events`, {
            method: 'POST',
            body: formData, // FormData object
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create event');
        }
        const data = await response.json();
        return data;
    },

    // Organizer - Update event
    async updateEvent(eventId, formData) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}`, {
            method: 'PUT',
            body: formData, // FormData object
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update event');
        }
        const data = await response.json();
        return data;
    },

    // Organizer - Delete event
    async deleteEvent(eventId) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete event');
        }
        const data = await response.json();
        return data;
    },

    // Organizer - Get ticket types for event
    async getTicketTypes(eventId) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}/ticket-types`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Organizer - Create ticket type
    async createTicketType(eventId, ticketData) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}/ticket-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create ticket type');
        }
        const data = await response.json();
        return data;
    },

    // Organizer - Update ticket type
    async updateTicketType(ticketTypeId, ticketData) {
        const response = await fetch(`${API_BASE_URL}/organizer/ticket-types/${ticketTypeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update ticket type');
        }
        const data = await response.json();
        return data;
    },

    // Organizer - Delete ticket type
    async deleteTicketType(ticketTypeId) {
        const response = await fetch(`${API_BASE_URL}/organizer/ticket-types/${ticketTypeId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete ticket type');
        }
        const data = await response.json();
        return data;
    },

    async getSeatsByTicketType(ticketTypeId) {
        const response = await fetch(`${API_BASE_URL}/seats/ticket-type/${ticketTypeId}`);
        if (!response.ok) throw new Error('Failed to fetch seats');
        return await response.json();
    },

    async getSeat(seatId) {
        const response = await fetch(`${API_BASE_URL}/seats/${seatId}`);
        if (!response.ok) throw new Error('Failed to fetch seat info');
        return await response.json();
    },

    async initializeSeats(data) {
        const response = await fetch(`${API_BASE_URL}/seats/initialize-default`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to initialize seats');
        }
        return await response.json();
    },

    async getAllEventSeats(eventId) {
        const response = await fetch(`${API_BASE_URL}/seats/event/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event seats');
        return await response.json();
    },

    async assignSeatsFromTemplate(data) {
        const response = await fetch(`${API_BASE_URL}/seats/assign-template`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to assign seats from template');
        }
        return await response.json();
    },

    // Orders API
    async createOrder(orderData) {
        const response = await fetch(`${API_BASE_URL}/orders/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create order');
        }
        const data = await response.json();
        return data;
    },

    async getOrder(orderId) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    async getOrderByCode(orderCode) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderCode}/status`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    async getUserOrders(userId) {
        const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    async cancelOrder(orderId) {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cancel order');
        }
        const data = await response.json();
        return data;
    },

    // Payments API
    async createPayment(paymentData) {
        const response = await fetch(`${API_BASE_URL}/payments/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create payment');
        }
        const data = await response.json();
        return data;
    },

    async createVNPayPaymentUrl(orderId) {
        const response = await fetch(`${API_BASE_URL}/payments/vnpay/create-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create VNPay payment URL');
        }
        const data = await response.json();
        return data;
    },

    async confirmCashPayment(paymentId) {
        const response = await fetch(`${API_BASE_URL}/payments/cash/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_id: paymentId }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to confirm cash payment');
        }
        const data = await response.json();
        return data;
    },

    async getPayment(paymentId) {
        const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    async getPaymentByOrder(orderId) {
        const response = await fetch(`${API_BASE_URL}/payments/order/${orderId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    },

    // Admin API
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
