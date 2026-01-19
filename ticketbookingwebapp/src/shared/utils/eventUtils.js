import { BASE_URL } from '@shared/constants';

/**
 * Parse datetime string as local time (Vietnam timezone)
 * Prevents timezone conversion issues that cause dates to shift
 * @param {string} datetimeString - DateTime string from backend (e.g., "2026-01-20 19:30:00")
 * @returns {Date} - Date object in local timezone
 */
export const parseLocalDateTime = (datetimeString) => {
    if (!datetimeString) return null;

    // Remove 'Z' or timezone info if present to force local interpretation
    const cleanString = datetimeString.replace('Z', '').replace(/[+-]\d{2}:\d{2}$/, '');

    // Parse as local time
    const date = new Date(cleanString);

    // Validate the date
    if (isNaN(date.getTime())) {
        console.warn('Invalid datetime string:', datetimeString);
        return null;
    }

    return date;
};

export const getImageUrl = (path, placeholder = 'https://via.placeholder.com/800x450?text=TicketBooking') => {
    if (!path) return placeholder;
    // Return external URLs (http/https) as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // Static assets from frontend public folder (e.g., banners)
    if (path.startsWith('/banners/')) return path;

    // Backend uploads: Normalize path and append BASE_URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_URL}${cleanPath}`;
};

export const transformEvent = (event) => {
    const startDate = parseLocalDateTime(event.start_datetime);
    return {
        id: event.event_id,
        title: event.event_name,
        date: startDate ? startDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'TBA',
        location: event.venue ? `${event.venue.venue_name}, ${event.venue.city}` : 'TBA',
        image: getImageUrl(event.banner_image_url),
        price: (() => {
            if (!event.ticket_types || event.ticket_types.length === 0) return 'TBA';
            const minPrice = Math.min(...event.ticket_types.map(t => t.price));
            return minPrice === 0 ? 'Miễn phí' : `${minPrice.toLocaleString('vi-VN')}đ`;
        })(),
        badge: event.is_featured ? 'Hot' : null
    };
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};
