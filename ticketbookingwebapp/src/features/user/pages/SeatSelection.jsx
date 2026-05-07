import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { FaHome } from 'react-icons/fa';

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

const parseDateTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const getTicketSaleState = (ticketType) => {
    const now = new Date();
    const saleStart = parseDateTime(ticketType?.sale_start_date || ticketType?.SaleStartDate);
    const saleEnd = parseDateTime(ticketType?.sale_end_date || ticketType?.SaleEndDate);

    if (!saleStart || !saleEnd) return { isAvailable: false, label: 'Chưa cấu hình lịch bán' };
    if (now < saleStart) return { isAvailable: false, label: 'Chưa mở bán' };
    if (now > saleEnd) return { isAvailable: false, label: 'Đã hết thời gian bán' };
    return { isAvailable: true, label: 'Đang mở bán' };
};

const SeatSelection = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, triggerLogin } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTicketType, setSelectedTicketType] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [hasSeatMap, setHasSeatMap] = useState({});
    const [quantity, setQuantity] = useState(1);

    const ticketTypeIdFromState = location.state?.ticketTypeId;

    useEffect(() => {
        window.scrollTo(0, 0);
        loadEvent();
    }, [eventId]);

    useEffect(() => {
        if (ticketTypeIdFromState && event?.ticket_types) {
            const ticketType = event.ticket_types.find((t) => t.ticket_type_id === parseInt(ticketTypeIdFromState, 10));
            if (ticketType && getTicketSaleState(ticketType).isAvailable) {
                setSelectedTicketType(ticketType);
                setQuantity(location.state?.quantity || 1);
            }
            return;
        }

        if (event?.ticket_types?.length > 0 && !selectedTicketType) {
            const firstAvailable = event.ticket_types.find((t) => getTicketSaleState(t).isAvailable);
            setSelectedTicketType(firstAvailable || event.ticket_types[0]);
        }
    }, [event, ticketTypeIdFromState, location.state]);

    const loadEvent = async () => {
        if (!eventId) return;
        try {
            setLoading(true);
            const response = await api.getEvent(eventId);
            if (!response.success) {
                message.error(response.message || 'Không thể tải dữ liệu sự kiện');
                return;
            }

            const eventData = response.data;
            if (eventData.ticket_types && typeof eventData.ticket_types === 'object' && !Array.isArray(eventData.ticket_types)) {
                eventData.ticket_types = Object.values(eventData.ticket_types);
            }
            setEvent(eventData);

            if (eventData.ticket_types) {
                setHasSeatMap(
                    eventData.ticket_types.reduce((acc, tt) => {
                        acc[tt.ticket_type_id] = undefined;
                        return acc;
                    }, {})
                );

                eventData.ticket_types.forEach(async (tt) => {
                    const mappedSeats = tt.selected_seats || tt.SelectedSeats;
                    if (Array.isArray(mappedSeats) && mappedSeats.length > 0) {
                        setHasSeatMap((prev) => ({ ...prev, [tt.ticket_type_id]: true }));
                        return;
                    }

                    try {
                        const seatRes = await seatApi.getSeatsByTicketType(eventId, tt.ticket_type_id);
                        const exists = seatRes.success && Array.isArray(seatRes.data) && seatRes.data.length > 0;
                        setHasSeatMap((prev) => ({ ...prev, [tt.ticket_type_id]: exists }));
                    } catch {
                        setHasSeatMap((prev) => ({ ...prev, [tt.ticket_type_id]: false }));
                    }
                });
            }
        } catch (error) {
            message.error(error.message || 'Không thể tải dữ liệu sự kiện');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatSelection = (seats) => {
        setSelectedSeats(seats || []);
        setQuantity((seats || []).length || 1);
    };

    const handleTicketTypeChange = (ticketType) => {
        setSelectedTicketType(ticketType);
        setSelectedSeats([]);
        setQuantity(1);
    };

    const handleProceedToCheckout = () => {
        if (!selectedTicketType) {
            message.warning('Vui lòng chọn loại vé');
            return;
        }

        const saleState = getTicketSaleState(selectedTicketType);
        if (!saleState.isAvailable) {
            message.warning(`Loại vé này không khả dụng: ${saleState.label}`);
            return;
        }

        const ticketTypeId = selectedTicketType.ticket_type_id;
        const seatMapState = hasSeatMap[ticketTypeId];

        if (seatMapState === undefined) {
            message.info('Đang kiểm tra sơ đồ ghế. Vui lòng chờ...');
            return;
        }

        if (seatMapState !== true) {
            message.error('Sự kiện chưa có sơ đồ ghế. Organizer cần cấu hình ghế trước khi checkout.');
            return;
        }

        if (selectedSeats.length === 0) {
            message.warning('Vui lòng chọn ít nhất 1 ghế trước khi thanh toán');
            return;
        }

        if (!isAuthenticated) {
            triggerLogin({
                action: 'checkout',
                eventId: parseInt(eventId, 10),
                state: {
                    selectedTickets: { [ticketTypeId]: selectedSeats.length },
                    selectedSeats: { [ticketTypeId]: selectedSeats },
                    hasSeatMap: { [ticketTypeId]: true },
                },
            });
            return;
        }

        const navigationId = `checkout_${eventId}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        sessionStorage.setItem(`checkout_nav_id_${eventId}`, navigationId);

        navigate(`/checkout/${eventId}`, {
            state: {
                selectedTickets: { [ticketTypeId]: selectedSeats.length },
                selectedSeats: { [ticketTypeId]: selectedSeats },
                hasSeatMap: { [ticketTypeId]: true },
                fromSeatSelection: true,
                navigationId,
            },
            replace: false,
        });
    };

    const handleBack = () => {
        if (eventId) {
            navigate(`/event/${eventId}`);
            return;
        }
        navigate(-1);
    };

    if (loading) return <LoadingSpinner fullScreen tip="Đang tải thông tin sự kiện..." />;

    if (!event) {
        return (
            <Container className="my-5 py-5 text-center">
                <h2>Không tìm thấy sự kiện</h2>
                <Button onClick={() => navigate('/')} className="mt-3">Quay lại trang chủ</Button>
            </Container>
        );
    }

    if (!event.ticket_types || event.ticket_types.length === 0) {
        return (
            <Container className="my-5 py-5 text-center">
                <h2>Sự kiện này chưa có loại vé nào</h2>
                <Button onClick={handleBack} className="mt-3">Quay lại</Button>
            </Container>
        );
    }

    const seatMapState = selectedTicketType ? hasSeatMap[selectedTicketType.ticket_type_id] : undefined;
    const isSeatMapChecking = selectedTicketType ? seatMapState === undefined : false;
    const seatMapMissing = selectedTicketType ? seatMapState === false : false;
    const isSelectionComplete = !!selectedTicketType && !seatMapMissing && selectedSeats.length > 0;
    const totalPrice = selectedTicketType ? selectedTicketType.price * selectedSeats.length : 0;

    return (
        <div className="seat-selection-page">
            <Container>
                <AntBreadcrumb
                    items={[
                        { label: 'Trang chủ', path: '/', icon: <FaHome /> },
                        { label: event.event_name || 'Sự kiện', path: `/event/${eventId}` },
                        { label: 'Chọn ghế', path: '' },
                    ]}
                />

                <div className="seat-hero">
                    <div className="seat-hero-inner">
                        <div className="seat-hero-title-row">
                            <h2 className="seat-hero-title">{event.event_name}</h2>
                        </div>
                        <div className="seat-hero-subtitle">
                            Vé luôn bắt buộc chọn ghế. Mỗi ghế tương ứng với 1 vé.
                        </div>
                    </div>
                </div>

                <Row className="g-4">
                    <Col lg={8} xl={9}>
                        <Card className="seat-panel mb-4">
                            <Card.Body className="p-0">
                                <div className="seat-panel-header">
                                    <div>
                                        <div className="seat-panel-title">Chọn loại vé</div>
                                        <div className="seat-panel-desc">Chạm để chọn loại vé trước khi chọn ghế.</div>
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
                                        const saleState = getTicketSaleState(tt);

                                        return (
                                            <button
                                                key={tt.ticket_type_id}
                                                type="button"
                                                className={`seat-ticket-card ${isActive ? 'active' : ''}`}
                                                onClick={() => handleTicketTypeChange(tt)}
                                                disabled={!saleState.isAvailable}
                                                aria-label={`Chọn loại vé ${tt.type_name}`}
                                            >
                                                <div className="seat-ticket-top">
                                                    <div className="seat-ticket-name">{tt.type_name}</div>
                                                    <div className="seat-ticket-price">
                                                        {tt.price > 0 ? formatVnd(tt.price) : 'Miễn phí'}
                                                    </div>
                                                </div>
                                                <div className="seat-ticket-meta">
                                                    <span className="seat-meta-chip">Còn lại {tt.available_quantity ?? tt.quantity ?? 0} vé</span>
                                                    <span className={`seat-meta-chip ${saleState.isAvailable ? 'chip-green' : ''}`}>{saleState.label}</span>
                                                    <span className={`seat-meta-chip ${ttSeatMapState === true ? 'chip-green' : ''}`}>
                                                        {ttSeatMapState === undefined
                                                            ? 'Đang kiểm tra sơ đồ...'
                                                            : ttSeatMapState
                                                                ? 'Bắt buộc chọn ghế'
                                                                : 'Chưa có sơ đồ ghế'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card.Body>
                        </Card>

                        <Card className="seat-panel">
                            <Card.Body className="seat-panel-body">
                                <div className="seat-panel-header compact">
                                    <div>
                                        <div className="seat-panel-title">Chọn ghế</div>
                                        <div className="seat-panel-desc">
                                            {isSeatMapChecking ? 'Đang kiểm tra sơ đồ ghế...' : 'Chọn ghế ngồi của bạn. Mỗi ghế tương ứng với 1 vé.'}
                                        </div>
                                    </div>
                                    <div className="seat-progress-chip" aria-label="Số ghế đã chọn">
                                        {selectedSeats.length} ghế
                                    </div>
                                </div>

                                {selectedSeats.length > 0 ? (
                                    <CountdownTimer
                                        hasSelectedSeats={selectedSeats.length > 0}
                                        eventId={event.event_id}
                                        onExpired={async () => {
                                            message.warning('Thời gian giữ ghế đã hết. Vui lòng chọn lại ghế.');
                                            if (user && event?.event_id) {
                                                try {
                                                    await seatApi.unlockAllSeats(user.user_id, event.event_id);
                                                } catch (_) {}
                                                localStorage.removeItem(`seat_reservations_${event.event_id}_${user.user_id}`);
                                                sessionStorage.removeItem(`seat_timer_start_${event.event_id}`);
                                            }
                                            setSelectedSeats([]);
                                        }}
                                    />
                                ) : null}

                                {selectedTicketType ? (
                                    <div className="seat-map-wrapper">
                                        <SeatMap
                                            eventId={event.event_id}
                                            ticketType={selectedTicketType}
                                            maxSelection={Number.MAX_SAFE_INTEGER}
                                            onSelectionChange={handleSeatSelection}
                                            onSeatsLoaded={(exists) => {
                                                setHasSeatMap((prev) => ({ ...prev, [selectedTicketType.ticket_type_id]: exists }));
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="seat-empty-hint">Hãy chọn loại vé để hiển thị sơ đồ ghế.</div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4} xl={3}>
                        <div className="seat-sidebar">
                            <div className="seat-summary-card">
                                <div className="seat-summary-header">
                                    <div>
                                        <div className="seat-summary-title">Tóm tắt</div>
                                        <div className="seat-summary-subtitle">Đã chọn {selectedSeats.length} ghế</div>
                                    </div>
                                    <div className={`seat-summary-status ${isSelectionComplete ? 'ok' : ''}`}>
                                        {isSelectionComplete ? 'Sẵn sàng' : 'Chưa đủ'}
                                    </div>
                                </div>

                                <div className="seat-summary-body">
                                    <div className="seat-summary-row">
                                        <div className="seat-summary-label">Loại vé</div>
                                        <div className="seat-summary-value">{selectedTicketType ? selectedTicketType.type_name : '—'}</div>
                                    </div>
                                    <div className="seat-summary-row">
                                        <div className="seat-summary-label">Số lượng</div>
                                        <div className="seat-summary-value">{selectedSeats.length || '—'}</div>
                                    </div>
                                    <div className="seat-summary-row">
                                        <div className="seat-summary-label">Ghế</div>
                                        <div className="seat-summary-value seats">
                                            {selectedSeats.length > 0 ? selectedSeats.map((s) => s.seat_label || s.seat_number).join(', ') : 'Chưa chọn'}
                                        </div>
                                    </div>

                                    <div className="seat-summary-total">
                                        <div className="seat-summary-total-label">Tổng tiền</div>
                                        <div className="seat-summary-total-value">{selectedTicketType ? formatVnd(totalPrice) : '—'}</div>
                                    </div>
                                </div>

                                <div className="seat-summary-cta">
                                    <Button
                                        variant="success"
                                        size="lg"
                                        className="seat-checkout-btn"
                                        onClick={handleProceedToCheckout}
                                        disabled={!selectedTicketType || isSeatMapChecking}
                                    >
                                        <CheckCircleOutlined /> Tiến hành thanh toán
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default SeatSelection;
