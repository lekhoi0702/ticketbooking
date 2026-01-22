import { BASE_URL, UPLOADS_BASE_URL } from '@shared/constants';

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
    if (!path) {
        if (import.meta.env.DEV) {
            console.log('[getImageUrl] No path provided, using placeholder');
        }
        return placeholder;
    }
    
    // Return external URLs (http/https) as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        if (import.meta.env.DEV) {
            console.log('[getImageUrl] External URL:', path);
        }
        return path;
    }

    // Static assets from frontend public folder (e.g., banners)
    if (path.startsWith('/banners/')) {
        if (import.meta.env.DEV) {
            console.log('[getImageUrl] Static asset:', path);
        }
        return path;
    }

    // Backend uploads: Path from database can be:
    // - /uploads/events/file.jpg (full path)
    // - events/file.jpg (relative path)
    // - /events/file.jpg (absolute but missing /uploads/)
    
    let finalPath;
    
    if (path.startsWith('/uploads/')) {
        // Path already has /uploads/ prefix, use as-is
        finalPath = path;
    } else {
        // Path doesn't have /uploads/, add it
        // Remove leading slash if present to avoid double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        finalPath = `/uploads/${cleanPath}`;
    }
    
    // If BASE_URL is set (production with different origin), prepend it
    // Otherwise use relative path (works with Vite proxy in dev, same origin in prod)
    if (!BASE_URL || BASE_URL === '') {
        if (import.meta.env.DEV) {
            console.log('[getImageUrl] Final URL (relative):', finalPath, '| Original path:', path);
        }
        return finalPath;
    }
    
    // If BASE_URL is set, prepend it
    // Ensure no double slashes
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const fullUrl = `${base}${finalPath}`;
    if (import.meta.env.DEV) {
        console.log('[getImageUrl] Final URL (with BASE_URL):', fullUrl, '| Original path:', path);
    }
    return fullUrl;
};

export const transformEvent = (event) => {
    if (!event) {
        console.warn('transformEvent: event is null or undefined');
        return null;
    }

    try {
        const startDate = parseLocalDateTime(event.start_datetime);
        return {
            id: event.event_id,
            title: event.event_name || 'Sự kiện',
            date: startDate ? startDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'TBA',
            location: event.venue ? (event.venue.city || 'TBA') : 'TBA',
            image: getImageUrl(event.banner_image_url),
            price: (() => {
                if (!event.ticket_types || event.ticket_types.length === 0) return 'TBA';
                const prices = event.ticket_types
                    .map(t => parseFloat(t.price) || 0)
                    .filter(p => p >= 0);
                if (prices.length === 0) return 'TBA';
                const minPrice = Math.min(...prices);
                return minPrice === 0 ? 'Miễn phí' : `${minPrice.toLocaleString('vi-VN')}đ`;
            })(),
            badge: event.is_featured ? 'Hot' : null
        };
    } catch (error) {
        console.error('Error transforming event:', error, event);
        return {
            id: event.event_id || 0,
            title: event.event_name || 'Sự kiện',
            date: 'TBA',
            location: 'TBA',
            image: getImageUrl(null),
            price: 'TBA',
            badge: null
        };
    }
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};
