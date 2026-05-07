import { apiRequest } from './_compat';

const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const pickValue = (...values) => values.find((v) => v !== undefined && v !== null);

const buildOrderCode = () => `TB${Date.now()}`;

const parseDateTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const isTicketTypeInSaleWindow = (ticketType) => {
    const now = new Date();
    const saleStart = parseDateTime(ticketType.sale_start_date || ticketType.SaleStartDate);
    const saleEnd = parseDateTime(ticketType.sale_end_date || ticketType.SaleEndDate);

    if (!saleStart || !saleEnd) {
        return { ok: false, message: 'Loại vé chưa cấu hình thời gian mở bán/kết thúc bán.' };
    }
    if (now < saleStart) {
        return { ok: false, message: 'Vé chưa đến thời gian mở bán.' };
    }
    if (now > saleEnd) {
        return { ok: false, message: 'Vé đã hết thời gian bán.' };
    }
    return { ok: true, message: '' };
};

const normalizeOrder = (order) => ({
    ...order,
    order_id: order.order_id || order.OrderID,
    user_id: order.user_id || order.UserID,
    event_id: order.event_id || order.EventID,
    order_code: order.order_code || order.OrderCode,
    created_at: order.created_at || order.CreatedAt || order.order_date || order.OrderDate,
    total_amount: toNumber(order.total_amount || order.TotalAmount || 0),
    final_amount: toNumber(order.final_amount || order.FinalAmount || order.total_amount || order.TotalAmount || 0),
    order_status: String(order.order_status || order.OrderStatus || order.status || order.Status || 'PENDING').toUpperCase(),
    customer_name: order.customer_name || order.CustomerName || null,
    customer_email: order.customer_email || order.CustomerEmail || null,
    customer_phone: order.customer_phone || order.CustomerPhone || null,
    event_name: order.event_name || order.EventName || null,
    event_date: order.event_date || order.EventDate || null,
    venue_name: order.venue_name || order.VenueName || null,
    payment_method: order.payment_method || order.PaymentMethod || 'CASH',
    tickets_count: toNumber(order.tickets_count || order.TicketsCount || 0),
    can_refund: String(order.order_status || order.OrderStatus || order.status || '').toUpperCase() === 'PAID',
    is_sale_active: String(order.order_status || order.OrderStatus || order.status || '').toUpperCase() === 'PAID',
});

const normalizeTicket = (ticket, order) => ({
    ...(ticket || {}),
    seat: ticket?.seat || ticket?.Seat || (() => {
        const rawSeat = pickValue(ticket?.seat_name, ticket?.SeatName);
        if (!rawSeat || typeof rawSeat !== 'string') return null;
        const trimmed = rawSeat.trim();
        const match = trimmed.match(/^([A-Za-z]+)\s*([0-9]+)$/);
        if (!match) return null;
        return {
            row_name: match[1].toUpperCase(),
            seat_number: match[2],
        };
    })(),
    ticket_id: ticket.ticket_id || ticket.TicketID,
    ticket_code: ticket.ticket_code || ticket.TicketCode || ticket.ticket_qrcode || ticket.TicketQRCode,
    ticket_status: String(ticket.ticket_status || ticket.TicketStatus || ticket.status || ticket.Status || 'ACTIVE').toUpperCase(),
    ticket_type_name: ticket.ticket_type_name || ticket.TicketTypeName || null,
    seat_name: ticket.seat_name || ticket.SeatName || null,
    seat_label: ticket.seat_label || ticket.SeatLabel || ticket.seat_name || ticket.SeatName || null,
    seat_id: ticket.seat_id || ticket.SeatID || null,
    price: toNumber(ticket.price || ticket.Price || ticket.ticket_price || ticket.TicketPrice || 0),
    order_id: order?.order_id,
    order_code: order?.order_code,
    order_status: order?.order_status,
    event_id: order?.event_id,
    event_name: order?.event_name,
    event_date: order?.event_date || null,
    venue_name: order?.venue_name || null,
});

const enrichOrdersWithEvents = async (orders = []) => {
    const normalizedOrders = orders.map(normalizeOrder);
    const uniqueEventIds = [...new Set(normalizedOrders.map((o) => o.event_id).filter(Boolean))];

    if (uniqueEventIds.length === 0) return normalizedOrders;

    const details = await Promise.all(
        uniqueEventIds.map((eventId) => apiRequest(`/events/${eventId}`))
    );

    const eventMap = {};
    details.forEach((res, idx) => {
        if (!res.success || !res.data) return;
        const eventId = uniqueEventIds[idx];
        const event = res.data || {};
        const venue = event.venue || event.Venue || null;
        eventMap[eventId] = {
            event_name: event.event_name || event.EventName || null,
            event_date: event.start_datetime || event.start_date || event.StartDate || null,
            venue_name: venue?.venue_name || venue?.VenueName || null,
            event,
        };
    });

    return normalizedOrders.map((order) => {
        const mapped = eventMap[order.event_id] || {};
        return {
            ...order,
            event_name: order.event_name || mapped.event_name || order.event_name,
            event_date: order.event_date || mapped.event_date || null,
            venue_name: order.venue_name || mapped.venue_name || null,
            event: mapped.event || null,
        };
    });
};

