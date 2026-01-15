import { BASE_URL } from '../constants';

export const getImageUrl = (path, placeholder = 'https://via.placeholder.com/800x450?text=TicketBooking') => {
    if (!path) return placeholder;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads/')) return `${BASE_URL}${path}`;
    if (path.startsWith('uploads/')) return `${BASE_URL}/${path}`;
    return path;
};

export const transformEvent = (event) => {
    return {
        id: event.event_id,
        title: event.event_name,
        date: event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('vi-VN', {
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
