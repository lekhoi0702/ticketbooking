import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Tab, Tabs } from 'react-bootstrap';
import { message } from 'antd';

// Hooks
import { useEventDetail } from '@shared/hooks/useEventDetail';
import { useAuth } from '@context/AuthContext';
import { useFavorites } from '@context/FavoriteContext';

// Sub-components
import EventHero from '@features/user/components/Event/EventHero';
import AuthModal from '@features/user/components/Auth/AuthModal';
import ScheduleCalendar from '@features/user/components/Event/ScheduleCalendar';
import EventVenueInfo from '@features/user/components/Event/EventVenueInfo';
import EventOrganizerCard from '@features/user/components/Event/EventOrganizerCard';
import RecommendedEvents from '@features/user/components/Event/RecommendedEvents';
import LoadingSpinner from '@shared/components/LoadingSpinner';

// Utils & Styles
import { getImageUrl } from '@shared/utils/eventUtils';
import './EventDetail.css';

function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, showLoginModal, setShowLoginModal, triggerLogin, redirectIntent, clearRedirectIntent } = useAuth();
    const { toggleFavorite } = useFavorites();
    const [activeTab, setActiveTab] = React.useState('tickets');
    const pendingActionRef = useRef(null);

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

    // Handle pending actions after login - MUST be before any early returns
    useEffect(() => {
        const handlePendingAction = async () => {
            if (!isAuthenticated || !redirectIntent || !event) return;
            
            // Handle favorite action
            if (redirectIntent.action === 'favorite' && redirectIntent.eventId === parseInt(id)) {
                clearRedirectIntent();
                const result = await toggleFavorite(parseInt(id));
                if (result.success) {
                    message.success(result.message);
                }
            }
            
            // Handle checkout action
            if (redirectIntent.action === 'checkout' && redirectIntent.eventId === parseInt(id)) {
                clearRedirectIntent();
                
                // Generate unique navigation ID for this checkout session
                const navigationId = `checkout_${event.event_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                // Store navigation ID in sessionStorage
                sessionStorage.setItem(`checkout_nav_id_${event.event_id}`, navigationId);
                
                navigate(`/checkout/${event.event_id}`, {
                    state: {
                        selectedTickets,
                        selectedSeats,
                        hasSeatMap,
                        fromEventDetail: true, // Add flag for valid navigation
                        navigationId: navigationId // Unique ID to distinguish fresh navigation from forward
                    },
                    replace: false // Push normally so back button works
                });
            }
        };
        
        handlePendingAction();
    }, [isAuthenticated, redirectIntent, id, event, clearRedirectIntent, toggleFavorite, navigate, selectedTickets, selectedSeats, hasSeatMap]);

    if (loading) {
        return <LoadingSpinner fullScreen tip="Đang tải thông tin sự kiện..." />;
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
            // Store intent to checkout after login
            triggerLogin({ 
                action: 'checkout', 
                eventId: parseInt(id),
                state: { selectedTickets, selectedSeats, hasSeatMap }
            });
            return;
        }

        proceedToCheckout();
    };

    const handleToggleFavorite = async (eventId) => {
        if (!isAuthenticated) {
            triggerLogin({ action: 'favorite', eventId });
            return;
        }

        const result = await toggleFavorite(eventId);
        if (result.success) {
            message.success(result.message);
        }
    };

    const proceedToCheckout = () => {
        // Generate unique navigation ID for this checkout session
        const navigationId = `checkout_${event.event_id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store navigation ID in sessionStorage
        sessionStorage.setItem(`checkout_nav_id_${event.event_id}`, navigationId);
        
        navigate(`/checkout/${event.event_id}`, {
            state: {
                selectedTickets,
                selectedSeats,
                hasSeatMap,
                fromEventDetail: true, // Flag to indicate valid navigation
                navigationId: navigationId // Unique ID to distinguish fresh navigation from forward
            },
            replace: false // Push normally so back button works
        });
    };

    return (
        <div className="event-detail-page">
            <EventHero event={event} onToggleFavorite={() => handleToggleFavorite(event.event_id)} />

            {/* Sticky Navigation Bar */}
            <div className="event-detail-nav">
                <Container>
                    <Nav className="nav-pills">
                        <Nav.Link href="#description" className="nav-item">Giới thiệu</Nav.Link>
                        <Nav.Link href="#booking-section" className="nav-item">Lịch diễn</Nav.Link>
                        <Nav.Link href="#venue" className="nav-item">Địa điểm</Nav.Link>
                        <Nav.Link href="#organizer" className="nav-item">Ban tổ chức</Nav.Link>
                    </Nav>
                </Container>
            </div>

            <Container className="event-main-content">
                <Row>
                    <Col lg={9}>
                        <section className="detail-section" id="description">
                            <h3 className="section-title">Giới thiệu</h3>
                            <div className="event-description">
                                {event.description || 'Chưa có mô tả cho sự kiện này.'}
                            </div>
                        </section>

                        <div id="booking-section" className="event-schedule-section">
                            <section className="detail-section">
                                <h3 className="section-title">Lịch diễn</h3>
                                <div className="tab-content-wrapper">
                                    <ScheduleCalendar
                                        currentEvent={event}
                                        schedules={event.schedule || []}
                                        onSelectSchedule={(eventId) => {
                                            // Navigate to seat selection page
                                            navigate(`/event/${eventId}/seats`, {
                                                state: {
                                                    fromSchedule: true
                                                }
                                            });
                                        }}
                                        selectedScheduleId={event.event_id}
                                    />
                                </div>
                            </section>
                        </div>

                        <EventVenueInfo venue={event.venue} />

                        {/* Organizer Information Section - Below Maps */}
                        {event.organizer_info && (
                            <section className="detail-section" id="organizer">
                                <h3 className="section-title">Ban tổ chức</h3>
                                <EventOrganizerCard 
                                    organizerInfo={event.organizer_info}
                                    eventName={event.event_name}
                                />
                            </section>
                        )}
                    </Col>
                    <Col lg={3}>
                        <div className="sidebar-sticky-wrapper">
                            {/* Advertisement Banner */}
                            <div className="sidebar-advertisement">
                                <a 
                                    href="https://shopee.vn" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ad-link"
                                >
                                    <img 
                                        key={`ad-${Date.now()}`}
                                        src={`/uploads/misc/quangcaoshopee.png?nocache=${Math.random()}`}
                                        alt="Quảng cáo ShopeePay - Giảm 40.000đ khi thanh toán bằng ShopeePay tại Ticketbox" 
                                        className="ad-image"
                                        loading="eager"
                                        onError={(e) => {
                                            // Fallback nếu ảnh không tìm thấy
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </a>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Recommended Events - Full Width */}
            <RecommendedEvents eventId={event.event_id} />

        </div>
    );
}

export default EventDetail;
