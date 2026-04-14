import { apiRequest } from './_compat';

const getValue = (...vals) => vals.find((v) => v !== undefined && v !== null);

const normalizeVenue = (venue = {}) => ({
    ...venue,
    venue_id: getValue(venue.venue_id, venue.VenueID),
    venue_name: getValue(venue.venue_name, venue.VenueName),
    address: getValue(venue.address, venue.Address),
    city: getValue(venue.city, venue.City),
    status: String(getValue(venue.status, venue.Status, 'ACTIVE')).toUpperCase(),
    capacity: Number(getValue(venue.capacity, venue.Capacity, 0)) || 0,
    seat_map: getValue(venue.seat_map, venue.SeatMap, null),
    seat_map_template: getValue(venue.seat_map_template, venue.seat_map, venue.SeatMap, null),
    is_active: !['INACTIVE', 'DISABLED'].includes(String(getValue(venue.status, venue.Status, 'ACTIVE')).toUpperCase()),
    map_embed_code: getValue(venue.map_embed_code, venue.MapEmbedCode, null),
});

const normalizeTicketType = (ticketType = {}) => ({
    ...ticketType,
    ticket_type_id: getValue(ticketType.ticket_type_id, ticketType.TicketTypeID),
    event_id: getValue(ticketType.event_id, ticketType.EventID),
    type_name: getValue(ticketType.type_name, ticketType.TypeName),
    price: Number(getValue(ticketType.price, ticketType.Price, 0)) || 0,
    sale_start_date: getValue(ticketType.sale_start_date, ticketType.SaleStartDate, null),
    sale_end_date: getValue(ticketType.sale_end_date, ticketType.SaleEndDate, null),
    status: String(getValue(ticketType.status, ticketType.Status, 'ACTIVE')).toUpperCase(),
    quantity: Number(getValue(ticketType.quantity, ticketType.Quantity, 0)) || 0,
});

const normalizeEvent = (event = {}) => ({
    ...event,
    event_id: getValue(event.event_id, event.EventID),
    event_name: getValue(event.event_name, event.EventName),
    description: getValue(event.description, event.Description, ''),
    category_id: getValue(event.category_id, event.CategoryID),
    venue_id: getValue(event.venue_id, event.VenueID, null),
    organizer_id: getValue(event.organizer_id, event.OrganizerID),
    manager_id: getValue(event.manager_id, event.ManagerID, event.organizer_id, event.OrganizerID),
    start_datetime: getValue(event.start_datetime, event.start_date, event.StartDate),
    end_datetime: getValue(event.end_datetime, event.end_date, event.EndDate),
    status: String(getValue(event.status, event.Status, 'DRAFT')).toUpperCase(),
    banner_image_url: getValue(event.banner_image_url, event.image_url, event.ImageURL, null),
    image_url: getValue(event.image_url, event.ImageURL, event.banner_image_url, null),
    category: event.category || event.Category || null,
    venue: event.venue ? normalizeVenue(event.venue) : (event.Venue ? normalizeVenue(event.Venue) : null),
    ticket_types: Array.isArray(event.ticket_types)
        ? event.ticket_types.map(normalizeTicketType)
        : (Array.isArray(event.TicketTypes) ? event.TicketTypes.map(normalizeTicketType) : []),
    qr_image_url: getValue(event.qr_image_url, event.qr_code_url, event.QRCodeURL, null),
});

const normalizeOrderTicket = (ticket = {}) => {
    const ticketStatus = String(
        getValue(ticket.ticket_status, ticket.TicketStatus, ticket.status, ticket.Status, 'ACTIVE')
    ).toUpperCase();
    const ticketTypeName = getValue(ticket.ticket_type_name, ticket.TicketTypeName, ticket.type_name, ticket.TypeName);
    return {
        ...ticket,
        ticket_id: getValue(ticket.ticket_id, ticket.TicketID),
        ticket_code: getValue(ticket.ticket_code, ticket.TicketCode, ticket.ticket_qrcode, ticket.TicketQRCode),
        ticket_type_name: ticketTypeName,
        type_name: ticketTypeName,
        seat_label: getValue(ticket.seat_label, ticket.SeatLabel),
        holder_name: getValue(ticket.holder_name, ticket.HolderName),
        price: Number(getValue(ticket.price, ticket.Price, ticket.ticket_price, ticket.TicketPrice, 0)) || 0,
        status: ticketStatus,
        ticket_status: ticketStatus,
    };
};

