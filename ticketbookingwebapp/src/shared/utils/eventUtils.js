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

// Default placeholder - using data URI to avoid external dependency
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"%3E%3Crect fill="%23333" width="800" height="450"/%3E%3Ctext fill="%232DC275" font-family="Arial" font-size="32" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ETicketBooking%3C/text%3E%3C/svg%3E';

export const getImageUrl = (path, placeholder = DEFAULT_PLACEHOLDER) => {
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
