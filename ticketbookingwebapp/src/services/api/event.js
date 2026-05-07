import { apiRequest } from './_compat';
import { getStaticAdsByPosition } from '@shared/constants/staticAds';

const normalizeBool = (value) => value === true || value === 1 || value === '1';

const safeList = (res) => (res.success && Array.isArray(res.data) ? res.data : []);

const normalizeTicketType = (tt = {}) => ({
    ...tt,
    ticket_type_id: tt.ticket_type_id || tt.TicketTypeID,
    event_id: tt.event_id || tt.EventID,
    type_name: tt.type_name || tt.TypeName,
    price: Number(tt.price ?? tt.Price ?? 0) || 0,
    sale_start_date: tt.sale_start_date || tt.SaleStartDate || null,
    sale_end_date: tt.sale_end_date || tt.SaleEndDate || null,
    status: String(tt.status || tt.Status || 'ACTIVE').toUpperCase(),
    is_active: String(tt.status || tt.Status || 'ACTIVE').toUpperCase() !== 'INACTIVE',
    quantity: Number(tt.quantity ?? tt.Quantity ?? 0) || 0,
    sold_quantity: Number(tt.sold_quantity ?? tt.SoldQuantity ?? 0) || 0,
    available_quantity: Number(tt.available_quantity ?? tt.AvailableQuantity ?? 0) || 0,
    selected_seats: tt.selected_seats || tt.SelectedSeats || [],
});

const normalizeVenue = (venue = null) => {
    if (!venue) return null;
    return {
        ...venue,
        venue_id: venue.venue_id || venue.VenueID,
        venue_name: venue.venue_name || venue.VenueName,
        address: venue.address || venue.Address,
        city: venue.city || venue.City,
        seat_map: venue.seat_map || venue.SeatMap || null,
        seat_map_template: venue.seat_map_template || venue.seat_map || venue.SeatMap || null,
        status: String(venue.status || venue.Status || 'ACTIVE').toUpperCase(),
        is_active: !['INACTIVE', 'MAINTENANCE'].includes(String(venue.status || venue.Status || '').toUpperCase()),
    };
};

const normalizeCategory = (category = null) => {
    if (!category) return null;
    return {
        ...category,
        category_id: category.category_id || category.CategoryID,
        category_name: category.category_name || category.CategoryName,
        status: String(category.status || category.Status || 'ACTIVE').toUpperCase(),
    };
};

const normalizeEvent = (event = {}) => {
    const start = event.start_datetime || event.start_date || event.StartDate || null;
    const end = event.end_datetime || event.end_date || event.EndDate || null;
    const category = normalizeCategory(event.category || event.Category || null);
    const venue = normalizeVenue(event.venue || event.Venue || null);
    const organizer = event.organizer || event.Organizer || null;
    const ticketTypesRaw = event.ticket_types || event.TicketTypes || [];

    return {
        ...event,
        event_id: event.event_id || event.EventID,
        event_name: event.event_name || event.EventName,
        category_id: event.category_id || event.CategoryID,
        venue_id: event.venue_id || event.VenueID || null,
        organizer_id: event.organizer_id || event.OrganizerID || null,
        manager_id: event.manager_id || event.ManagerID || event.organizer_id || event.OrganizerID || null,
        description: event.description || event.Description || '',
        start_datetime: start,
        end_datetime: end,
        start_date: start,
        end_date: end,
        status: String(event.status || event.Status || 'DRAFT').toUpperCase(),
        banner_image_url: event.banner_image_url || event.image_url || event.ImageURL || null,
        image_url: event.image_url || event.ImageURL || event.banner_image_url || null,
        is_featured: normalizeBool(event.is_featured || event.is_featured_event || event.featured_event || event.IsFeaturedEvent || event.FeaturedEvent),
        category,
        venue,
        organizer,
        organizer_name:
            event.organizer_name ||
            event.OrganizerName ||
            organizer?.organizer_name ||
            organizer?.OrganizerName ||
            null,
        organizer_info: organizer
            ? {
                  organization_name: organizer.organizer_name || organizer.OrganizerName,
                  description: organizer.description || organizer.Description || '',
                  logo_url: organizer.logo_url || organizer.LogoURL || null,
              }
            : null,
        ticket_types: Array.isArray(ticketTypesRaw) ? ticketTypesRaw.map(normalizeTicketType) : [],
        qr_image_url: event.qr_image_url || event.qr_code_url || event.QRCodeURL || null,
        qr_bank_name: event.qr_bank_name || event.QRBankName || null,
        qr_account_number: event.qr_account_number || event.QRAccountNumber || null,
    };
};

