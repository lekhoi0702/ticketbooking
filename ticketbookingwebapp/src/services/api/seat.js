import { apiRequest } from './_compat';

export const seatApi = {
    async getSeatsByTicketType(eventId) {
        const res = await apiRequest('/seats', {
            query: eventId ? { EventID: eventId } : undefined,
        });
        if (!res.success) return res;
        return { success: true, data: res.data || [], message: '' };
    },

    async getSeat(seatId) {
        const res = await apiRequest('/seats');
        if (!res.success) return res;
        const seat = (res.data || []).find((s) => String(s.seat_id || s.SeatID) === String(seatId));
        if (!seat) return { success: false, data: null, message: 'Khong tim thay ghe' };
        return { success: true, data: seat, message: '' };
    },

    async initializeSeats(payload = {}) {
        const venueId = payload.venue_id || payload.VenueID || payload.venueId;
        if (!venueId) {
            return { success: true, data: [], message: 'Da bo mapping ghe theo hang ve.' };
        }
        return apiRequest('/seats/initialize', {
            method: 'POST',
            body: {
                VenueID: venueId,
                Rows: payload.rows ?? payload.Rows ?? 5,
                SeatsPerRow: payload.seats_per_row ?? payload.SeatsPerRow ?? 10,
                CreateID: payload.create_id ?? payload.CreateID ?? 1,
            },
        });
    },

    async getAllEventSeats(eventId) {
        const res = await apiRequest('/seats', {
            query: eventId ? { EventID: eventId } : undefined,
        });
        if (!res.success) return res;
        return { success: true, data: res.data || [], message: '' };
    },

    async assignSeatsFromTemplate(payload = {}) {
        const venueId = payload.venue_id || payload.VenueID || payload.venueId;
        if (!venueId) {
            return { success: true, data: [], message: 'Da bo mapping ghe theo hang ve.' };
        }
        return apiRequest('/seats/assign-template', {
            method: 'POST',
            body: {
                VenueID: venueId,
                Seats: payload.seats || payload.Seats || [],
                CreateID: payload.create_id ?? payload.CreateID ?? 1,
            },
        });
    },

    async lockSeat(seatId, userId, eventId) {
        return apiRequest('/seats/lock', {
            method: 'POST',
            body: {
                SeatID: seatId,
                UserID: userId,
                EventID: eventId,
            },
        });
    },

    async unlockSeat(seatId, userId) {
        return apiRequest('/seats/unlock', {
            method: 'POST',
            body: {
                SeatID: seatId,
                UserID: userId,
            },
        });
    },

    async getMyReservations(eventId, userId) {
        return apiRequest('/seats/my-reservations', {
            query: {
                EventID: eventId,
                UserID: userId,
            },
        });
    },

    async unlockAllSeats(userId, eventId) {
        return apiRequest('/seats/unlock-all', {
            method: 'POST',
            body: {
                UserID: userId,
                EventID: eventId,
            },
        });
    },
};