const createTicketsForOrder = async (order, payload = {}) => {
    const selectedTickets = Array.isArray(payload.tickets) ? payload.tickets : [];
    if (selectedTickets.length === 0) return [];

    const ticketTypesRes = await apiRequest('/ticket-types', { query: { EventID: order.event_id } });
    const ticketTypeMap = {};
    (ticketTypesRes.success ? ticketTypesRes.data || [] : []).forEach((tt) => {
        ticketTypeMap[Number(tt.ticket_type_id || tt.TicketTypeID)] = tt;
    });

    const usedSeatIds = new Set();

    const created = [];

    for (const item of selectedTickets) {
        const ticketTypeId = Number(item.ticket_type_id || item.TicketTypeID);
        const quantity = toNumber(item.quantity || item.Quantity, 0);
        if (!ticketTypeId || quantity <= 0) continue;

        const ticketType = ticketTypeMap[ticketTypeId] || {};
        const unitPrice = toNumber(ticketType.price || ticketType.Price, 0);

        const preferredSeatIds = (item.seat_ids || item.SeatIDs || [])
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0);

        const assignedSeatIds = [];
        preferredSeatIds.forEach((id) => {
            if (assignedSeatIds.length < quantity && !usedSeatIds.has(id)) {
                assignedSeatIds.push(id);
                usedSeatIds.add(id);
            }
        });

        if (assignedSeatIds.length < quantity) {
            throw new Error('Moi ve checkout bat buoc phai co ghe hop le.');
        }

        for (let i = 0; i < assignedSeatIds.length; i += 1) {
            const seatId = assignedSeatIds[i];
            const suffix = `${Date.now().toString().slice(-6)}${i}`;
            const ticketCode = `${order.order_code}-${ticketTypeId}-${suffix}`;
            const ticketRes = await apiRequest('/tickets', {
                method: 'POST',
                body: {
                    OrderID: order.order_id,
                    SeatID: seatId,
                    TicketTypeID: ticketTypeId,
                    TicketPrice: unitPrice,
                    TicketQRCode: ticketCode,
                    Status: 'ACTIVE',
                    CreateID: payload.user_id || payload.create_id || 1,
                },
            });

            if (ticketRes.success && ticketRes.data) {
                created.push(ticketRes.data);
            }
        }
    }

    return created;
};