export const eventApi = {
    async getEvents(params = {}) {
        const res = await apiRequest('/events');
        if (!res.success) return res;

        let events = Array.isArray(res.data) ? res.data.map(normalizeEvent) : [];

        const statusFilter = params.status ? String(params.status).toUpperCase() : null;
        if (statusFilter) {
            events = events.filter((e) => String(e.status || '').toUpperCase() === statusFilter);
        } else {
            events = events.filter((e) => ['PUBLISHED', 'ONGOING'].includes(String(e.status || '').toUpperCase()));
        }

        if (params.category_id) {
            events = events.filter((e) => String(e.category_id) === String(params.category_id));
        }

        if (params.venue_id) {
            events = events.filter((e) => String(e.venue_id) === String(params.venue_id));
        }

        if (params.date_from) {
            const from = new Date(params.date_from).getTime();
            if (!Number.isNaN(from)) {
                events = events.filter((e) => {
                    const ts = new Date(e.start_datetime || e.start_date || 0).getTime();
                    return !Number.isNaN(ts) && ts >= from;
                });
            }
        }

        if (params.date_to) {
            const to = new Date(params.date_to).getTime();
            if (!Number.isNaN(to)) {
                events = events.filter((e) => {
                    const ts = new Date(e.start_datetime || e.start_date || 0).getTime();
                    return !Number.isNaN(ts) && ts <= to;
                });
            }
        }

        if (params.min_price !== undefined && params.min_price !== null) {
            const min = Number(params.min_price);
            if (!Number.isNaN(min)) {
                events = events.filter((e) => {
                    const prices = (e.ticket_types || []).map((t) => Number(t.price || 0)).filter((p) => Number.isFinite(p));
                    if (prices.length === 0) return false;
                    return Math.min(...prices) >= min;
                });
            }
        }

        if (params.max_price !== undefined && params.max_price !== null) {
            const max = Number(params.max_price);
            if (!Number.isNaN(max)) {
                events = events.filter((e) => {
                    const prices = (e.ticket_types || []).map((t) => Number(t.price || 0)).filter((p) => Number.isFinite(p));
                    if (prices.length === 0) return false;
                    return Math.min(...prices) <= max;
                });
            }
        }

        if (params.q) {
            const q = String(params.q).toLowerCase();
            events = events.filter((e) =>
                String(e.event_name || '').toLowerCase().includes(q) ||
                String(e.description || '').toLowerCase().includes(q)
            );
        }

        if (params.sort === 'upcoming') {
            events = [...events].sort((a, b) => {
                const aTs = new Date(a.start_datetime || a.start_date || 0).getTime();
                const bTs = new Date(b.start_datetime || b.start_date || 0).getTime();
                return aTs - bTs;
            });
        } else if (params.sort === 'popular') {
            events = [...events].sort(
                (a, b) => Number(b.sold_tickets || b.SoldTickets || 0) - Number(a.sold_tickets || a.SoldTickets || 0)
            );
        } else {
            events = [...events].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
        }

        if (params.limit) {
            events = events.slice(0, Number(params.limit));
        }

        return { success: true, data: events, message: '' };
    },

    async getEvent(eventId) {
        const eventRes = await apiRequest(`/events/${eventId}`);
        if (!eventRes.success) return eventRes;

        let event = normalizeEvent(eventRes.data || {});

        const tasks = [];
        if (!event.ticket_types || event.ticket_types.length === 0) {
            tasks.push(apiRequest('/ticket-types', { query: { EventID: eventId } }));
        } else {
            tasks.push(Promise.resolve({ success: true, data: event.ticket_types }));
        }

        if (!event.venue && event.venue_id) {
            tasks.push(apiRequest(`/venues/${event.venue_id}`));
        } else {
            tasks.push(Promise.resolve({ success: true, data: event.venue }));
        }

        const [ticketRes, venueRes] = await Promise.all(tasks);

        if (ticketRes.success && Array.isArray(ticketRes.data)) {
            event.ticket_types = ticketRes.data.map(normalizeTicketType);
        }

        if (venueRes.success && venueRes.data) {
            event.venue = normalizeVenue(venueRes.data);
            event.venue_id = event.venue?.venue_id || event.venue_id;
        }

        return { success: true, data: event, message: '' };
    },

    async getFeaturedEvents(limit = 10) {
        const res = await this.getEvents();
        if (!res.success) return res;
        const featured = res.data.filter((e) => normalizeBool(e.is_featured_event) || normalizeBool(e.featured_event) || normalizeBool(e.is_featured));
        return { success: true, data: featured.slice(0, limit), message: '' };
    },

    async getEventsByCategory(categoryId, limit = 20) {
        return this.getEvents({ category_id: categoryId, limit });
    },

    async searchEvents(query) {
        return this.getEvents({ q: query });
    },

    async getCategory(categoryId) {
        const res = await apiRequest('/categories');
        if (!res.success) return res;
        const category = safeList(res).find((c) => String(c.category_id || c.CategoryID) === String(categoryId));
        if (!category) return { success: false, data: null, message: 'Không tìm th?y danh m?c' };
        return { success: true, data: normalizeCategory(category), message: '' };
    },

    async getCategories() {
        const res = await apiRequest('/categories');
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeCategory), message: '' };
    },

    async getVenues() {
        const res = await apiRequest('/venues');
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeVenue), message: '' };
    },

    async getVenueById(venueId) {
        const res = await apiRequest(`/venues/${venueId}`);
        if (!res.success) return res;
        return { success: true, data: normalizeVenue(res.data), message: '' };
    },

    async getPublicBanners() {
        return {
            success: true,
            data: getStaticAdsByPosition('HOME_TOP'),
            message: '',
        };
    },

    async getRecommendedEvents(eventId, limit = 8) {
        const [eventRes, allRes] = await Promise.all([this.getEvent(eventId), this.getEvents()]);
        if (!allRes.success) return allRes;

        const source = eventRes.success ? eventRes.data : null;
        const filtered = allRes.data
            .filter((e) => String(e.event_id) !== String(eventId))
            .filter((e) => (source ? String(e.category_id) === String(source.category_id) : true))
            .slice(0, limit);

        return { success: true, data: filtered, message: '' };
    },

    async getTicketTypes(eventId) {
        const res = await apiRequest('/ticket-types', { query: { EventID: eventId } });
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeTicketType), message: '' };
    },

};

