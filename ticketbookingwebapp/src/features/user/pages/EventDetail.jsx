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
                    <Col lg={8}>
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

                        {/* Organizer Information Section */}
                        {event.organizer_info && (
                            <section className="detail-section d-lg-none" id="organizer">
                                <h3 className="section-title">Ban tổ chức</h3>
                                <div className="organizer-section-content">
                                    <div className="organizer-info">
                                        <div className="organizer-avatar">
                                            {event.organizer_info?.logo_url ? (
                                                <img src={getImageUrl(event.organizer_info.logo_url)} alt={event.organizer_info.organization_name} />
                                            ) : (
                                                (event.organizer_info?.organization_name || event.event_name || 'O').charAt(0).toString().toUpperCase()
                                            )}
                                        </div>
                                        <div className="organizer-details">
                                            <h6>{event.organizer_info?.organization_name || 'Ban tổ chức sự kiện'}</h6>
                                            <p className="text-muted small mb-0">
                                                {event.organizer_info?.description || 'Chuyên tổ chức các sự kiện giải trí hàng đầu'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </Col>
                    <Col lg={4}>
                        {event.organizer_info && (
                            <EventOrganizerCard 
                                organizerInfo={event.organizer_info}
                                eventName={event.event_name}
                            />
                        )}
                        
                        {/* Advertisement Banner */}
                        <div className="sidebar-advertisement mt-4">
                            <a 
                                href="https://shopee.vn" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ad-link"
                            >
                                <img 
                                    src="/quangcaoshopee.webp" 
                                    alt="Quảng cáo Shopee" 
                                    className="ad-image"
                                    onError={(e) => {
                                        // Fallback nếu ảnh không tìm thấy
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </a>
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
