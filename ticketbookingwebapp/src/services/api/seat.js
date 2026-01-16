import { API_BASE_URL } from '@shared/constants';

export const seatApi = {
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
};
