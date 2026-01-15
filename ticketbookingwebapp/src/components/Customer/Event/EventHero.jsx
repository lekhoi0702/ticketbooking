import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaHeart, FaShareAlt, FaTicketAlt } from 'react-icons/fa';
import { getImageUrl } from '../../../utils/eventUtils';

const EventHero = ({ event }) => {
    const bannerUrl = getImageUrl(event.banner_image_url, 'https://via.placeholder.com/1200x600?text=TicketBooking');

    return (
        <div className="event-hero">
            <div className="hero-blur-bg" style={{ backgroundImage: `url(${bannerUrl})` }}></div>
            <Container className="hero-content">
                <Row>
                    <Col lg={4} className="poster-col">
                        <div className="event-poster-wrapper">
                            <img src={bannerUrl} alt={event.event_name} className="event-poster" />
                        </div>
                    </Col>
                    <Col lg={8} className="info-col">
                        <div className="event-summary">
                            <h1 className="event-name">{event.event_name}</h1>
                            <div className="event-meta">
                                <div className="meta-item">
                                    <FaCalendarAlt className="icon" />
                                    <span>{new Date(event.start_datetime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                </div>
                                <div className="meta-item">
                                    <FaClock className="icon" />
                                    <span>{new Date(event.start_datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="meta-item">
                                    <FaMapMarkerAlt className="icon" />
                                    <span>{event.venue?.venue_name}, {event.venue?.city}</span>
                                </div>
                            </div>
                            <div className="event-price-range">
                                <span className="label">Giá từ</span>
                                <span className="price">
                                    {(() => {
                                        if (!event.ticket_types || event.ticket_types.length === 0) return 'Đang cập nhật';
                                        const minPrice = Math.min(...event.ticket_types.map(t => t.price));
                                        return minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')}đ` : 'Miễn phí';
                                    })()}
                                </span>
                            </div>
                            <div className="hero-actions">
                                <Button
                                    variant="success"
                                    size="lg"
                                    className="buy-btn"
                                    onClick={() => document.getElementById('ticket-selection').scrollIntoView({ behavior: 'smooth' })}
                                >
                                    <FaTicketAlt className="me-2" /> Mua vé ngay
                                </Button>
                                <Button variant="outline-light" className="action-btn">
                                    <FaHeart />
                                </Button>
                                <Button variant="outline-light" className="action-btn">
                                    <FaShareAlt />
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default EventHero;
