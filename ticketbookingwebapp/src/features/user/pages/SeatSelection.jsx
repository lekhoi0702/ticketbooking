import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Tabs, Tab, Badge } from 'react-bootstrap';
import { message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { FaHome } from 'react-icons/fa';

// Components
import LoadingSpinner from '@shared/components/LoadingSpinner';
import SeatMap from '@features/user/components/Event/SeatMap';
import CountdownTimer from '@features/user/components/Checkout/CountdownTimer';
import AntBreadcrumb from '@features/user/components/AntBreadcrumb';
import { api } from '@services/api';
import { seatApi } from '@services/api/seat';
import { useAuth } from '@context/AuthContext';
import './SeatSelection.css';

const SeatSelection = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, triggerLogin } = useAuth();
    
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [hasSeatMap, setHasSeatMap] = useState({});
    const [quantity, setQuantity] = useState(1);
    
    // Get ticket type from location state (if coming from schedule selection)
    const ticketTypeIdFromState = location.state?.ticketTypeId;

    useEffect(() => {
        window.scrollTo(0, 0);
        loadEvent();
    }, [eventId]);

    useEffect(() => {
        // Set initial ticket type if provided
        if (ticketTypeIdFromState && event && event.ticket_types) {
            const ticketType = event.ticket_types.find(t => t.ticket_type_id === parseInt(ticketTypeIdFromState));
            if (ticketType) {
                setSelectedTicketType(ticketType);
                setQuantity(location.state?.quantity || 1);
            }
        } else if (event && event.ticket_types && event.ticket_types.length > 0 && !selectedTicketType) {
            // Auto-select first ticket type if none selected
            setSelectedTicketType(event.ticket_types[0]);
        }
    }, [event, ticketTypeIdFromState, location.state]);

    const loadEvent = async () => {
        if (!eventId) return;
        try {
            setLoading(true);
            const response = await api.getEvent(eventId);
            if (response.success) {
                const eventData = response.data;
                
                // Convert ticket_types to array if needed
                if (eventData.ticket_types && typeof eventData.ticket_types === 'object' && !Array.isArray(eventData.ticket_types)) {
                    eventData.ticket_types = Object.values(eventData.ticket_types);
                }
                
                setEvent(eventData);
                
                // Check seat maps for all ticket types
                if (eventData.ticket_types) {
                    eventData.ticket_types.forEach(async (tt) => {
                        try {
                            const response = await seatApi.getSeatsByTicketType(eventId, tt.ticket_type_id);
                            const exists = response.success && response.data && response.data.length > 0;
                            setHasSeatMap(prev => ({ ...prev, [tt.ticket_type_id]: exists }));
                        } catch (error) {
                            console.error('Error checking seat map:', error);
                            setHasSeatMap(prev => ({ ...prev, [tt.ticket_type_id]: false }));
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading event:', error);
            message.error('Không thể tải thông tin sự kiện');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatSelection = (seats) => {
        setSelectedSeats(seats);
    };

    const handleSeatsLoaded = (ticketTypeId, exists) => {
        setHasSeatMap(prev => ({ ...prev, [ticketTypeId]: exists }));
    };

    const handleTicketQuantityChange = (ticketTypeId, newQuantity) => {
        const qty = Math.max(1, Math.min(newQuantity, selectedTicketType?.max_per_order || 10));
        setQuantity(qty);
        // Clear seats if quantity decreases
        if (selectedSeats.length > qty) {
            setSelectedSeats(prev => prev.slice(0, qty));
        }
    };

    const handleTicketTypeChange = (ticketType) => {
        setSelectedTicketType(ticketType);
        setQuantity(1);
        setSelectedSeats([]);
    };

    const handleProceedToCheckout = () => {
        if (!selectedTicketType) {
            message.warning('Vui lòng chọn loại vé');
            return;
        }

        if (quantity < 1) {
            message.warning('Vui lòng chọn số lượng vé');
            return;
        }

        if (!isAuthenticated) {
            triggerLogin({
                action: 'checkout',
                eventId: parseInt(eventId),
                state: {
                    selectedTickets: { [selectedTicketType.ticket_type_id]: quantity },
                    selectedSeats: { [selectedTicketType.ticket_type_id]: selectedSeats },
                    hasSeatMap: { [selectedTicketType.ticket_type_id]: hasSeatMap[selectedTicketType.ticket_type_id] || false }
                }
            });
            return;
        }

        const ticketTypeId = selectedTicketType.ticket_type_id;
        const hasSeatMapForType = hasSeatMap[ticketTypeId] || false;

        if (hasSeatMapForType && selectedSeats.length === 0) {
            message.warning('Vui lòng chọn ghế trước khi thanh toán');
            return;
        }

        if (hasSeatMapForType && selectedSeats.length !== quantity) {
            message.warning(`Vui lòng chọn đủ ${quantity} ghế`);
            return;
        }

        // Navigate to checkout
        const navigationId = `checkout_${eventId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem(`checkout_nav_id_${eventId}`, navigationId);
        
        navigate(`/checkout/${eventId}`, {
            state: {
                selectedTickets: { [ticketTypeId]: quantity },
                selectedSeats: { [ticketTypeId]: selectedSeats },
                hasSeatMap: { [ticketTypeId]: hasSeatMapForType },
                fromSeatSelection: true,
                navigationId: navigationId
            },
            replace: false
        });
    };

    if (loading) {
        return <LoadingSpinner fullScreen tip="Đang tải thông tin sự kiện..." />;
    }

    if (!event) {
        return (
            <Container className="my-5 py-5 text-center">
                <h2>Không tìm thấy sự kiện</h2>
                <Button onClick={() => navigate('/')} className="mt-3">Quay lại trang chủ</Button>
            </Container>
        );
    }

    if (!event || !event.ticket_types || event.ticket_types.length === 0) {
        return (
            <Container className="my-5 py-5 text-center">
                <h2>Sự kiện này chưa có loại vé nào</h2>
                <Button onClick={handleBack} className="mt-3">Quay lại</Button>
            </Container>
        );
    }

    return (
        <div className="seat-selection-page">
            <Container>
                {/* Breadcrumb */}
                <AntBreadcrumb
                    items={[
                        { label: 'Trang chủ', path: '/', icon: <FaHome /> },
                        {
                            label: event.event_name || 'Sự kiện',
                            path: `/event/${eventId}`
                        },
                        {
                            label: 'Chọn ghế',
                            path: ''
                        }
                    ]}
                />

                {/* Header */}
                <div className="seat-selection-header">
                    <h2 className="page-title">{event.event_name}</h2>
                </div>

                {/* Ticket Selection */}
                <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden seat-selection-card">
                    <Card.Body className="p-0">
                        <Tabs
                            activeKey={selectedTicketType?.ticket_type_id}
                            onSelect={(k) => {
                                const ticketType = event.ticket_types.find(t => t.ticket_type_id === parseInt(k));
                                if (ticketType) {
                                    handleTicketTypeChange(ticketType);
                                }
                            }}
                            className="custom-tabs"
                        >
                            {event.ticket_types?.map(tt => (
                                <Tab
                                    key={tt.ticket_type_id}
                                    eventKey={tt.ticket_type_id}
                                    title={
                                        <span>
                                            {tt.type_name}
                                            {selectedTicketType?.ticket_type_id === tt.ticket_type_id && quantity > 0 &&
                                                <Badge bg="success" className="ms-2 pill">{quantity}</Badge>
                                            }
                                        </span>
                                    }
                                >
                                    <div className="tab-pane">
                                        <div className="ticket-info-section">
                                            <h5 className="fw-bold">{tt.type_name}</h5>
                                            <p className="text-muted small">{tt.description || 'Loại vé tiêu chuẩn cho sự kiện'}</p>
                                            <div className="h4 text-primary fw-bold">
                                                {tt.price > 0 ? `${tt.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                                            </div>
                                        </div>

                                        {/* Quantity Selector */}
                                        <div className="quantity-selector-wrapper">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="quantity-selector-label">
                                                    <h6 className="mb-0 fw-bold">Số lượng vé</h6>
                                                    <small className="text-muted">Tối đa {tt.max_per_order} vé mỗi đơn hàng</small>
                                                </div>
                                                <div className="quantity-selector">
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleTicketQuantityChange(tt.ticket_type_id, quantity - 1)}
                                                        disabled={quantity <= 1}
                                                    >-</button>
                                                    <span className="qty-val">{quantity}</span>
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleTicketQuantityChange(tt.ticket_type_id, quantity + 1)}
                                                        disabled={quantity >= tt.max_per_order}
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tab>
                            ))}
                        </Tabs>
                    </Card.Body>
                </Card>

                {/* Seat Map - Only show if ticket type selected and has seat map */}
                {selectedTicketType && hasSeatMap[selectedTicketType.ticket_type_id] && (
                    <>
                        {/* Countdown Timer */}
                        {selectedSeats.length > 0 && (
                            <CountdownTimer 
                                hasSelectedSeats={selectedSeats.length > 0}
                                eventId={event.event_id}
                                onExpired={() => {
                                    message.warning('Thời gian giữ ghế đã hết. Vui lòng chọn lại ghế.');
                                    setSelectedSeats([]);
                                }}
                            />
                        )}

                        <div className="seat-map-section">
                            <SeatMap
                                ticketType={selectedTicketType}
                                eventId={event.event_id}
                                onSelectionChange={handleSeatSelection}
                                maxSelection={quantity}
                                onSeatsLoaded={(exists) => handleSeatsLoaded(selectedTicketType.ticket_type_id, exists)}
                            />
                        </div>
                    </>
                )}

                {/* Action Buttons */}
                {selectedTicketType && (
                    <div className="seat-selection-actions">
                        <Row>
                            <Col md={8} className="mx-auto">
                                <div className="selection-summary">
                                    <div className="summary-item">
                                        <span className="summary-label">Loại vé:</span>
                                        <span className="summary-value">{selectedTicketType.type_name}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Số lượng:</span>
                                        <span className="summary-value">{quantity}</span>
                                    </div>
                                    {hasSeatMap[selectedTicketType.ticket_type_id] && (
                                        <div className="summary-item">
                                            <span className="summary-label">Ghế đã chọn:</span>
                                            <span className="summary-value">
                                                {selectedSeats.length > 0 
                                                    ? selectedSeats.map(s => s.seat_label || s.seat_number).join(', ')
                                                    : 'Chưa chọn'
                                                }
                                            </span>
                                        </div>
                                    )}
                                    <div className="summary-item total">
                                        <span className="summary-label">Tổng tiền:</span>
                                        <span className="summary-value">
                                            {(selectedTicketType.price * quantity).toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="success"
                                    size="lg"
                                    className="checkout-button"
                                    onClick={handleProceedToCheckout}
                                    disabled={hasSeatMap[selectedTicketType.ticket_type_id] && selectedSeats.length !== quantity}
                                >
                                    <CheckCircleOutlined /> Tiến hành thanh toán
                                </Button>
                            </Col>
                        </Row>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default SeatSelection;
