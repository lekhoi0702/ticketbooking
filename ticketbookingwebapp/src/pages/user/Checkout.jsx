import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ListGroup, Tab, Tabs, Badge } from 'react-bootstrap';
import { FaTicketAlt, FaCreditCard, FaMoneyBillWave, FaShoppingCart, FaChair } from 'react-icons/fa';
import { api } from '../../services/api';
import SeatMap from '../../components/event/SeatMap';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/eventUtils';

const Checkout = () => {
    const { eventId } = useParams();
    const location = useLocation();
    const initialTickets = location.state?.selectedTickets || {};
    const initialSeats = location.state?.selectedSeats || {};
    const initialHasSeatMap = location.state?.hasSeatMap || {};
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);

    const [selectedTickets, setSelectedTickets] = useState(initialTickets); // { ticketTypeId: quantity }
    const [selectedSeats, setSelectedSeats] = useState(initialSeats); // { ticketTypeId: [seatObj, ...] }
    const [hasSeatMap, setHasSeatMap] = useState(initialHasSeatMap); // { ticketTypeId: boolean }

    const [customerInfo, setCustomerInfo] = useState({
        name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    useEffect(() => {
        if (user) {
            setCustomerInfo({
                name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');

    useEffect(() => {
        fetchEventData();
    }, [eventId]);

    const fetchEventData = async () => {
        try {
            setLoading(true);
            const [eventRes, ticketTypesRes] = await Promise.all([
                api.getEvent(eventId),
                api.getTicketTypes(eventId)
            ]);

            if (eventRes.success) {
                setEvent(eventRes.data);
            }
            if (ticketTypesRes.success) {
                const types = ticketTypesRes.data.filter(tt => tt.is_active);
                setTicketTypes(types);
            }
        } catch (err) {
            console.error('Error fetching event data:', err);
            setError('Không thể tải thông tin sự kiện');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        let total = 0;
        ticketTypes.forEach(tt => {
            const quantity = selectedTickets[tt.ticket_type_id] || 0;
            total += tt.price * quantity;
        });
        return total;
    };

    const getTotalTickets = () => {
        return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if all needed seats are selected
        // (For now, if a ticket type HAS seats in DB, we should require selection)
        // Simple logic: if getSeats API returned data for a type, we use those seats.

        if (getTotalTickets() === 0) {
            setError('Vui lòng chọn ít nhất một vé');
            return;
        }

        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            setError('Vui lòng điền đầy đủ thông tin liên hệ');
            return;
        }

        try {
            setProcessing(true);
            setError(null);

            // Prepare tickets data
            const tickets = [];
            Object.keys(selectedTickets).forEach(ticketTypeIdString => {
                const tid = parseInt(ticketTypeIdString);
                const quantity = selectedTickets[tid];
                const seatsForTid = selectedSeats[tid] || [];

                if (quantity > 0) {
                    // Check if seats are required but not fully selected
                    if (hasSeatMap[tid] && seatsForTid.length < quantity) {
                        throw new Error(`Vui lòng chọn đủ ${quantity} ghế cho loại vé ${ticketTypes.find(t => t.ticket_type_id === tid)?.type_name}`);
                    }

                    tickets.push({
                        ticket_type_id: tid,
                        quantity: quantity,
                        seat_ids: seatsForTid.map(s => s.seat_id)
                    });
                }
            });

            // Create order
            const orderData = {
                user_id: user.user_id,
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                customer_phone: customerInfo.phone,
                tickets: tickets
            };

            const orderResponse = await api.createOrder(orderData);

            if (!orderResponse.success) {
                throw new Error(orderResponse.message);
            }

            const orderId = orderResponse.data.order.order_id;

            // Handle payment based on method
            if (paymentMethod === 'VNPAY') {
                const paymentResponse = await api.createVNPayPaymentUrl(orderId);
                if (paymentResponse.success) {
                    window.location.href = paymentResponse.data.payment_url;
                } else {
                    throw new Error('Không thể tạo link thanh toán VNPay');
                }
            } else if (paymentMethod === 'CASH') {
                await api.createPayment({
                    order_id: orderId,
                    payment_method: 'CASH'
                });
                navigate(`/order-success/${orderResponse.data.order.order_code}`);
            }

        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.message || 'Không thể tạo đơn hàng');
            setProcessing(false);
        }
    };


    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải thông tin...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">
                <FaShoppingCart className="me-2 text-primary" />
                Hoàn tất đặt vé
            </h2>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col lg={8}>
                        {/* Selected Tickets Review */}
                        <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
                            <Card.Header className="bg-white py-3 border-bottom">
                                <h5 className="mb-0 fw-bold">
                                    <FaTicketAlt className="me-2 text-primary" />
                                    Vé Đã Chọn
                                </h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <ListGroup variant="flush">
                                    {ticketTypes.filter(tt => selectedTickets[tt.ticket_type_id] > 0).map(tt => (
                                        <ListGroup.Item key={tt.ticket_type_id} className="p-4 border-bottom-0">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h6 className="fw-bold mb-1">{tt.type_name}</h6>
                                                    <div className="text-muted small">Số lượng: {selectedTickets[tt.ticket_type_id]}</div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-primary">{formatCurrency(tt.price * selectedTickets[tt.ticket_type_id])}</div>
                                                    <div className="text-muted small">{formatCurrency(tt.price)} / vé</div>
                                                </div>
                                            </div>
                                            {hasSeatMap[tt.ticket_type_id] && selectedSeats[tt.ticket_type_id] && (
                                                <div className="mt-3 bg-light p-3 rounded-3">
                                                    <div className="small fw-bold text-muted mb-2 text-uppercase">Vị trí ghế</div>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {selectedSeats[tt.ticket_type_id].map(seat => (
                                                            <div key={seat.seat_id} className="bg-white border px-3 py-1 rounded-pill small fw-bold">
                                                                <FaChair className="me-1 text-success small" /> {seat.seat_label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                                <div className="p-4 bg-light border-top text-center">
                                    <Button variant="link" onClick={() => navigate(-1)} className="text-decoration-none text-muted small p-0">
                                        Thay đổi lựa chọn vé hoặc chỗ ngồi? Quay lại
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Customer Information */}
                        <Card className="mb-4 border-0 shadow-sm rounded-4">
                            <Card.Header className="bg-white py-3">
                                <h5 className="mb-0 fw-bold">Thông Tin Liên Hệ</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row>
                                    <Col md={12} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Họ và Tên <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Nhập họ và tên"
                                                value={customerInfo.name}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                                required
                                                className="py-2 px-3"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Email <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="example@email.com"
                                                value={customerInfo.email}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                                required
                                                className="py-2 px-3"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">Số Điện Thoại <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="tel"
                                                placeholder="0123456789"
                                                value={customerInfo.phone}
                                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                                required
                                                className="py-2 px-3"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* Payment Method */}
                        <Card className="mb-4 border-0 shadow-sm rounded-4">
                            <Card.Header className="bg-white py-3">
                                <h5 className="mb-0 fw-bold">Hình Thức Thanh Toán</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Form.Check
                                    type="radio"
                                    id="payment-vnpay"
                                    name="paymentMethod"
                                    label={
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                                                <FaCreditCard className="text-primary fs-4" />
                                            </div>
                                            <div>
                                                <strong className="d-block">Thanh toán online qua VNPay</strong>
                                                <small className="text-muted">ATM, Visa, MasterCard, QR Code</small>
                                            </div>
                                        </div>
                                    }
                                    value="VNPAY"
                                    checked={paymentMethod === 'VNPAY'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mb-3 p-3 border rounded-3 payment-check-item"
                                />
                                <Form.Check
                                    type="radio"
                                    id="payment-cash"
                                    name="paymentMethod"
                                    label={
                                        <div className="d-flex align-items-center">
                                            <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                                                <FaMoneyBillWave className="text-success fs-4" />
                                            </div>
                                            <div>
                                                <strong className="d-block">Thanh toán trực tiếp (Cash)</strong>
                                                <small className="text-muted">Thanh toán bằng tiền mặt tại sự kiện</small>
                                            </div>
                                        </div>
                                    }
                                    value="CASH"
                                    checked={paymentMethod === 'CASH'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="p-3 border rounded-3 payment-check-item"
                                />
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        {/* Order Summary Sidebar */}
                        <Card className="border-0 shadow-sm rounded-4 sticky-top overflow-hidden" style={{ top: '20px' }}>
                            <Card.Header className="bg-dark text-white py-3">
                                <h5 className="mb-0 fw-bold text-center">Tóm tắt đơn hàng</h5>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <div className="mb-4">
                                    <h6 className="text-uppercase small fw-bold text-muted mb-2 letter-spacing-1">Sự kiện</h6>
                                    <h6 className="fw-bold fs-5 color-primary">{event.event_name}</h6>
                                    <p className="text-muted mb-0 small"><FaTicketAlt className="me-2" />{event.venue?.venue_name}</p>
                                </div>

                                <hr className="opacity-10" />

                                <div className="mb-4">
                                    <h6 className="text-uppercase small fw-bold text-muted mb-3 letter-spacing-1">Vé đã chọn</h6>
                                    {getTotalTickets() > 0 ? (
                                        <ListGroup variant="flush">
                                            {ticketTypes.map(tt => {
                                                const qty = selectedTickets[tt.ticket_type_id] || 0;
                                                const seats = selectedSeats[tt.ticket_type_id] || [];
                                                if (qty > 0) {
                                                    return (
                                                        <ListGroup.Item key={tt.ticket_type_id} className="px-0 py-2 border-0">
                                                            <div className="d-flex justify-content-between">
                                                                <span className="fw-bold">{tt.type_name} x {qty}</span>
                                                                <span className="fw-bold">{formatCurrency(tt.price * qty)}</span>
                                                            </div>
                                                            {seats.length > 0 && (
                                                                <div className="mt-1">
                                                                    <Badge bg="light" text="dark" className="border fw-normal small">
                                                                        Ghế: {seats.map(s => s.seat_label).join(', ')}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </ListGroup.Item>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </ListGroup>
                                    ) : (
                                        <p className="text-muted small italic">Chưa có vé nào được chọn</p>
                                    )}
                                </div>

                                <div className="bg-light p-3 rounded-4 mb-4 mt-2">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-muted small">Tạm tính:</span>
                                        <span className="fw-bold">{formatCurrency(calculateTotal())}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                        <h5 className="mb-0 fw-bold">Tổng số tiền</h5>
                                        <h4 className="mb-0 text-primary fw-bold">{formatCurrency(calculateTotal())}</h4>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-100 py-3 rounded-4 shadow-sm fw-bold border-0 transition-all"
                                    type="submit"
                                    disabled={processing || getTotalTickets() === 0}
                                    style={{ background: 'linear-gradient(45deg, #0d6efd, #00d2ff)' }}
                                >
                                    {processing ? (
                                        <><Spinner animation="border" size="sm" className="me-2" /> Đang xử lý...</>
                                    ) : (
                                        <>{paymentMethod === 'VNPAY' ? 'Thanh toán ngay' : 'Xác nhận đặt vé'}</>
                                    )}
                                </Button>

                                <div className="text-center mt-3">
                                    <p className="text-muted" style={{ fontSize: '11px' }}>
                                        Bằng việc nhấn nút, bạn đồng ý với các Điều khoản & Chính sách của chúng tôi.
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>

            <style>{`
                .custom-tabs .nav-link { 
                    border: none; color: #6c757d; font-weight: 600; padding: 1rem 1.5rem; 
                }
                .custom-tabs .nav-link.active { 
                    color: #0d6efd; border-bottom: 3px solid #0d6efd; background: transparent; 
                }
                .payment-check-item { cursor: pointer; transition: all 0.2s; }
                .payment-check-item:hover { border-color: #0d6efd !important; background-color: #f8f9fa; }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </Container>
    );
};

export default Checkout;
