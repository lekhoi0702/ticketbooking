import { API_BASE_URL } from '@shared/constants';

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

    async addShowtime(eventId, showtimeData) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}/duplicate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(showtimeData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add showtime');
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

    async deleteEvent(eventId, requestBody = {}) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const error = await response.json();
            // Return the error response instead of throwing, so we can handle specific cases
            return error;
        }
        return await response.json();
    },

    async bulkDeleteEvents(requestBody) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const error = await response.json();
            // Return the error response instead of throwing
            return error;
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

    async getEventOrders(eventId) {
        const response = await fetch(`${API_BASE_URL}/organizer/events/${eventId}/orders`);
        if (!response.ok) throw new Error('Failed to fetch event orders');
        return await response.json();
    },

    async approveRefund(orderId) {
        const response = await fetch(`${API_BASE_URL}/organizer/orders/${orderId}/refund/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to approve refund');
        }
        return await response.json();
    },

    async rejectRefund(orderId) {
        const response = await fetch(`${API_BASE_URL}/organizer/orders/${orderId}/refund/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reject refund');
        }
        return await response.json();
    },

    async getRefundRequests(managerId) {
        const response = await fetch(`${API_BASE_URL}/organizer/refund-requests?manager_id=${managerId}`);
        if (!response.ok) throw new Error('Failed to fetch refund requests');
        return await response.json();
    },

    // Venue Management
    async getOrganizerVenues(managerId = 1) {
        const response = await fetch(`${API_BASE_URL}/organizer/venues?manager_id=${managerId}`);
        if (!response.ok) throw new Error('Failed to fetch venues');
        return await response.json();
    },

    async createVenue(venueData) {
        const response = await fetch(`${API_BASE_URL}/organizer/venues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(venueData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create venue');
        }
        return await response.json();
    },

    async getVenue(venueId) {
        const response = await fetch(`${API_BASE_URL}/organizer/venues/${venueId}`);
        if (!response.ok) throw new Error('Failed to fetch venue');
        return await response.json();
    },

    async updateVenue(venueId, venueData) {
        const response = await fetch(`${API_BASE_URL}/organizer/venues/${venueId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(venueData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update venue');
        }
        return await response.json();
    },

    async deleteVenue(venueId) {
        const response = await fetch(`${API_BASE_URL}/organizer/venues/${venueId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete venue');
        }
        return await response.json();
    },

    async updateVenueSeats(venueId, seatData) {
        const response = await fetch(`${API_BASE_URL}/organizer/venues/${venueId}/seats`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(seatData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update seat map');
        }
        return await response.json();
    },

    // Ticket Management
    async searchTickets(query, managerId = 1, eventId = null, status = null) {
        let url = `${API_BASE_URL}/organizer/tickets/search?manager_id=${managerId}`;
        if (query) url += `&q=${query}`;
        if (eventId) url += `&event_id=${eventId}`;
        if (status) url += `&status=${status}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to search tickets');
        return await response.json();
    },

    async checkInTicket(ticketCode, managerId = 1) {
        const response = await fetch(`${API_BASE_URL}/organizer/tickets/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_code: ticketCode, manager_id: managerId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to check in ticket');
        }
        return await response.json();
    },

    async getOrganizerStats(managerId = 1) {
        const response = await fetch(`${API_BASE_URL}/organizer/stats?manager_id=${managerId}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    },

    async getOrders(managerId, params = {}) {
        const query = new URLSearchParams({
            manager_id: managerId,
            ...params
        }).toString();
        const response = await fetch(`${API_BASE_URL}/organizer/orders?${query}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return await response.json();
    },

    async getDiscounts(managerId) {
        const response = await fetch(`${API_BASE_URL}/organizer/discounts?manager_id=${managerId}`);
        if (!response.ok) throw new Error('Failed to fetch discounts');
        return await response.json();
    },

    async createDiscount(data) {
        const response = await fetch(`${API_BASE_URL}/organizer/discounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Failed to create discount');
        return resData;
    },

    async updateDiscount(id, data) {
        const response = await fetch(`${API_BASE_URL}/organizer/discounts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async deleteDiscount(id) {
        const response = await fetch(`${API_BASE_URL}/organizer/discounts/${id}`, { method: 'DELETE' });
        return await response.json();
    }
};
