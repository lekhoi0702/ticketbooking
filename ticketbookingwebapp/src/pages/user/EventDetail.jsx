import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Nav } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Hooks
import { useEventDetail } from '../../hooks/useEventDetail';

// Sub-components
import EventHero from '../../components/Customer/Event/EventHero';
import TicketSelection from '../../components/Customer/Event/TicketSelection';
import StickyBookingBar from '../../components/Customer/Event/StickyBookingBar';

// Utils & Styles
import './EventDetail.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        event,
        loading,
        selectedTickets,
        selectedSeats,
        hasSeatMap,
        activeTicketType,
        totalTickets,
        setActiveTicketType,
        setHasSeatMap,
        handleTicketQuantityChange,
        handleSeatSelection,
        calculateTotal,
        validateSelection
    } = useEventDetail(id);

    if (loading) {
        return <LoadingSpinner tip="Đang tải thông tin sự kiện..." />;
    }

    if (!event) {
        return (
            <Container className="my-5 py-5 text-center">
                <h2>Không tìm thấy sự kiện</h2>
                <Link to="/" className="btn btn-success mt-3">Quay lại trang chủ</Link>
            </Container>
        );
    }

    const handleCheckout = () => {
        const validation = validateSelection();
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        navigate(`/checkout/${event.event_id}`, {
            state: {
                selectedTickets,
                selectedSeats,
                hasSeatMap
            }
        });
    };

    return (
        <div className="event-detail-page">
            <EventHero event={event} />

            {/* Sticky Navigation Bar */}
            <div className="event-detail-nav">
                <Container>
                    <Nav className="nav-pills">
                        <Nav.Link href="#description" className="nav-item">Giới thiệu</Nav.Link>
                        <Nav.Link href="#tickets" className="nav-item">Thông tin vé</Nav.Link>
                        <Nav.Link href="#venue" className="nav-item">Địa điểm</Nav.Link>
                        <Nav.Link href="#organizer" className="nav-item d-lg-none">Ban tổ chức</Nav.Link>
                    </Nav>
                </Container>
            </div>

            <Container className="event-main-content">
                <Row>
                    <Col lg={8}>
                        <section className="detail-section" id="description">
                            <h3 className="section-title">Giới thiệu</h3>
                            <div className="event-description">
                                {event.description || 'Chưa có mô tả cho sự kiện này.'}
                            </div>
                        </section>

                        <div id="tickets">
                            <TicketSelection
                                event={event}
                                activeTicketType={activeTicketType}
                                setActiveTicketType={setActiveTicketType}
                                selectedTickets={selectedTickets}
                                handleTicketQuantityChange={handleTicketQuantityChange}
                                handleSeatSelection={handleSeatSelection}
                                hasSeatMap={hasSeatMap}
                                setHasSeatMap={setHasSeatMap}
                            />
                        </div>

                        <section className="detail-section" id="venue">
                            <h3 className="section-title">Địa điểm</h3>
                            <div className="venue-info">
                                <h5>{event.venue?.venue_name}</h5>
                                <p className="text-muted"><FaMapMarkerAlt className="me-2" />{event.venue?.address}, {event.venue?.city}</p>
                                <div className="venue-map-placeholder">
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
                        <Card className="sidebar-card" id="organizer">
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
            <StickyBookingBar
                totalTickets={totalTickets}
                calculateTotal={calculateTotal}
                onCheckout={handleCheckout}
            />
        </div>
    );
}

export default EventDetail;
