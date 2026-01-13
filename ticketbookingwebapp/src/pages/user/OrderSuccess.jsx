import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Alert, Spinner, Button, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaTicketAlt, FaCalendar, FaMapMarkerAlt, FaChair, FaDownload } from 'react-icons/fa';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/eventUtils';

const OrderSuccess = () => {
    const { orderCode } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        if (orderCode) {
            fetchOrderData();
        }
    }, [orderCode]);

    const fetchOrderData = async () => {
        try {
            setLoading(true);
            const response = await api.getOrderByCode(orderCode);

            if (response.success) {
                setOrderData(response.data);
            } else {
                setError(response.message || 'Không tìm thấy đơn hàng');
            }
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };


    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return (
        <Container className="py-5 text-center">
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Đang tải thông tin vé...</p>
        </Container>
    );

    if (error || !orderData) return (
        <Container className="py-5">
            <Alert variant="danger">
                <h4>Lỗi!</h4>
                <p>{error || 'Không tìm thấy đơn hàng'}</p>
                <Link to="/" className="btn btn-outline-danger">Quay lại trang chủ</Link>
            </Alert>
        </Container>
    );

    const { order, tickets, payment, event } = orderData;

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={9}>
                    <Card className="border-0 shadow-sm mb-4 text-center rounded-4 py-4 overflow-hidden position-relative">
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-success bg-opacity-10" style={{ zIndex: 0 }}></div>
                        <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                            <FaCheckCircle className="text-success mb-3" size={70} />
                            <h2 className="fw-bold mb-2">Thanh toán thành công!</h2>
                            <p className="text-muted">Cảm ơn bạn. Chúc bạn có những giây phút tuyệt vời tại sự kiện.</p>
                            <Badge bg="success" className="px-4 py-2 fs-6 pill shadow-sm">
                                {order.order_status === 'PAID' ? 'Đã thanh toán' : 'Chờ xử lý'}
                            </Badge>
                        </Card.Body>
                    </Card>

                    <Row>
                        <Col md={7}>
                            <h5 className="fw-bold mb-3 d-flex align-items-center">
                                <FaTicketAlt className="me-2 text-primary" /> Vé điện tử của bạn
                            </h5>
                            {tickets.map((ticket, idx) => (
                                <Card key={ticket.ticket_id} className="border-0 shadow-sm mb-3 rounded-4 overflow-hidden ticket-card">
                                    <div className="d-flex h-100">
                                        <div className="bg-primary p-3 d-flex flex-column justify-content-center align-items-center text-white" style={{ width: '80px' }}>
                                            <div className="small opacity-75">VÉ</div>
                                            <div className="fs-3 fw-bold">#{idx + 1}</div>
                                        </div>
                                        <div className="p-3 flex-grow-1 bg-white position-relative">
                                            <div className="position-absolute top-0 start-0 translate-middle-y bg-light rounded-circle" style={{ width: '20px', height: '20px', left: '-10px' }}></div>
                                            <div className="position-absolute bottom-0 start-0 translate-middle-y bg-light rounded-circle" style={{ width: '20px', height: '20px', left: '-10px' }}></div>

                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold mb-1 text-uppercase">{event?.event_name}</h6>
                                                    <div className="small text-muted d-flex align-items-center mb-2">
                                                        <FaCalendar className="me-2" /> {formatDateTime(event?.start_datetime)}
                                                    </div>

                                                    {ticket.seat ? (
                                                        <div className="bg-success bg-opacity-10 text-success px-3 py-2 rounded-3 d-inline-flex align-items-center fw-bold">
                                                            <FaChair className="me-2" />
                                                            Hàng {ticket.seat.row_name} - Ghế {ticket.seat.seat_number}
                                                        </div>
                                                    ) : (
                                                        <Badge bg="light" text="dark" className="border">Vé chung (Standard)</Badge>
                                                    )}
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-dark fs-5">{formatCurrency(ticket.price)}</div>
                                                    <div className="small text-muted mb-2">Mã: {ticket.ticket_code}</div>
                                                    <div className="bg-light p-2 rounded-2 text-center" style={{ width: '80px', height: '80px', margin: '0 0 0 auto' }}>
                                                        <div className="w-100 h-100 border border-secondary border-2 opacity-25 d-flex align-items-center justify-content-center" style={{ fontSize: '8px' }}>QR CODE</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </Col>

                        <Col md={5}>
                            <Card className="border-0 shadow-sm rounded-4 mb-4">
                                <Card.Header className="bg-white py-3">
                                    <h6 className="mb-0 fw-bold">Thông tin đơn hàng</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <div className="text-muted small">Mã giao dịch:</div>
                                        <div className="fw-bold">{order.order_code}</div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-muted small">Địa điểm:</div>
                                        <div className="fw-bold"><FaMapMarkerAlt className="text-danger me-1" />{event?.venue?.venue_name}</div>
                                        <div className="small text-muted ps-3">{event?.venue?.address}</div>
                                    </div>
                                    <hr className="opacity-10" />
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Tổng cộng:</span>
                                        <span className="fw-bold fs-5 text-primary">{formatCurrency(order.final_amount)}</span>
                                    </div>
                                    <Button variant="dark" className="w-100 mt-3 rounded-pill d-flex align-items-center justify-content-center shadow-sm">
                                        <FaDownload className="me-2" /> Tải vé PDF
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="text-center mt-4">
                        <Link to="/" className="btn btn-link text-decoration-none text-muted"> Quay lại trang chủ</Link>
                    </div>
                </Col>
            </Row>

            <style>{`
                .ticket-card { transition: transform 0.2s; }
                .ticket-card:hover { transform: translateY(-5px); }
                .pill { border-radius: 50px; }
            `}</style>
        </Container>
    );
};

export default OrderSuccess;