export const orderApi = {
    async createOrder(orderData = {}) {
        const eventId = orderData.event_id || orderData.EventID;
        if (!eventId) {
            return { success: false, data: null, message: 'Thieu EventID de tao don hang' };
        }

        const selectedTickets = Array.isArray(orderData.tickets) ? orderData.tickets : [];
        if (selectedTickets.length === 0) {
            return { success: false, data: null, message: 'Vui long chon ghe truoc khi checkout.' };
        }

        const ticketTypesRes = await apiRequest('/ticket-types', { query: { EventID: eventId } });
        if (!ticketTypesRes.success) {
            return { success: false, data: null, message: ticketTypesRes.message || 'Khong tai duoc danh sach loai ve.' };
        }
        const ticketTypeMap = {};
        (ticketTypesRes.data || []).forEach((tt) => {
            ticketTypeMap[Number(tt.ticket_type_id || tt.TicketTypeID)] = tt;
        });

        for (const item of selectedTickets) {
            const quantity = toNumber(item.quantity || item.Quantity, 0);
            const ticketTypeId = Number(item.ticket_type_id || item.TicketTypeID);
            const seatIds = (item.seat_ids || item.SeatIDs || [])
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id) && id > 0);
            const ticketType = ticketTypeMap[ticketTypeId];
            if (!ticketType) {
                return { success: false, data: null, message: 'Loai ve khong ton tai.' };
            }
            const saleWindowCheck = isTicketTypeInSaleWindow(ticketType);
            if (!saleWindowCheck.ok) {
                return {
                    success: false,
                    data: null,
                    message: `${ticketType.type_name || ticketType.TypeName || 'Loai ve'}: ${saleWindowCheck.message}`,
                };
            }
            if (quantity <= 0 || seatIds.length < quantity) {
                return { success: false, data: null, message: 'Moi loai ve phai chon du so ghe truoc khi checkout.' };
            }
        }

        const payload = {
            UserID: orderData.user_id,
            EventID: eventId,
            TotalAmount: toNumber(orderData.total_amount || orderData.TotalAmount || 0),
            OrderCode: orderData.order_code || buildOrderCode(),
            CreateID: orderData.user_id || orderData.create_id || 1,
            Status: (orderData.status || 'PENDING').toUpperCase(),
        };

        const res = await apiRequest('/orders', {
            method: 'POST',
            body: payload,
        });

        if (!res.success) return res;
        const normalized = normalizeOrder(res.data || {});

        const createdTickets = await createTicketsForOrder(normalized, orderData);

        return {
            success: true,
            data: {
                order: normalized,
                tickets: createdTickets,
                ...normalized,
            },
            message: 'Tao don hang thanh cong',
        };
    },

    async getOrder(orderId) {
        const res = await apiRequest(`/orders/${orderId}`);
        if (!res.success) return res;

        const baseOrder = normalizeOrder(res.data || {});
        const [enrichedOrder] = await enrichOrdersWithEvents([baseOrder]);
        const ticketsRaw = res.data?.tickets || res.data?.Tickets || [];
        const paymentsRaw = res.data?.payments || res.data?.Payments || [];

        return {
            success: true,
            data: {
                ...enrichedOrder,
                order: enrichedOrder,
                event: enrichedOrder.event || null,
                tickets: ticketsRaw.map((t) => normalizeTicket(t, enrichedOrder)),
                payment: paymentsRaw[0] || null,
            },
            message: '',
        };
    },

    async getOrderByCode(orderCode) {
        const listRes = await apiRequest('/orders');
        if (!listRes.success) return listRes;
        const found = (listRes.data || []).find((o) => String(o.order_code || o.OrderCode) === String(orderCode));
        if (!found) return { success: false, data: null, message: 'Khong tim thay don hang' };
        return this.getOrder(found.order_id || found.OrderID);
    },

    async getUserOrders(userId) {
        const res = await apiRequest('/orders', { query: { UserID: userId } });
        if (!res.success) return res;
        const enriched = await enrichOrdersWithEvents(res.data || []);
        return { success: true, data: enriched, message: '' };
    },

    async getUserTickets(userId) {
        const ordersRes = await this.getUserOrders(userId);
        if (!ordersRes.success) return ordersRes;

        const seatsByEventId = {};
        const tickets = [];
        for (const order of ordersRes.data || []) {
            const tRes = await apiRequest('/tickets', { query: { OrderID: order.order_id } });
            if (!seatsByEventId[order.event_id]) {
                const sRes = await apiRequest('/seats', { query: { EventID: order.event_id } });
                const seatMap = {};
                if (sRes.success && Array.isArray(sRes.data)) {
                    sRes.data.forEach((s) => {
                        const seatId = s.seat_id || s.SeatID;
                        if (!seatId) return;
                        seatMap[String(seatId)] = {
                            seat_id: seatId,
                            row_name: s.row_name || s.row_number || s.RowNumber || null,
                            seat_number: s.seat_number || s.SeatNumber || null,
                            seat_label: s.seat_label || s.SeatLabel || null,
                        };
                    });
                }
                seatsByEventId[order.event_id] = seatMap;
            }
            if (tRes.success && Array.isArray(tRes.data)) {
                const seatMap = seatsByEventId[order.event_id] || {};
                tickets.push(
                    ...tRes.data.map((t) => {
                        const normalized = normalizeTicket(t, order);
                        const seatInfo = seatMap[String(normalized.seat_id)];
                        if (seatInfo) {
                            normalized.seat = {
                                row_name: seatInfo.row_name,
                                seat_number: seatInfo.seat_number,
                            };
                            normalized.seat_label = seatInfo.seat_label || `${seatInfo.row_name || ''}${seatInfo.seat_number || ''}`.trim() || null;
                            normalized.seat_name = normalized.seat_label;
                        }
                        return normalized;
                    })
                );
            }
        }

        return { success: true, data: tickets, message: '' };
    },

    async cancelOrder(orderId) {
        return apiRequest(`/orders/${orderId}/refund-request`, { method: 'POST' });
    },

    async cancelRefundRequest(orderId) {
        return apiRequest(`/orders/${orderId}/refund-cancel`, { method: 'POST' });
    },

    async checkDiscount(data = {}) {
        const code = data.code || data.Code;
        const eventId = data.event_id || data.EventID;
        if (!code) return { success: false, data: null, message: 'Vui long nhap ma giam gia' };
        if (!eventId) return { success: false, data: null, message: 'Thieu event_id de kiem tra ma giam gia' };

        const discountsRes = await apiRequest('/discounts', {
            query: {
                Code: code,
                EventID: eventId,
            },
        });
        if (!discountsRes.success) return discountsRes;

        const found = (discountsRes.data || []).find(
            (d) => String(d.code || d.Code || '').toLowerCase() === String(code).toLowerCase()
        );
        if (!found) return { success: false, data: null, message: 'Ma giam gia khong hop le' };

        const now = Date.now();
        const start = found.start_date ? new Date(found.start_date).getTime() : new Date(found.StartDate || 0).getTime();
        const end = found.end_date ? new Date(found.end_date).getTime() : new Date(found.EndDate || Number.MAX_SAFE_INTEGER).getTime();
        if (now < start || now > end) {
            return { success: false, data: null, message: 'Ma giam gia da het han hoac chua den thoi gian ap dung' };
        }

        return {
            success: true,
            discount_amount: toNumber(found.discount_amount || found.DiscountAmount),
            data: found,
            message: 'Ap dung ma giam gia thanh cong',
        };
    },

    async releaseSeats() {
        return { success: true, data: null, message: '' };
    },
};
