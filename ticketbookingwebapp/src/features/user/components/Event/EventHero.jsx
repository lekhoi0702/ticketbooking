import React from 'react';
import { Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';
import { getImageUrl } from '@shared/utils/eventUtils';

const EventHero = ({ event }) => {
    const bannerUrl = getImageUrl(event.banner_image_url, 'https://via.placeholder.com/1200x600?text=TicketBooking');

    // Date Logic
    const startDate = new Date(event.start_datetime);
    const dateStr = startDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // If end date is same day, show range
    let timeRange = timeStr;
    if (event.end_datetime) {
        const endDate = new Date(event.end_datetime);
        if (startDate.toDateString() === endDate.toDateString()) {
            const endTimeStr = endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            timeRange = `${timeStr} - ${endTimeStr}`;
        }
    }

    // Formatting for new design: "19:30 - 21:00, 24 Tháng 01, 2026"
    const displayDateTime = `${timeRange}, ${startDate.getDate()} Tháng ${startDate.getMonth() + 1}, ${startDate.getFullYear()}`;

    const venueName = event.venue?.venue_name || 'Địa điểm chưa cập nhật';
    const venueFullAddress = event.venue?.address || '';

    // Price Logic
    const getPriceRange = () => {
        if (!event.ticket_types || event.ticket_types.length === 0) return 'Đang cập nhật';
        const minPrice = Math.min(...event.ticket_types.map(t => t.price));
        return minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} đ` : 'Miễn phí';
    };

    return (
        <div className="container py-5">
            <div className="ticket-hero-container">
                {/* LEFT SIDE: INFO */}
                <div className="ticket-hero-left">
                    <div className="ticket-content">
                        <h1 className="ticket-title">{event.event_name}</h1>

                        <div className="ticket-info-row">
                            <FaCalendar className="ticket-icon" />
                            <span className="ticket-info-text">{displayDateTime}</span>
                        </div>

                        <div className="ticket-info-row align-items-start">
                            <FaMapMarkerAlt className="ticket-icon mt-1" />
                            <div>
                                <div className="ticket-venue-name">{venueName}</div>
                                <div className="ticket-address">{venueFullAddress}</div>
                            </div>
                        </div>
                    </div>

                    <div className="ticket-footer">
                        <div className="ticket-divider"></div>
                        <div className="price-tag">
                            <span className="price-label">Giá từ</span>
                            <span className="price-value">{getPriceRange()} <span className="arrow">{'>'}</span></span>
                        </div>
                        <Button
                            className="ticket-buy-btn"
                            onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Mua vé ngay
                        </Button>
                    </div>
                </div>

                {/* RIGHT SIDE: IMAGE */}
                <div className="ticket-hero-right">
                    <div className="ticket-image-wrapper">
                        <img src={bannerUrl} alt={event.event_name} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventHero;
