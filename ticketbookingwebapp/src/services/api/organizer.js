import { API_BASE_URL } from '../../constants';

export const organizerApi = {
    async getDashboardStats(managerId = 1) {
        const response = await fetch(`${API_BASE_URL}/organizer/dashboard?manager_id=${managerId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async getOrganizerEvents(managerId = 1, status = null) {
        const params = new URLSearchParams({ manager_id: managerId });
        if (status) params.append('status', status);
        const response = await fetch(`${API_BASE_URL}/organizer/events?${params}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    async createEvent(formData) {
        const response = await fetch(`${API_BASE_URL}/organizer/events`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create event');
        }
        return await response.json();
    },

    async updateEvent(eventId, formData) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}`, {
            method: 'PUT',
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update event');
        }
        return await response.json();
    },

    async deleteEvent(eventId) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete event');
        }
        return await response.json();
    },

    async getTicketTypes(eventId) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}/ticket-types`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

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
        return await response.json();
    },

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
        return await response.json();
    },

    async deleteTicketType(ticketTypeId) {
        const response = await fetch(`${API_BASE_URL}/organizer/ticket-types/${ticketTypeId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete ticket type');
        }
        return await response.json();
    },

    async processOrderCancellation(orderId, action) {
        const response = await fetch(`${API_BASE_URL}/organizer/orders/${orderId}/cancellation`, {
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
};
