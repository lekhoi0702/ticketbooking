import { apiRequest, unsupported } from './_compat';
import { STATIC_ADS } from '@shared/constants/staticAds';
import { isFeaturedByTime } from '@shared/utils/eventUtils';

const flattenAds = () => Object.values(STATIC_ADS).flat();
const pickValue = (...values) => values.find((v) => v !== undefined && v !== null);

const normalizeRole = (user) => {
    const roleName = String(user.role_name || user.RoleName || '').toLowerCase();
    const roleId = Number(user.role_id ?? user.RoleID);
    if (roleId === 1 || roleName.includes('admin')) return 'ADMIN';
    if (roleId === 2 || roleName.includes('organizer')) return 'ORGANIZER';
    return 'USER';
};

const normalizeUser = (user) => {
    const status = String(user.status || user.Status || '').toUpperCase();
    return {
        ...user,
        user_id: pickValue(user.user_id, user.UserID),
        full_name: pickValue(user.full_name, user.FullName),
        email: pickValue(user.email, user.Email),
        phone: pickValue(user.phone, user.Phone),
        status,
        role: normalizeRole(user),
        is_active: !['LOCKED', 'INACTIVE', 'DISABLED', 'BANNED'].includes(status),
        created_at: user.create_date || user.CreateDate || null,
    };
};

const normalizeEvent = (event) => ({
    ...event,
    event_id: pickValue(event.event_id, event.EventID),
    event_name: pickValue(event.event_name, event.EventName),
    status: String(pickValue(event.status, event.Status, 'DRAFT')).toUpperCase(),
    category_id: pickValue(event.category_id, event.CategoryID),
    venue_id: pickValue(event.venue_id, event.VenueID),
    organizer_id: pickValue(event.organizer_id, event.OrganizerID),
    organizer_name: pickValue(
        event.organizer_name,
        event.OrganizerName,
        event.organizer?.organizer_name,
        event.Organizer?.OrganizerName,
        'N/A'
    ),
    banner_image_url: pickValue(event.banner_image_url, event.image_url, event.ImageURL, null),
    start_datetime: pickValue(event.start_datetime, event.start_date, event.StartDate, null),
    end_datetime: pickValue(event.end_datetime, event.end_date, event.EndDate, null),
    is_featured: isFeaturedByTime({
        start_datetime: pickValue(event.start_datetime, event.start_date, event.StartDate, null),
        end_datetime: pickValue(event.end_datetime, event.end_date, event.EndDate, null),
    }),
    is_favorite: Boolean(pickValue(event.is_favorite, event.IsFavorite, false)),
    category: event.category || event.Category || null,
    venue: event.venue || event.Venue || null,
    ticket_types: Array.isArray(event.ticket_types)
        ? event.ticket_types
        : (Array.isArray(event.TicketTypes) ? event.TicketTypes : []),
});

const normalizeOrder = (order) => ({
    ...order,
    order_id: pickValue(order.order_id, order.OrderID),
    user_id: pickValue(order.user_id, order.UserID),
    event_id: pickValue(order.event_id, order.EventID),
    order_code: pickValue(order.order_code, order.OrderCode),
    created_at: pickValue(order.created_at, order.CreatedAt, order.order_date, order.OrderDate),
    total_amount: Number(pickValue(order.total_amount, order.TotalAmount, 0)) || 0,
    order_status: String(
        pickValue(order.order_status, order.OrderStatus, order.status, order.Status, 'PENDING')
    ).toUpperCase(),
    customer_name: pickValue(order.customer_name, order.CustomerName),
    customer_email: pickValue(order.customer_email, order.CustomerEmail),
    customer_phone: pickValue(order.customer_phone, order.CustomerPhone),
    event_name: pickValue(order.event_name, order.EventName),
    payment_method: pickValue(order.payment_method, order.PaymentMethod, 'CASH'),
    tickets_count: Number(pickValue(order.tickets_count, order.TicketsCount, 0)) || 0,
});

const normalizeCategory = (category) => {
    const status = String(category.status || category.Status || '').toUpperCase();
    return {
        ...category,
        display_order: category.display_order ?? category.DisplayOrder ?? category.category_id ?? category.CategoryID ?? 1,
        is_active: !['HIDDEN', 'INACTIVE', 'DISABLED'].includes(status),
        category_id: pickValue(category.category_id, category.CategoryID),
        category_name: pickValue(category.category_name, category.CategoryName),
    };
};

