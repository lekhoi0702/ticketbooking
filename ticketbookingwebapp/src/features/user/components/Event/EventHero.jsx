import React from 'react';
import { Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';
import { getImageUrl, parseLocalDateTime } from '@shared/utils/eventUtils';

export default function EventHero({ event }) {
    const bannerUrl = getImageUrl(event.banner_image_url);
    const showtimes = Array.isArray(event.showtimes) && event.showtimes.length > 0
        ? [...event.showtimes].sort(
            (a, b) => new Date(a.start_datetime || 0).getTime() - new Date(b.start_datetime || 0).getTime()
        )
        : [];

    const startDate = parseLocalDateTime(showtimes[0]?.start_datetime || event.start_datetime);
    const timeStr = startDate
        ? startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : '';

    let timeRange = timeStr;
    if (event.end_datetime && startDate) {
        const endDate = parseLocalDateTime(event.end_datetime);
        if (endDate && startDate.toDateString() === endDate.toDateString()) {
            const endTimeStr = endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            timeRange = `${timeStr} - ${endTimeStr}`;
        }
    }

    const displayDateTime = startDate
        ? `${timeRange}, ${startDate.getDate()} Tháng ${startDate.getMonth() + 1}, ${startDate.getFullYear()}`
        : 'Chưa xác định';

    const venueName = event.venue?.venue_name || 'Địa điểm chưa cập nhật';
    const venueFullAddress = event.venue?.address || '';

    const getPriceRange = () => {
        if (!event.ticket_types || event.ticket_types.length === 0) return 'Đang cập nhật';
        const minPrice = Math.min(...event.ticket_types.map((t) => t.price));
        return minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')} đ` : 'Miễn phí';
    };

    return (
        <div className="container py-5">
            <div className="ticket-hero-container">
                <div className="ticket-hero-left">
                    <div className="ticket-content">
                        <h1 className="ticket-title">{event.event_name}</h1>

                        <div className="ticket-info-row">
                            <FaCalendar className="ticket-icon" />
                            <span className="ticket-info-text">{displayDateTime}</span>
                        </div>

                        {showtimes.length > 1 && (
                            <div className="ticket-info-row">
                                <FaCalendar className="ticket-icon" />
                                <span className="ticket-info-text">{showtimes.length} suất diễn</span>
                            </div>
                        )}

                        {showtimes.length > 1 && (
                            <div className="ticket-address" style={{ marginBottom: 8 }}>
                                {showtimes
                                    .slice(0, 3)
                                    .map((slot) => {
                                        const d = parseLocalDateTime(slot.start_datetime);
                                        return d
                                            ? d.toLocaleString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : '';
                                    })
                                    .filter(Boolean)
                                    .join(' • ')}
                                {showtimes.length > 3 ? ' • ...' : ''}
                            </div>
                        )}

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
                            onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Mua vé ngay
                        </Button>
                    </div>
                </div>

                <div className="ticket-hero-right">
                    <div className="ticket-image-wrapper">
                        <img src={bannerUrl} alt={event.event_name} />
                    </div>
                </div>
            </div>
        </div>
    );
}