const normalizeOrder = (order) => ({
    ...order,
    order_id: getValue(order.order_id, order.OrderID),
    order_code: getValue(order.order_code, order.OrderCode),
    event_id: getValue(order.event_id, order.EventID),
    total_amount: Number(getValue(order.total_amount, order.TotalAmount, 0)) || 0,
    order_status: String(getValue(order.order_status, order.OrderStatus, order.status, order.Status, 'PENDING')).toUpperCase(),
    status: String(getValue(order.order_status, order.OrderStatus, order.status, order.Status, 'PENDING')).toUpperCase(),
    created_at: getValue(order.created_at, order.CreatedAt, order.order_date, order.OrderDate),
    customer_name: getValue(order.customer_name, order.CustomerName),
    customer_email: getValue(order.customer_email, order.CustomerEmail),
    customer_phone: getValue(order.customer_phone, order.CustomerPhone),
    event_name: getValue(order.event_name, order.EventName),
    tickets_count: Number(getValue(order.tickets_count, order.TicketsCount, 0)) || 0,
    ticket_count: Number(getValue(order.tickets_count, order.TicketsCount, 0)) || 0,
    revenue: Number(getValue(order.total_amount, order.TotalAmount, 0)) || 0,
    payment_method: getValue(order.payment_method, order.PaymentMethod, 'CASH'),
    tickets: (Array.isArray(order.tickets) ? order.tickets : (Array.isArray(order.Tickets) ? order.Tickets : []))
        .map(normalizeOrderTicket),
});

const normalizeTicketRow = (ticket, order) => ({
    ticket_id: getValue(ticket.ticket_id, ticket.TicketID),
    ticket_code: getValue(ticket.ticket_code, ticket.TicketCode, ticket.ticket_qrcode, ticket.TicketQRCode),
    ticket_status: String(getValue(ticket.ticket_status, ticket.TicketStatus, ticket.status, ticket.Status, 'ACTIVE')).toUpperCase(),
    event_id: order?.event_id,
    event_name: order?.event_name,
    order_id: order?.order_id,
    order_code: order?.order_code,
    ticket_type_name: getValue(ticket.ticket_type_name, ticket.TicketTypeName, ticket.type_name),
    holder_name: order?.customer_name,
    holder_email: order?.customer_email,
    price: Number(getValue(ticket.price, ticket.Price, ticket.ticket_price, ticket.TicketPrice, 0)) || 0,
    checked_in_at: getValue(ticket.checked_in_at, ticket.CheckedInAt, ticket.update_date, ticket.UpdateDate),
});

const filterByOrganizer = (events, organizerId) =>
    (events || []).filter((e) => String(getValue(e.organizer_id, e.OrganizerID, e.manager_id, e.ManagerID)) === String(organizerId));

const paginateList = (list, page = 1, limit = 10) => {
    const current = Number(page) > 0 ? Number(page) : 1;
    const size = Number(limit) > 0 ? Number(limit) : 10;
    const total = list.length;
    const start = (current - 1) * size;
    return {
        rows: list.slice(start, start + size),
        pagination: {
            page: current,
            limit: size,
            total,
            total_pages: Math.ceil(total / size) || 1,
        },
    };
};

