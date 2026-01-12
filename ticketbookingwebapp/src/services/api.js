// API service for backend communication
const API_BASE_URL = 'http://localhost:5000/api';

// Switch to real API now that backend is running
const USE_MOCK_DATA = false;

export const api = {
    // Get all events with optional filters
    async getEvents(params = {}) {
        if (USE_MOCK_DATA) {
            return mockData.getEvents(params);
        }

        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/events?${queryString}`);
        const data = await response.json();
        return data;
    },

    // Get single event by ID
    async getEvent(eventId) {
        if (USE_MOCK_DATA) {
            return mockData.getEvent(eventId);
        }

        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        const data = await response.json();
        return data;
    },

    // Get featured events
    async getFeaturedEvents(limit = 10) {
        if (USE_MOCK_DATA) {
            return mockData.getFeaturedEvents(limit);
        }

        const response = await fetch(`${API_BASE_URL}/events/featured?limit=${limit}`);
        const data = await response.json();
        return data;
    },

    // Get events by category
    async getEventsByCategory(categoryId, limit = 20) {
        if (USE_MOCK_DATA) {
            return mockData.getEventsByCategory(categoryId, limit);
        }

        const response = await fetch(`${API_BASE_URL}/events?category_id=${categoryId}&limit=${limit}`);
        const data = await response.json();
        return data;
    },

    // Search events
    async searchEvents(query) {
        if (USE_MOCK_DATA) {
            return mockData.searchEvents(query);
        }

        const response = await fetch(`${API_BASE_URL}/events/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data;
    },

    // Get all categories
    async getCategories() {
        if (USE_MOCK_DATA) {
            return mockData.getCategories();
        }

        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        return data;
    }
};

