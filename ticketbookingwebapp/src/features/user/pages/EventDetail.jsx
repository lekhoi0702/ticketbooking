import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Tab, Tabs } from 'react-bootstrap';

// Hooks
import { useEventDetail } from '@shared/hooks/useEventDetail';
import { useAuth } from '@context/AuthContext';

// Sub-components
import EventHero from '@features/user/components/Event/EventHero';
import TicketSelection from '@features/user/components/Event/TicketSelection';
import StickyBookingBar from '@features/user/components/Event/StickyBookingBar';
import AuthModal from '@features/user/components/Auth/AuthModal';
import ScheduleCalendar from '@features/user/components/Event/ScheduleCalendar';
import EventVenueInfo from '@features/user/components/Event/EventVenueInfo';
import EventOrganizerCard from '@features/user/components/Event/EventOrganizerCard';
import RecommendedEvents from '@features/user/components/Event/RecommendedEvents';
import LoadingSpinner from '@shared/components/LoadingSpinner';

// Utils & Styles
import './EventDetail.css';

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('tickets');

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

        if (!isAuthenticated) {
            setShowAuthModal(true);
            return;
        }

        proceedToCheckout();
    };

    const proceedToCheckout = () => {
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
                        <Nav.Link href="#booking-section" className="nav-item">Mua vé</Nav.Link>
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

                        <div id="booking-section" className="event-tabs-wrapper">
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                id="event-booking-tabs"
                                className="custom-event-tabs mb-4"
                                variant="pills"
                                justify
                            >
                                <Tab eventKey="tickets" title="Chọn vé - Chỗ ngồi">
                                    <div className="tab-content-wrapper" id="tickets">
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
                                </Tab>

                                <Tab eventKey="schedule" title="Lịch diễn">
                                    <div className="tab-content-wrapper">
                                        <ScheduleCalendar
                                            currentEvent={event}
                                            schedules={event.schedule || []}
                                            onSelectSchedule={(eventId) => navigate(`/event/${eventId}`)}
                                            selectedScheduleId={event.event_id}
                                        />
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>

                        <EventVenueInfo venue={event.venue} />
                    </Col>

                    <Col lg={4}>
                        {/* Sidebar Info */}
                        <div id="organizer">
                            <EventOrganizerCard
                                organizerInfo={event.organizer_info}
                                eventName={event.event_name}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Recommended Events - Full Width */}
            <RecommendedEvents eventId={event.event_id} />

            {/* Sticky Bottom Bar */}
            <StickyBookingBar
                totalTickets={totalTickets}
                calculateTotal={calculateTotal}
                onCheckout={handleCheckout}
            />

            {/* Auth Modal for Guest Users */}
            <AuthModal
                show={showAuthModal}
                onHide={() => setShowAuthModal(false)}
                onSuccess={proceedToCheckout}
            />
        </div>
    );
}

export default EventDetail;