export const organizerApi = {
    async getDashboardStats(managerId = 1, options = {}) {
        const [eventsRes, ordersRes] = await Promise.all([
            this.getOrganizerEvents(managerId),
            this.getOrders(managerId, { page: 1, limit: 200 }),
        ]);

        if (!eventsRes.success) return eventsRes;
        if (!ordersRes.success) return ordersRes;

        const month = Number(options.month || 0);
        const year = Number(options.year || 0);
        const inFilter = (input) => {
            if (!input || !month || !year) return true;
            const d = new Date(input);
            if (Number.isNaN(d.getTime())) return false;
            return d.getMonth() + 1 === month && d.getFullYear() === year;
        };

        const orders = (ordersRes.data || []).filter((o) => inFilter(o.created_at || o.CreatedAt || o.order_date));
        const events = (eventsRes.data || []).filter((e) => inFilter(e.start_datetime || e.start_date || e.StartDate));
        const eventById = Object.fromEntries(events.map((e) => [e.event_id, e]));
        const paidOrders = orders.filter((o) => o.order_status === 'PAID');

        const eventRevenueMap = {};
        paidOrders.forEach((order) => {
            const event = eventById[order.event_id];
            if (!event) return;
            if (!eventRevenueMap[order.event_id]) {
                eventRevenueMap[order.event_id] = {
                    event_id: order.event_id,
                    event_name: event.event_name || `Event #${order.event_id}`,
                    paid_orders: 0,
                    revenue: 0,
                };
            }
            eventRevenueMap[order.event_id].paid_orders += 1;
            eventRevenueMap[order.event_id].revenue += Number(order.total_amount || 0);
        });

        const byEventName = {};
        events.forEach((event) => {
            const key = String(event.event_name || '').trim().toLowerCase();
            if (!key) return;
            if (!byEventName[key]) {
                byEventName[key] = {
                    event_name: event.event_name,
                    show_count: 0,
                    latest_start_datetime: event.start_datetime || event.start_date || null,
                };
            }
            byEventName[key].show_count += 1;
            const current = new Date(byEventName[key].latest_start_datetime || 0).getTime();
            const candidate = new Date(event.start_datetime || event.start_date || 0).getTime();
            if (Number.isFinite(candidate) && candidate > current) {
                byEventName[key].latest_start_datetime = event.start_datetime || event.start_date || null;
            }
        });
        const multiShowEvents = Object.values(byEventName)
            .filter((x) => x.show_count > 1)
            .sort((a, b) => b.show_count - a.show_count);

        return {
            success: true,
            data: {
                total_events: events.length,
                total_revenue: paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
                total_tickets_sold: orders.reduce((sum, o) => sum + Number(o.tickets_count || 0), 0),
                recent_orders: orders.slice(0, 10),
                event_revenue_stats: Object.values(eventRevenueMap).sort((a, b) => b.revenue - a.revenue),
                multi_show_events: multiShowEvents,
            },
            message: '',
        };
    },

    async getOrganizerEvents(managerId = 1) {
        const res = await apiRequest('/events');
        if (!res.success) return res;
        const rows = (res.data || []).map(normalizeEvent);
        return { success: true, data: filterByOrganizer(rows, managerId), message: '' };
    },

    async createEvent(payload) {
        return apiRequest('/events', {
            method: 'POST',
            body: payload,
        });
    },

    async addShowtime(eventId, payload = {}) {
        return this.updateEvent(eventId, payload);
    },

    async updateEvent(eventId, payload = {}) {
        return apiRequest(`/events/${eventId}`, {
            method: 'PUT',
            body: payload,
        });
    },

    async deleteEvent(eventId) {
        return apiRequest(`/events/${eventId}`, { method: 'DELETE' });
    },

    async bulkDeleteEvents(payload = {}) {
        return apiRequest('/events/bulk-delete', {
            method: 'POST',
            body: payload,
        });
    },

    async getTicketTypes(eventId) {
        const res = await apiRequest('/ticket-types', { query: { EventID: eventId } });
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeTicketType), message: '' };
    },

    async createTicketType(payload = {}) {
        return apiRequest('/ticket-types', {
            method: 'POST',
            body: {
                EventID: payload.event_id || payload.EventID,
                TypeName: payload.type_name || payload.TypeName,
                Price: payload.price || payload.Price,
                SaleStartDate: payload.sale_start_date || payload.SaleStartDate,
                SaleEndDate: payload.sale_end_date || payload.SaleEndDate,
                Status: payload.status || payload.Status || 'ACTIVE',
                CreateID: payload.create_id || payload.CreateID || 1,
            },
        });
    },

    async updateTicketType(ticketTypeId, payload = {}) {
        return apiRequest(`/ticket-types/${ticketTypeId}`, {
            method: 'PUT',
            body: {
                TypeName: payload.type_name ?? payload.TypeName,
                Price: payload.price ?? payload.Price,
                SaleStartDate: payload.sale_start_date ?? payload.SaleStartDate,
                SaleEndDate: payload.sale_end_date ?? payload.SaleEndDate,
                Status: payload.status ?? payload.Status,
            },
        });
    },

    async deleteTicketType(ticketTypeId) {
        return apiRequest(`/ticket-types/${ticketTypeId}`, { method: 'DELETE' });
    },

    async processOrderCancellation(orderId, action) {
        return apiRequest(`/orders/${orderId}/refund-process`, {
            method: 'POST',
            body: { Action: action },
        });
    },

    async getEventOrders(eventId) {
        const orders = await apiRequest('/orders');
        if (!orders.success) return orders;

        const eventOrders = (orders.data || [])
            .map(normalizeOrder)
            .filter((o) => String(o.event_id) === String(eventId));

        const details = await Promise.all(
            eventOrders.map((o) => apiRequest(`/orders/${o.order_id}`))
        );

        const merged = eventOrders.map((order, idx) => {
            const detail = details[idx];
            if (detail?.success && detail.data) {
                const d = normalizeOrder(detail.data);
                return { ...order, ...d, tickets: d.tickets || [] };
            }
            return order;
        });

        return { success: true, data: merged, message: '' };
    },

    async approveRefund(orderId) {
        return this.processOrderCancellation(orderId, 'approve');
    },

    async rejectRefund(orderId) {
        return this.processOrderCancellation(orderId, 'reject');
    },

    async getRefundRequests(managerId) {
        const res = await apiRequest('/orders/refund-requests', {
            query: { ManagerID: managerId },
        });
        if (!res.success) return res;
        return {
            success: true,
            data: (res.data || []).map(normalizeOrder),
            message: '',
        };
    },

    async getOrganizerVenues(managerId) {
        const res = await apiRequest('/venues');
        if (!res.success) return res;
        let rows = (res.data || []).map(normalizeVenue);
        if (managerId) {
            rows = rows.filter((v) =>
                String(getValue(v.create_id, v.CreateID, v.manager_id, v.ManagerID, '')) === String(managerId)
            );
        }
        return { success: true, data: rows, message: '' };
    },

    async createVenue(payload = {}) {
        return apiRequest('/venues', {
            method: 'POST',
            body: {
                VenueName: payload.venue_name || payload.VenueName,
                Address: payload.address || payload.Address,
                City: payload.city || payload.City,
                Capacity: payload.capacity || payload.Capacity || 0,
                SeatMap: payload.seat_map_template || payload.seat_map || payload.SeatMap || null,
                Status: payload.status || payload.Status || 'ACTIVE',
                CreateID: payload.manager_id || payload.create_id || payload.CreateID || 1,
            },
        });
    },

    async getVenue(venueId) {
        const res = await apiRequest(`/venues/${venueId}`);
        if (!res.success) return res;
        return { success: true, data: normalizeVenue(res.data), message: '' };
    },

    async updateVenue(venueId, payload = {}) {
        return apiRequest(`/venues/${venueId}`, {
            method: 'PUT',
            body: {
                VenueName: payload.venue_name ?? payload.VenueName,
                Address: payload.address ?? payload.Address,
                City: payload.city ?? payload.City,
                Capacity: payload.capacity ?? payload.Capacity,
                Status: payload.status ?? payload.Status,
                SeatMap: payload.seat_map ?? payload.SeatMap,
            },
        });
    },

    async deleteVenue(venueId) {
        return apiRequest(`/venues/${venueId}`, { method: 'DELETE' });
    },

    async updateVenueSeats(venueId, payload = {}) {
        return apiRequest(`/venues/${venueId}/seat-map`, {
            method: 'PUT',
            body: {
                Capacity: payload.capacity ?? payload.Capacity,
                SeatMap: payload.seat_map_template ?? payload.seat_map ?? payload.SeatMap,
            },
        });
    },

    async searchTickets(keyword = '', managerId, selectedEvent = null, searchStatus = 'ALL') {
        const allOrdersRes = await apiRequest('/orders');
        if (!allOrdersRes.success) return allOrdersRes;

        const eventsRes = await this.getOrganizerEvents(managerId || 1);
        if (!eventsRes.success) return eventsRes;

        const organizerEventIds = new Set((eventsRes.data || []).map((e) => e.event_id));

        let orders = (allOrdersRes.data || [])
            .map(normalizeOrder)
            .filter((o) => organizerEventIds.has(o.event_id));

        if (selectedEvent) {
            orders = orders.filter((o) => String(o.event_id) === String(selectedEvent));
        }

        const details = await Promise.all(orders.map((o) => apiRequest(`/orders/${o.order_id}`)));

        let tickets = [];
        details.forEach((detail, idx) => {
            if (!detail?.success) return;
            const order = normalizeOrder(detail.data || orders[idx]);
            const rows = (order.tickets || []).map((t) => normalizeTicketRow(t, order));
            tickets.push(...rows);
        });

        if (searchStatus && searchStatus !== 'ALL') {
            tickets = tickets.filter((t) => t.ticket_status === String(searchStatus).toUpperCase());
        }

        const q = String(keyword || '').trim().toLowerCase();
        if (q) {
            tickets = tickets.filter((t) =>
                String(t.ticket_code || '').toLowerCase().includes(q) ||
                String(t.holder_name || '').toLowerCase().includes(q) ||
                String(t.holder_email || '').toLowerCase().includes(q)
            );
        }

        return { success: true, data: tickets, message: '' };
    },

    async checkInTicket(ticketCode, managerId) {
        const searchRes = await this.searchTickets(ticketCode, managerId, null, 'ACTIVE');
        if (!searchRes.success) return searchRes;

        const ticket = (searchRes.data || []).find((t) => String(t.ticket_code) === String(ticketCode));
        if (!ticket) {
            return { success: false, data: null, message: 'Không tìm th?y vé h?p l? d? check-in' };
        }

        const res = await apiRequest('/tickets/check-in', {
            method: 'POST',
            body: { TicketCode: ticketCode },
        });

        if (!res.success) return res;
        return { success: true, data: res.data, message: 'Check-in thành công' };
    },

    async getOrganizerStats(managerId = 1, options = {}) {
        return this.getDashboardStats(managerId, options);
    },

    async getOrders(managerId, options = {}) {
        const eventsRes = await this.getOrganizerEvents(managerId);
        if (!eventsRes.success) return eventsRes;
        const eventIds = new Set((eventsRes.data || []).map((e) => e.event_id));

        const ordersRes = await apiRequest('/orders');
        if (!ordersRes.success) return ordersRes;

        let orders = (ordersRes.data || [])
            .map(normalizeOrder)
            .filter((o) => eventIds.has(o.event_id));

        const searchText = String(options.search || '').trim().toLowerCase();
        if (searchText) {
            orders = orders.filter((o) =>
                String(o.order_code || '').toLowerCase().includes(searchText) ||
                String(o.customer_name || '').toLowerCase().includes(searchText) ||
                String(o.customer_email || '').toLowerCase().includes(searchText) ||
                String(o.event_name || '').toLowerCase().includes(searchText)
            );
        }

        // Enrich tickets for expandable rows in ManageOrders
        const details = await Promise.all(orders.map((o) => apiRequest(`/orders/${o.order_id}`)));
        const merged = orders.map((order, idx) => {
            const detail = details[idx];
            if (!detail?.success) return { ...order, Ticket: [] };
            const d = normalizeOrder(detail.data || {});
            const ticketRows = (d.tickets || []).map((t) => ({
                code: getValue(t.ticket_code, t.TicketCode, t.ticket_qrcode, t.TicketQRCode),
                event: order.event_name,
                type: getValue(t.ticket_type_name, t.TicketTypeName, t.type_name, 'N/A'),
                price: Number(getValue(t.price, t.Price, t.ticket_price, t.TicketPrice, 0)) || 0,
                status: String(getValue(t.ticket_status, t.TicketStatus, t.status, t.Status, 'ACTIVE')).toUpperCase(),
            }));
            return { ...order, Ticket: ticketRows };
        });

        const { rows, pagination } = paginateList(merged, options.page || 1, options.limit || 10);

        return {
            success: true,
            data: rows,
            pagination,
            message: '',
        };
    },

    async getDiscounts(managerId) {
        const [discountsRes, eventsRes] = await Promise.all([
            apiRequest('/discounts'),
            this.getOrganizerEvents(managerId || 1),
        ]);
        if (!discountsRes.success) return discountsRes;

        const events = eventsRes.success ? eventsRes.data || [] : [];
        const eventsById = Object.fromEntries(events.map((e) => [e.event_id, e]));
        const organizerEventIds = new Set(events.map((e) => e.event_id));

        const data = (discountsRes.data || [])
            .map((discount) => ({
                ...discount,
                id: getValue(discount.discount_id, discount.DiscountID),
                event_id: getValue(discount.event_id, discount.EventID),
                code: getValue(discount.code, discount.Code),
                name: getValue(discount.name, discount.discount_name, discount.description, discount.Description, 'Mã gi?m giá'),
                description: getValue(discount.description, discount.Description, ''),
                value: Number(getValue(discount.discount_amount, discount.DiscountAmount, 0)) || 0,
                discount_type: getValue(discount.discount_type, 'FIXED_AMOUNT'),
                start_date: getValue(discount.start_date, discount.StartDate),
                end_date: getValue(discount.end_date, discount.EndDate),
                status: String(getValue(discount.status, discount.Status, 'ACTIVE')).toUpperCase(),
                applies_all_events: Boolean(getValue(discount.applies_all_events, discount.AppliesAllEvents, false)),
                event_name: eventsById[getValue(discount.event_id, discount.EventID)]?.event_name || (
                    Boolean(getValue(discount.applies_all_events, discount.AppliesAllEvents, false))
                        ? 'Tất cả sự kiện'
                        : null
                ),
            }))
            .filter((d) => organizerEventIds.has(d.event_id));

        return { success: true, data, message: '' };
    },

    async createDiscount(payload = {}) {
        const body = {
            EventID: payload.event_id || payload.EventID,
            Code: payload.code || payload.Code,
            Description: payload.name || payload.description || payload.Description,
            DiscountAmount: payload.value ?? payload.discount_amount ?? payload.DiscountAmount ?? 0,
            StartDate: payload.start_date || payload.StartDate,
            EndDate: payload.end_date || payload.EndDate,
            Status: payload.status || payload.Status || 'ACTIVE',
            AppliesAllEvents: false,
            CreateID: payload.manager_id || payload.create_id || payload.CreateID || 1,
        };
        return apiRequest('/discounts', { method: 'POST', body });
    },

    async updateDiscount(discountId, payload = {}) {
        const body = {
            EventID: payload.event_id ?? payload.EventID,
            Code: payload.code ?? payload.Code,
            Description: payload.name ?? payload.description ?? payload.Description,
            DiscountAmount: payload.value ?? payload.discount_amount ?? payload.DiscountAmount,
            StartDate: payload.start_date ?? payload.StartDate,
            EndDate: payload.end_date ?? payload.EndDate,
            Status: payload.status ?? payload.Status,
            AppliesAllEvents: false,
        };
        return apiRequest(`/discounts/${discountId}`, { method: 'PUT', body });
    },

    async deleteDiscount(discountId) {
        return apiRequest(`/discounts/${discountId}`, { method: 'DELETE' });
    },

    async getOrganizerProfile(userId) {
        const [userRes, organizerRes] = await Promise.all([
            apiRequest(`/users/${userId}`),
            apiRequest(`/organizers/${userId}`),
        ]);

        if (!userRes.success && !organizerRes.success) {
            return { success: false, data: null, message: 'Không th? t?i h? so organizer' };
        }

        const user = userRes.data || {};
        const organizer = organizerRes.success ? organizerRes.data || {} : {};
        return {
            success: true,
            data: {
                user_id: user.user_id || user.UserID || userId,
                full_name: user.full_name || user.FullName || '',
                email: user.email || user.Email || '',
                contact_phone: user.phone || user.Phone || '',
                organization_name: organizer.organizer_name || organizer.OrganizerName || '',
                description: organizer.description || organizer.Description || '',
                logo_url: organizer.logo_url || organizer.LogoURL || null,
            },
            message: '',
        };
    },

    async updateOrganizerProfile(userId, payload = {}) {
        let profile = payload;
        if (typeof FormData !== 'undefined' && payload instanceof FormData) {
            profile = {
                organization_name: payload.get('organization_name'),
                description: payload.get('description'),
                contact_phone: payload.get('contact_phone'),
                full_name: payload.get('full_name'),
                logo_url: null,
            };
        }

        const [userUpdateRes, organizerUpdateRes] = await Promise.all([
            apiRequest(`/users/${userId}`, {
                method: 'PATCH',
                body: {
                    Phone: profile.contact_phone,
                    FullName: profile.full_name,
                },
            }),
            apiRequest(`/organizers/${userId}`, {
                method: 'PATCH',
                body: {
                    OrganizerName: profile.organization_name,
                    Description: profile.description,
                    LogoURL: profile.logo_url,
                },
            }),
        ]);

        if (!userUpdateRes.success && !organizerUpdateRes.success) {
            return { success: false, data: null, message: 'Không th? c?p nh?t h? so organizer' };
        }
        return { success: true, data: { user: userUpdateRes.data, organizer: organizerUpdateRes.data }, message: '' };
    },
};