// Mock data service (temporary)
const mockData = {
    categories: [
        { category_id: 1, category_name: 'Nhạc sống', is_active: true },
        { category_id: 2, category_name: 'Sân khấu & Nghệ thuật', is_active: true },
        { category_id: 3, category_name: 'Thể Thao', is_active: true },
        { category_id: 4, category_name: 'Hội thảo & Workshop', is_active: true },
        { category_id: 5, category_name: 'Tham quan & Trải nghiệm', is_active: true },
        { category_id: 6, category_name: 'Khác', is_active: true }
    ],

    events: [
        {
            event_id: 1,
            category_id: 1,
            event_name: 'Chương trình Hòa nhạc Năm mới 2026',
            description: 'Đón chào năm mới với đêm hòa nhạc đặc sắc cùng dàn nhạc giao hưởng',
            start_datetime: '2025-12-31T20:00:00',
            banner_image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
            is_featured: true,
            status: 'PUBLISHED',
            category: { category_name: 'Nhạc sống' },
            venue: { venue_name: 'Nhà hát Hòa Bình', city: 'TP.HCM' },
            ticket_types: [{ type_name: 'VIP', price: 800000 }]
        },
        {
            event_id: 2,
            category_id: 1,
            event_name: 'Live Concert - Sơn Tùng M-TP',
            description: 'Đại nhạc hội của Sơn Tùng M-TP với những ca khúc hit đình đám',
            start_datetime: '2026-01-15T19:30:00',
            banner_image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
            is_featured: true,
            status: 'PUBLISHED',
            category: { category_name: 'Nhạc sống' },
            venue: { venue_name: 'Sân vận động Mỹ Đình', city: 'Hà Nội' },
            ticket_types: [{ type_name: 'VIP', price: 1500000 }]
        },
        {
            event_id: 3,
            category_id: 1,
            event_name: 'Đêm nhạc Trịnh Công Sơn',
            description: 'Tưởng nhớ nhạc sĩ Trịnh Công Sơn với những ca khúc bất hủ',
            start_datetime: '2026-01-20T20:00:00',
            banner_image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop',
            is_featured: false,
            status: 'PUBLISHED',
            category: { category_name: 'Nhạc sống' },
            venue: { venue_name: 'Nhà hát Lớn Hà Nội', city: 'Hà Nội' },
            ticket_types: [{ type_name: 'VIP', price: 500000 }]
        },
        {
            event_id: 4,
            category_id: 1,
            event_name: 'Festival Âm nhạc Quốc tế',
            description: 'Lễ hội âm nhạc quốc tế với sự tham gia của nhiều nghệ sĩ nổi tiếng',
            start_datetime: '2026-01-25T18:00:00',
            banner_image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
            is_featured: true,
            status: 'PUBLISHED',
            category: { category_name: 'Nhạc sống' },
            venue: { venue_name: 'Công viên Hoàng Văn Thụ', city: 'TP.HCM' },
            ticket_types: [{ type_name: 'General Admission', price: 0 }]
        },
        {
            event_id: 5,
            category_id: 1,
            event_name: 'Anh Trai "Say Hi" Concert 2026',
            description: 'Đại nhạc hội Anh Trai Say Hi với dàn line-up đình đám',
            start_datetime: '2026-02-10T19:00:00',
            banner_image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
            is_featured: true,
            status: 'PUBLISHED',
            category: { category_name: 'Nhạc sống' },
            venue: { venue_name: 'Sân vận động Quân khu 7', city: 'TP.HCM' },
            ticket_types: [{ type_name: 'VIP', price: 2000000 }]
        },
        {
            event_id: 6,
            category_id: 1,
            event_name: 'Liveshow Đen Vâu',
            description: 'Đêm nhạc của rapper Đen Vâu với những ca khúc đầy cảm xúc',
            start_datetime: '2026-02-18T19:30:00',
            banner_image_url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=300&fit=crop',
            is_featured: true,
            status: 'PUBLISHED',
            category: { category_name: 'Nhạc sống' },
            venue: { venue_name: 'Nhà thi đấu Phú Thọ', city: 'TP.HCM' },
            ticket_types: [{ type_name: 'VIP', price: 1000000 }]
        },
        {
            event_id: 7,
            category_id: 2,
            event_name: 'Kịch nói: Số Đỏ',
            description: 'Vở kịch kinh điển Số Đỏ của nhà văn Vũ Trọng Phụng',
            start_datetime: '2026-02-03T19:30:00',
            banner_image_url: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400&h=300&fit=crop',
            is_featured: false,
            status: 'PUBLISHED',
            category: { category_name: 'Sân khấu & Nghệ thuật' },
            venue: { venue_name: 'Nhà hát Kịch TP.HCM', city: 'TP.HCM' },
            ticket_types: [{ type_name: 'Standard', price: 200000 }]
        },
        {
            event_id: 8,
            category_id: 3,
            event_name: 'V.League: HAGL vs Hà Nội FC',
            description: 'Trận đấu đỉnh cao giữa HAGL và Hà Nội FC tại V.League 2026',
            start_datetime: '2026-02-06T18:00:00',
            banner_image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
            is_featured: true,
            status: 'PUBLISHED',
            category: { category_name: 'Thể Thao' },
            venue: { venue_name: 'Sân Pleiku', city: 'Gia Lai' },
            ticket_types: [{ type_name: 'VIP', price: 200000 }]
        }
    ],

    getCategories() {
        return {
            success: true,
            data: this.categories
        };
    },

    getEvents(params = {}) {
        let filteredEvents = [...this.events];

        if (params.category_id) {
            filteredEvents = filteredEvents.filter(e => e.category_id == params.category_id);
        }

        if (params.is_featured !== undefined) {
            filteredEvents = filteredEvents.filter(e => e.is_featured === params.is_featured);
        }

        const limit = params.limit || 20;
        const offset = params.offset || 0;

        return {
            success: true,
            data: filteredEvents.slice(offset, offset + limit),
            total: filteredEvents.length
        };
    },

    getEvent(eventId) {
        const event = this.events.find(e => e.event_id == eventId);
        return {
            success: true,
            data: event || null
        };
    },

    getFeaturedEvents(limit = 10) {
        const featured = this.events.filter(e => e.is_featured);
        return {
            success: true,
            data: featured.slice(0, limit)
        };
    },

    getEventsByCategory(categoryId, limit = 20) {
        const filtered = this.events.filter(e => e.category_id == categoryId);
        return {
            success: true,
            data: filtered.slice(0, limit)
        };
    },

    searchEvents(query) {
        const lowerQuery = query.toLowerCase();
        const results = this.events.filter(e =>
            e.event_name.toLowerCase().includes(lowerQuery) ||
            (e.description && e.description.toLowerCase().includes(lowerQuery))
        );
        return {
            success: true,
            data: results
        };
    }
};
