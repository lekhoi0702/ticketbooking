import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaTicketAlt, FaHistory, FaEye, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/eventUtils';

const MyOrders = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);

    // Mock user ID (In real app, get from auth context)
    const userId = 1;

    useEffect(() => {
        fetchUserOrders();
    }, []);

    const fetchUserOrders = async () => {
        try {
            setLoading(true);
            const res = await api.getUserOrders(userId);
            if (res.success) {
                setOrders(res.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            'PAID': { bg: 'success', text: 'Đã thanh toán' },
            'PENDING': { bg: 'warning', text: 'Chờ thanh toán' },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy' },
            'COMPLETED': { bg: 'primary', text: 'Hoàn thành' }
        };
        const s = statuses[status] || { bg: 'secondary', text: status };
        return <Badge bg={s.bg} className="px-3 py-2 lh-1">{s.text}</Badge>;
    };


    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="success" />
                <p className="mt-2 text-muted">Đang tải lịch sử đặt vé...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="d-flex align-items-center mb-4">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <FaHistory className="text-success fs-4" />
                </div>
                <div>
                    <h2 className="fw-bold mb-0">Vé đã mua</h2>
                    <p className="text-muted mb-0">Quản lý các đơn hàng và vé điện tử của bạn</p>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {orders.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4 text-center py-5">
                    <Card.Body>
                        <FaTicketAlt className="text-muted mb-3 opacity-25" size={80} />
                        <h4>Bạn chưa có đơn hàng nào</h4>
                        <p className="text-muted">Hãy khám phá các sự kiện hấp dẫn và đặt vé ngay!</p>
                        <Link to="/" className="btn btn-success px-4 mt-2 shadow-sm">Khám phá ngay</Link>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    {orders.map((order) => (
                        <Col lg={12} key={order.order_id} className="mb-4">
                            <Card className="border-0 shadow-sm rounded-4 overflow-hidden order-card transition-all">
                                <Card.Body className="p-0">
                                    <Row className="g-0">
                                        <Col md={3} className="bg-light d-flex flex-column justify-content-center align-items-center p-4 border-end">
                                            <div className="text-muted small mb-1 uppercase fw-bold">Mã đơn hàng</div>
                                            <div className="fw-bold text-primary fs-5 mb-2">{order.order_code}</div>
                                            {getStatusBadge(order.order_status)}
                                        </Col>
                                        <Col md={9} className="p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h5 className="fw-bold mb-1 hover-text-success cursor-pointer">
                                                        {order.event_name || 'Đơn hàng dịch vụ'}
                                                    </h5>
                                                    <div className="d-flex gap-3 text-muted small">
                                                        <span><FaCalendarAlt className="me-1 text-primary" /> {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                                        <span><FaTicketAlt className="me-1 text-success" /> Tổng tiền: <strong>{formatCurrency(order.total_amount)}</strong></span>
                                                    </div>
                                                </div>
                                                <Button
                                                    as={Link}
                                                    to={`/order-success/${order.order_code}`}
                                                    variant="outline-primary"
                                                    className="rounded-pill px-4"
                                                    size="sm"
                                                >
                                                    <FaEye className="me-2" /> Chi tiết vé
                                                </Button>
                                            </div>
                                            <hr className="my-3 opacity-10" />
                                            <div className="small text-muted d-flex align-items-center">
                                                <div className="bg-info bg-opacity-10 p-2 rounded-3 me-3">
                                                    📧 Gửi tới: <strong>{order.customer_email}</strong>
                                                </div>
                                                <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                                                    📞 SĐT: <strong>{order.customer_phone}</strong>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <style>{`
                .order-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
                }
                .hover-text-success:hover {
                    color: #198754;
                }
            `}</style>
        </Container>
    );
};

export default MyOrders;
