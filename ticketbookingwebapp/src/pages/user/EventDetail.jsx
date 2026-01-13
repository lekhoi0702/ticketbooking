import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Accordion, Card, Badge, Tabs, Tab } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaShareAlt, FaHeart, FaTicketAlt, FaChair } from 'react-icons/fa';
import { api } from '../../services/api';
import { getImageUrl } from '../../utils/eventUtils';
import SeatMap from '../../components/event/SeatMap';
import './EventDetail.css';

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTickets, setSelectedTickets] = useState({}); // { ticketTypeId: quantity }
    const [selectedSeats, setSelectedSeats] = useState({}); // { ticketTypeId: [seatObj, ...] }
    const [hasSeatMap, setHasSeatMap] = useState({}); // { ticketTypeId: boolean }
    const [activeTicketType, setActiveTicketType] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadEvent();
    }, [id]);

    const loadEvent = async () => {
        try {
            setLoading(true);
            const response = await api.getEvent(id);
            if (response.success) {
                setEvent(response.data);
                if (response.data.ticket_types?.length > 0) {
                    setActiveTicketType(response.data.ticket_types[0]);
                }
            }
        } catch (error) {
            console.error('Error loading event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketQuantityChange = (ticketTypeId, quantity) => {
        const qty = Math.max(0, parseInt(quantity) || 0);
        setSelectedTickets({
            ...selectedTickets,
            [ticketTypeId]: qty
        });

        // Clear seats if quantity decreases
        if (selectedSeats[ticketTypeId]?.length > qty) {
            setSelectedSeats({
                ...selectedSeats,
                [ticketTypeId]: selectedSeats[ticketTypeId].slice(0, qty)
            });
        }
    };

    const handleSeatSelection = (ticketTypeId, seats) => {
        setSelectedSeats({
            ...selectedSeats,
            [ticketTypeId]: seats
        });

        // Sync quantity with seats selected
        setSelectedTickets({
            ...selectedTickets,
            [ticketTypeId]: seats.length
        });
    };

    const calculateTotal = () => {
        if (!event || !event.ticket_types) return 0;
        return event.ticket_types.reduce((total, tt) => {
            const qty = selectedTickets[tt.ticket_type_id] || 0;
            return total + (tt.price * qty);
        }, 0);
    };

    const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

    if (loading) {
        return (
            <div className="event-detail-loading">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <Container className="my-5 py-5 text-center">
                <h2>Không tìm thấy sự kiện</h2>
                <Link to="/" className="btn btn-success mt-3">Quay lại trang chủ</Link>
            </Container>
        );
    }

    const bannerUrl = getImageUrl(event.banner_image_url, 'https://via.placeholder.com/1200x600?text=TicketBooking');

    return (
        <div className="event-detail-page">
            {/* Hero Section with Blur Background */}
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
                                        {event.ticket_types?.[0]?.price > 0
                                            ? `${event.ticket_types[0].price.toLocaleString('vi-VN')}đ`
                                            : 'Miễn phí'}
                                    </span>
                                </div>
                                <div className="hero-actions">
                                    <Button variant="success" size="lg" className="buy-btn" onClick={() => document.getElementById('ticket-selection').scrollIntoView({ behavior: 'smooth' })}>
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

            <Container className="event-main-content">
                <Row>
                    <Col lg={8}>
                        {/* Description Section */}
                        <section className="detail-section">
                            <h3 className="section-title">Giới thiệu</h3>
                            <div className="event-description">
                                {event.description || 'Chưa có mô tả cho sự kiện này.'}
                            </div>
                        </section>

                        {/* Ticket Selection Section with Seat Map */}
                        <section id="ticket-selection" className="detail-section">
                            <h3 className="section-title">Chọn vé & Chỗ ngồi</h3>
                            <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
                                <Card.Body className="p-0">
                                    <Tabs
                                        activeKey={activeTicketType?.ticket_type_id}
                                        onSelect={(k) => setActiveTicketType(event.ticket_types.find(t => t.ticket_type_id === parseInt(k)))}
                                        className="custom-tabs px-3 pt-3"
                                    >
                                        {event.ticket_types?.map(tt => (
                                            <Tab
                                                key={tt.ticket_type_id}
                                                eventKey={tt.ticket_type_id}
                                                title={
                                                    <span>
                                                        {tt.type_name}
                                                        {selectedTickets[tt.ticket_type_id] > 0 &&
                                                            <Badge bg="success" className="ms-2 pill">{selectedTickets[tt.ticket_type_id]}</Badge>
                                                        }
                                                    </span>
                                                }
                                            >
                                                <div className="p-4">
                                                    <div className="mb-4">
                                                        <h5 className="fw-bold">{tt.type_name}</h5>
                                                        <p className="text-muted small">{tt.description || 'Loại vé tiêu chuẩn cho sự kiện'}</p>
                                                        <div className="h4 text-primary fw-bold">
                                                            {tt.price > 0 ? `${tt.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                                                        </div>
                                                    </div>

                                                    <SeatMap
                                                        ticketType={tt}
                                                        onSelectionChange={(seats) => handleSeatSelection(tt.ticket_type_id, seats)}
                                                        maxSelection={tt.max_per_order}
                                                        onSeatsLoaded={(exists) => {
                                                            setHasSeatMap(prev => ({ ...prev, [tt.ticket_type_id]: exists }));
                                                        }}
                                                    />

                                                    {/* Fallback quantity selector for non-seatmap ticket types */}
                                                    {!hasSeatMap[tt.ticket_type_id] && (
                                                        <div className="mt-4 border-top pt-4">
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                <div>
                                                                    <h6 className="mb-0 fw-bold text-dark">Số lượng vé</h6>
                                                                    <small className="text-muted">Tối đa {tt.max_per_order} vé mỗi đơn hàng</small>
                                                                </div>
                                                                <div className="quantity-selector border rounded-pill p-1 d-flex align-items-center bg-light">
                                                                    <button
                                                                        className="qty-btn"
                                                                        onClick={() => handleTicketQuantityChange(tt.ticket_type_id, (selectedTickets[tt.ticket_type_id] || 0) - 1)}
                                                                        disabled={!(selectedTickets[tt.ticket_type_id] > 0)}
                                                                    >-</button>
                                                                    <span className="qty-val px-3 fw-bold">{selectedTickets[tt.ticket_type_id] || 0}</span>
                                                                    <button
                                                                        className="qty-btn"
                                                                        onClick={() => handleTicketQuantityChange(tt.ticket_type_id, (selectedTickets[tt.ticket_type_id] || 0) + 1)}
                                                                        disabled={(selectedTickets[tt.ticket_type_id] || 0) >= tt.max_per_order}
                                                                    >+</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Tab>
                                        ))}
                                    </Tabs>
                                </Card.Body>
                            </Card>
                        </section>

                        {/* Venue Section */}
                        <section className="detail-section">
                            <h3 className="section-title">Địa điểm</h3>
                            <div className="venue-info">
                                <h5>{event.venue?.venue_name}</h5>
                                <p className="text-muted"><FaMapMarkerAlt className="me-2" />{event.venue?.address}, {event.venue?.city}</p>
                                <div className="venue-map-placeholder">
                                    {/* Link to Google Maps */}
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue?.address + ', ' + event.venue?.city)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-secondary w-100"
                                    >
                                        Xem bản đồ trên Google Maps
                                    </a>
                                </div>
                            </div>
                        </section>
                    </Col>

                    <Col lg={4}>
                        {/* Sidebar Info */}
                        <Card className="sidebar-card">
                            <Card.Header className="bg-white">
                                <h5 className="mb-0">Thông tin ban tổ chức</h5>
                            </Card.Header>
                            <Card.Body>
                                <div className="organizer-info">
                                    <div className="organizer-avatar">
                                        {event.event_name.charAt(0)}
                                    </div>
                                    <div className="organizer-details">
                                        <h6>Ban tổ chức sự kiện</h6>
                                        <p className="text-muted small mb-0">Chuyên tổ chức các sự kiện giải trí hàng đầu</p>
                                    </div>
                                </div>
                                <Button variant="outline-success" className="w-100 mt-3">Theo dõi</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Sticky Bottom Bar */}
            {totalTickets > 0 && (
                <div className="sticky-booking-bar">
                    <Container>
                        <div className="bar-content">
                            <div className="selection-summary">
                                <div className="summary-tickets">{totalTickets} vé đã chọn</div>
                                <div className="summary-total">Tổng: <span>{calculateTotal().toLocaleString('vi-VN')}đ</span></div>
                            </div>
                            <Button
                                variant="success"
                                size="lg"
                                className="checkout-btn"
                                onClick={() => {
                                    // Validation: if seat map exists, must select seats
                                    for (const tid in selectedTickets) {
                                        if (selectedTickets[tid] > 0 && hasSeatMap[tid] && (selectedSeats[tid]?.length || 0) < selectedTickets[tid]) {
                                            alert(`Vui lòng chọn đủ ghế cho loại vé ${event.ticket_types.find(t => t.ticket_type_id === parseInt(tid))?.type_name}`);
                                            return;
                                        }
                                    }
                                    navigate(`/checkout/${event.event_id}`, {
                                        state: {
                                            selectedTickets,
                                            selectedSeats,
                                            hasSeatMap
                                        }
                                    });
                                }}
                            >
                                Tiếp tục
                            </Button>
                        </div>
                    </Container>
                </div>
            )}
        </div>
    );
}

export default EventDetail;
