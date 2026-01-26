import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
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

const formatVnd = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

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
                    // Mark as "checking" to avoid premature checkout enablement
                    setHasSeatMap(
                        eventData.ticket_types.reduce((acc, tt) => {
                            acc[tt.ticket_type_id] = undefined;
                            return acc;
                        }, {})
                    );

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

        const ticketTypeId = selectedTicketType.ticket_type_id;
        const seatMapState = hasSeatMap[ticketTypeId]; // true | false | undefined
        if (seatMapState === undefined) {
            message.info('Đang kiểm tra sơ đồ ghế. Vui lòng chờ một chút...');
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

        const hasSeatMapForType = seatMapState === true;

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

    const handleBack = () => {
        if (eventId) {
            navigate(`/event/${eventId}`);
            return;
        }
        navigate(-1);
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

    const seatMapState = selectedTicketType ? hasSeatMap[selectedTicketType.ticket_type_id] : undefined; // true | false | undefined
    const requiresSeatSelection = seatMapState === true;
    const isSeatMapChecking = selectedTicketType ? seatMapState === undefined : false;

    const isSelectionComplete = !selectedTicketType
        ? false
        : requiresSeatSelection
            ? selectedSeats.length === quantity && quantity > 0
            : true;

    const totalPrice = selectedTicketType ? selectedTicketType.price * quantity : 0;

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
                <div className="seat-hero">
                    <div className="seat-hero-inner">
                        <div className="seat-hero-title-row">
                            <h2 className="seat-hero-title">{event.event_name}</h2>
                            <div className="seat-hero-steps">
                                <span className="seat-step active">1</span>
                                <span className="seat-step-divider" aria-hidden="true" />
                                <span className="seat-step">2</span>
                                <span className="seat-step-divider" aria-hidden="true" />
                                <span className="seat-step">3</span>
                            </div>
                        </div>
                        <div className="seat-hero-subtitle">
                            Chọn loại vé, số lượng và vị trí ghế (nếu có) để tiếp tục thanh toán.
                        </div>
                    </div>
                </div>

                <Row className="g-4">
                    {/* Left: Ticket + Seat map */}
                    <Col lg={8} xl={9}>
                        {/* Ticket Types */}
                        <Card className="seat-panel mb-4">
                            <Card.Body className="p-0">
                                <div className="seat-panel-header">
                                    <div>
                                        <div className="seat-panel-title">Chọn loại vé</div>
                                        <div className="seat-panel-desc">Chạm để chọn. Bạn có thể đổi loại vé bất cứ lúc nào.</div>
                                    </div>
                                    {selectedTicketType ? (
                                        <Badge bg="success" className="seat-pill">
                                            Đang chọn: {selectedTicketType.type_name}
                                        </Badge>
                                    ) : null}
                                </div>

                                <div className="seat-ticket-grid">
                                    {event.ticket_types.map((tt) => {
                                        const isActive = selectedTicketType?.ticket_type_id === tt.ticket_type_id;
                                        const ttSeatMapState = hasSeatMap[tt.ticket_type_id];

                                        return (
                                            <button
                                                key={tt.ticket_type_id}
                                                type="button"
                                                className={`seat-ticket-card ${isActive ? 'active' : ''}`}
                                                onClick={() => handleTicketTypeChange(tt)}
                                                aria-label={`Chọn loại vé ${tt.type_name}`}
                                            >
                                                <div className="seat-ticket-top">
                                                    <div className="seat-ticket-name">{tt.type_name}</div>
                                                    <div className="seat-ticket-price">
                                                        {tt.price > 0 ? formatVnd(tt.price) : 'Miễn phí'}
                                                    </div>
                                                </div>
                                                <div className="seat-ticket-desc">
                                                    {tt.description || 'Loại vé tiêu chuẩn cho sự kiện'}
                                                </div>
                                                <div className="seat-ticket-meta">
                                                    <span className="seat-meta-chip">
                                                        Tối đa {tt.max_per_order || 10} vé/đơn
                                                    </span>
                                                    <span className={`seat-meta-chip ${ttSeatMapState === true ? 'chip-green' : ''}`}>
                                                        {ttSeatMapState === undefined
                                                            ? 'Đang kiểm tra sơ đồ...'
                                                            : ttSeatMapState === true
                                                                ? 'Có chọn ghế'
                                                                : 'Không cần chọn ghế'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Quantity */}
                        <Card className="seat-panel mb-4">
                            <Card.Body className="seat-panel-body">
                                <div className="seat-qty-row">
                                    <div>
                                        <div className="seat-panel-title">Số lượng vé</div>
                                        <div className="seat-panel-desc">
                                            {selectedTicketType
                                                ? `Tối đa ${selectedTicketType.max_per_order || 10} vé mỗi đơn hàng.`
                                                : 'Vui lòng chọn loại vé trước.'}
                                        </div>
                                    </div>
                                    <div className="seat-qty-control" aria-label="Chọn số lượng vé">
                                        <button
                                            type="button"
                                            className="seat-qty-btn"
                                            onClick={() =>
                                                selectedTicketType
                                                    ? handleTicketQuantityChange(selectedTicketType.ticket_type_id, quantity - 1)
                                                    : null
                                            }
                                            disabled={!selectedTicketType || quantity <= 1}
                                            aria-label="Giảm số lượng"
                                        >
                                            −
                                        </button>
                                        <div className="seat-qty-value" aria-label={`Số lượng hiện tại ${quantity}`}>
                                            {quantity}
                                        </div>
                                        <button
                                            type="button"
                                            className="seat-qty-btn"
                                            onClick={() =>
                                                selectedTicketType
                                                    ? handleTicketQuantityChange(selectedTicketType.ticket_type_id, quantity + 1)
                                                    : null
                                            }
                                            disabled={
                                                !selectedTicketType ||
                                                quantity >= (selectedTicketType?.max_per_order || 10)
                                            }
                                            aria-label="Tăng số lượng"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Seat Map */}
                        <Card className="seat-panel">
                            <Card.Body className="seat-panel-body">
                                <div className="seat-panel-header compact">
                                    <div>
                                        <div className="seat-panel-title">Chọn ghế</div>
                                        <div className="seat-panel-desc">
                                            {isSeatMapChecking
                                                ? 'Đang kiểm tra sơ đồ ghế...'
                                                : requiresSeatSelection
                                                    ? `Vui lòng chọn đủ ${quantity} ghế để tiếp tục.`
                                                    : 'Loại vé này không yêu cầu chọn số ghế cụ thể.'}
                                        </div>
                                    </div>
                                    {requiresSeatSelection ? (
                                        <div className="seat-progress-chip" aria-label="Tiến độ chọn ghế">
                                            {selectedSeats.length}/{quantity}
                                        </div>
                                    ) : (
                                        <div className="seat-progress-chip success" aria-label="Trạng thái chọn ghế">
                                            Sẵn sàng
                                        </div>
                                    )}
                                </div>

                                {/* Countdown Timer */}
                                {selectedSeats.length > 0 ? (
                                    <CountdownTimer
                                        hasSelectedSeats={selectedSeats.length > 0}
                                        eventId={event.event_id}
                                        onExpired={() => {
                                            message.warning('Thời gian giữ ghế đã hết. Vui lòng chọn lại ghế.');
                                            setSelectedSeats([]);
                                        }}
                                    />
                                ) : null}

                                {selectedTicketType ? (
                                    <div className="seat-map-wrapper">
                                        {requiresSeatSelection ? (
                                            <SeatMap
                                                ticketType={selectedTicketType}
                                                eventId={event.event_id}
                                                onSelectionChange={handleSeatSelection}
                                                maxSelection={quantity}
                                                onSeatsLoaded={(exists) => handleSeatsLoaded(selectedTicketType.ticket_type_id, exists)}
                                            />
                                        ) : (
                                            <div className="seat-no-map">
                                                <div className="seat-no-map-title">Không cần chọn ghế</div>
                                                <div className="seat-no-map-desc">
                                                    Bạn có thể tiếp tục thanh toán ngay. Nếu sự kiện có bố trí chỗ ngồi,
                                                    hệ thống sẽ tự sắp xếp vị trí phù hợp.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="seat-empty-hint">
                                        Hãy chọn loại vé ở phía trên để hiển thị sơ đồ ghế.
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right: Summary */}
                    <Col lg={4} xl={3}>
                        <div className="seat-sidebar">
                            <div className="seat-summary-card">
                                <div className="seat-summary-header">
                                    <div>
                                        <div className="seat-summary-title">Tóm tắt</div>
                                        <div className="seat-summary-subtitle">
                                            {requiresSeatSelection
                                                ? `Đã chọn ${selectedSeats.length}/${quantity} ghế`
                                                : 'Không cần chọn ghế'}
                                        </div>
                                    </div>
                                    <div className={`seat-summary-status ${isSelectionComplete ? 'ok' : ''}`}>
                                        {isSelectionComplete ? 'Sẵn sàng' : 'Chưa đủ'}
                                    </div>
                                </div>

                                <div className="seat-summary-body">
                                    <div className="seat-summary-row">
                                        <div className="seat-summary-label">Loại vé</div>
                                        <div className="seat-summary-value">
                                            {selectedTicketType ? selectedTicketType.type_name : '—'}
                                        </div>
                                    </div>
                                    <div className="seat-summary-row">
                                        <div className="seat-summary-label">Số lượng</div>
                                        <div className="seat-summary-value">{selectedTicketType ? quantity : '—'}</div>
                                    </div>

                                    {requiresSeatSelection ? (
                                        <div className="seat-summary-row">
                                            <div className="seat-summary-label">Ghế</div>
                                            <div className="seat-summary-value seats">
                                                {selectedSeats.length > 0
                                                    ? selectedSeats.map((s) => s.seat_label || s.seat_number).join(', ')
                                                    : 'Chưa chọn'}
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="seat-summary-total">
                                        <div className="seat-summary-total-label">Tổng tiền</div>
                                        <div className="seat-summary-total-value">
                                            {selectedTicketType ? formatVnd(totalPrice) : '—'}
                                        </div>
                                    </div>

                                    <div className="seat-summary-note">
                                        {isSeatMapChecking
                                            ? 'Đang kiểm tra sơ đồ ghế...'
                                            : requiresSeatSelection
                                                ? 'Ghế sẽ được giữ tạm trong thời gian ngắn sau khi bạn chọn.'
                                                : 'Bạn có thể thanh toán ngay với loại vé này.'}
                                    </div>
                                </div>

                                <div className="seat-summary-cta">
                                    <Button
                                        variant="success"
                                        size="lg"
                                        className="seat-checkout-btn"
                                        onClick={handleProceedToCheckout}
                                        disabled={!selectedTicketType || isSeatMapChecking || !isSelectionComplete}
                                    >
                                        <CheckCircleOutlined /> Tiến hành thanh toán
                                    </Button>
                                </div>
                            </div>

                            {/* Mobile sticky bar */}
                            <div className="seat-mobile-bar">
                                <div className="seat-mobile-total">
                                    <div className="seat-mobile-total-label">Tổng tiền</div>
                                    <div className="seat-mobile-total-value">
                                        {selectedTicketType ? formatVnd(totalPrice) : '—'}
                                    </div>
                                </div>
                                <Button
                                    variant="success"
                                    className="seat-mobile-cta"
                                    onClick={handleProceedToCheckout}
                                    disabled={!selectedTicketType || isSeatMapChecking || !isSelectionComplete}
                                >
                                    Thanh toán
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default SeatSelection;