const normalizeDiscount = (discount) => ({
    ...discount,
    id: pickValue(discount.id, discount.discount_id, discount.DiscountID),
    event_id: pickValue(discount.event_id, discount.EventID, null),
    applies_all_events: Boolean(pickValue(discount.applies_all_events, discount.AppliesAllEvents, false)),
    code: discount.code || discount.Code || discount.discount_code,
    name: discount.name || discount.description || discount.Description || discount.discount_name || 'Ma giam gia',
    value: Number(pickValue(discount.value, discount.discount_amount, discount.DiscountAmount, discount.discount_value, 0)),
    start_date: discount.start_date || discount.StartDate || null,
    status: String(pickValue(discount.status, discount.Status, 'ACTIVE')).toUpperCase(),
    discount_code: discount.discount_code || discount.code || discount.Code,
    discount_name: discount.discount_name || discount.name || discount.description || discount.Description || 'Ma giam gia',
    discount_type: discount.discount_type || 'FIXED_AMOUNT',
    discount_value: Number(discount.discount_value ?? discount.discount_amount ?? discount.DiscountAmount ?? 0),
    usage_limit: discount.usage_limit ?? 0,
    used_count: discount.used_count ?? 0,
    end_date: discount.end_date || discount.EndDate || null,
});

export const adminApi = {
    async getAdminStats() {
        const [usersRes, eventsRes, ordersRes] = await Promise.all([
            this.getAllUsers(),
            apiRequest('/events'),
            this.getAllAdminOrders(),
        ]);

        if (!usersRes.success && !eventsRes.success && !ordersRes.success) {
            return { success: false, data: null, message: 'Không thể tải thống kê' };
        }

        const orders = ordersRes.data || [];
        const totalRevenue = orders
            .filter((o) => String(o.order_status || '').toUpperCase() === 'PAID')
            .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

        return {
            success: true,
            data: {
                total_users: (usersRes.data || []).length,
                total_events: (eventsRes.data || []).length,
                total_orders: orders.length,
                total_revenue: totalRevenue,
            },
            message: '',
        };
    },

    async getAllUsers() {
        const res = await apiRequest('/users');
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeUser), message: '' };
    },

    async createUser(userData) {
        const roleInput = String(userData.role || userData.Role || '').toUpperCase();
        const roleIdFromName =
            roleInput === 'ADMIN'
                ? 1
                : roleInput === 'ORGANIZER'
                    ? 2
                    : roleInput === 'USER'
                        ? 3
                        : null;
        const roleId = userData.role_id || userData.RoleID || roleIdFromName || 3;

        return apiRequest('/auth/register', {
            method: 'POST',
            body: {
                Password: userData.password || userData.Password,
                RoleID: roleId,
                Email: userData.email || userData.Email,
                Phone: userData.phone || userData.Phone || '',
                FullName: userData.full_name || userData.FullName,
                Status: userData.status || userData.Status || 'ACTIVE',
                CreateID: userData.create_id || userData.CreateID || 1,
            },
        });
    },

    async resetUserPassword(userId) {
        const res = await apiRequest(`/users/${userId}/reset-password`, { method: 'POST' });
        if (!res.success) return res;
        return {
            success: true,
            data: {
                user_id: res.data.user_id || res.data.UserID,
                email: res.data.email || res.data.Email,
                full_name: res.data.full_name || res.data.FullName,
                new_password: res.data.new_password || res.data.NewPassword,
            },
            message: '',
        };
    },

    async toggleUserLock(userId, shouldLock) {
        return apiRequest(`/users/${userId}`, {
            method: 'PATCH',
            body: {
                Status: shouldLock ? 'LOCKED' : 'ACTIVE',
            },
        });
    },

    async getAllAdminEvents() {
        const res = await apiRequest('/events');
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeEvent), message: '' };
    },

    async getEventShowtimes(eventId) {
        const res = await apiRequest(`/events/${eventId}`);
        if (!res.success) return res;
        return { success: true, data: [res.data], message: '' };
    },

    async adminUpdateEventStatus(eventId, payload = {}) {
        return apiRequest(`/events/${eventId}`, {
            method: 'PATCH',
            body: {
                Status: payload.status ?? payload.Status,
                IsFavorite: payload.is_favorite ?? payload.IsFavorite,
            },
        });
    },

    async adminDeleteEvent(eventId) {
        return apiRequest(`/events/${eventId}`, { method: 'DELETE' });
    },

    async confirmCashPayment(orderId) {
        return apiRequest(`/orders/${orderId}/confirm-cash`, { method: 'POST' });
    },

    async getAllAdminOrders() {
        const res = await apiRequest('/orders');
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeOrder), message: '' };
    },

    async processOrderCancellation(orderId, action) {
        return apiRequest(`/orders/${orderId}/refund-process`, {
            method: 'POST',
            body: { Action: action },
        });
    },

    async getAllVenues() {
        return apiRequest('/venues');
    },

    async updateVenueStatus(venueId, status) {
        return apiRequest(`/venues/${venueId}`, {
            method: 'PUT',
            body: { Status: status },
        });
    },

    async getAdminCategories() {
        const res = await apiRequest('/categories');
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeCategory), message: '' };
    },

    async createCategory(payload = {}) {
        const res = await apiRequest('/categories', {
            method: 'POST',
            body: {
                CategoryName: payload.category_name || payload.CategoryName,
                Status: payload.status || payload.Status || 'ACTIVE',
                CreateID: payload.create_id || payload.CreateID || 1,
            },
        });
        if (!res.success) return res;
        return { success: true, data: normalizeCategory(res.data), message: '' };
    },

    async updateCategory(categoryId, payload = {}) {
        const res = await apiRequest(`/categories/${categoryId}`, {
            method: 'PUT',
            body: {
              CategoryName: payload.category_name ?? payload.CategoryName,
              Status: payload.status ?? payload.Status,
              ...(payload.display_order !== undefined && { DisplayOrder: payload.display_order }),
            },
        });
        if (!res.success) return res;
        return { success: true, data: normalizeCategory(res.data), message: '' };
    },

    async deleteCategory(categoryId) {
        return apiRequest(`/categories/${categoryId}`, { method: 'DELETE' });
    },
    async saveCategoryOrder(orderedCategories = []) {
      const results = await Promise.allSettled(
        orderedCategories.map((cat, index) =>
          apiRequest(`/categories/${cat.category_id}`, {
            method: 'PUT',
            body: { DisplayOrder: index + 1 },
          })
        )
      );
      const failed = results.filter((r) => r.status === 'rejected' || r.value?.success === false);
      if (failed.length > 0) {
        return { success: false, message: `${failed.length} thể loại không thể cập nhật` };
      }
      return { success: true, message: '' };
    },
    async getBanners() {
        return { success: true, data: flattenAds(), message: '' };
    },

    async createBanner() {
        return unsupported('Backend mới không dùng bảng banner.');
    },

    async updateBanner() {
        return unsupported('Backend mới không dùng bảng banner.');
    },

    async deleteBanner() {
        return unsupported('Backend mới không dùng bảng banner.');
    },

    async getAllDiscounts(eventId = null) {
        const res = await apiRequest('/discounts', { query: eventId ? { EventID: eventId } : undefined });
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeDiscount), message: '' };
    },

    async getEventDiscounts(eventId) {
        const res = await apiRequest('/discounts', { query: { EventID: eventId } });
        if (!res.success) return res;
        return { success: true, data: (res.data || []).map(normalizeDiscount), message: '' };
    },

    async createAdminDiscount(payload = {}) {
        return apiRequest('/discounts', {
            method: 'POST',
            body: {
                EventID: payload.event_id ?? payload.EventID ?? null,
                AppliesAllEvents: Boolean(payload.applies_all_events ?? payload.AppliesAllEvents ?? false),
                Code: payload.code || payload.Code,
                Description: payload.name || payload.description || payload.Description,
                DiscountAmount: payload.value ?? payload.discount_amount ?? payload.DiscountAmount ?? 0,
                StartDate: payload.start_date || payload.StartDate,
                EndDate: payload.end_date || payload.EndDate,
                Status: payload.status || payload.Status || 'ACTIVE',
                CreateID: payload.create_id || payload.CreateID || 1,
            },
        });
    },

    async updateAdminDiscount(discountId, payload = {}) {
        return apiRequest(`/discounts/${discountId}`, {
            method: 'PUT',
            body: {
                EventID: payload.event_id ?? payload.EventID,
                AppliesAllEvents: payload.applies_all_events ?? payload.AppliesAllEvents,
                Code: payload.code ?? payload.Code,
                Description: payload.name ?? payload.description ?? payload.Description,
                DiscountAmount: payload.value ?? payload.discount_amount ?? payload.DiscountAmount,
                StartDate: payload.start_date ?? payload.StartDate,
                EndDate: payload.end_date ?? payload.EndDate,
                Status: payload.status ?? payload.Status,
            },
        });
    },

    async deleteAdminDiscount(discountId) {
        return apiRequest(`/discounts/${discountId}`, { method: 'DELETE' });
    },
};



