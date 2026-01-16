import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Alert, Button, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaTicketAlt, FaCalendar, FaMapMarkerAlt, FaChair, FaDownload } from 'react-icons/fa';
import { api } from '@services/api';
import { formatCurrency, getImageUrl } from '@shared/utils/eventUtils';
import { QRCodeSVG } from 'qrcode.react';
import LoadingSpinner from '@shared/components/LoadingSpinner';

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

    if (loading) return <LoadingSpinner tip="Đang tải thông tin vé..." />;

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
                        <div className={`position-absolute top-0 start-0 w-100 h-100 ${order.order_status === 'PAID' ? 'bg-success' : 'bg-warning'} bg-opacity-10`} style={{ zIndex: 0 }}></div>
                        <Card.Body className="position-relative" style={{ zIndex: 1 }}>
                            {order.order_status === 'PAID' ? (
                                <>
                                    <FaCheckCircle className="text-success mb-3" size={70} />
                                    <h2 className="fw-bold mb-2">Thanh toán thành công!</h2>
                                    <p className="text-muted">Giao dịch của bạn đã được xác nhận. Chúc bạn có những giây phút tuyệt vời.</p>
                                    <Badge bg="success" className="px-4 py-2 fs-6 pill shadow-sm">
                                        Đã thanh toán
                                    </Badge>
                                </>
                            ) : (
                                <>
                                    <div className="spinner-border text-warning mb-3" role="status" style={{ width: '70px', height: '70px' }}></div>
                                    <h2 className="fw-bold mb-2">Đang xử lý thanh toán</h2>
                                    <p className="text-muted">Hệ thống đang cập nhật trạng thái đơn hàng. Vui lòng đợi trong giây lát hoặc kiểm tra lịch sử đơn hàng.</p>
                                    <Badge bg="warning" text="dark" className="px-4 py-2 fs-6 pill shadow-sm">
                                        Đang xử lý
                                    </Badge>
                                </>
                            )}
                        </Card.Body>
                    </Card>

                    <Row>
                        <Col md={7}>
                            <h5 className="fw-bold mb-3 d-flex align-items-center">
                                <FaTicketAlt className="me-2 text-primary" /> Vé điện tử của bạn
                            </h5>
                            {tickets.map((ticket, idx) => (
                                <Card key={ticket.ticket_id} className="border-0 shadow-sm mb-3 rounded-4 overflow-hidden ticket-compact-card">
                                    <div className="ticket-compact-content p-3 flex-grow-1 bg-white position-relative">
                                        <div className="notch notch-top" style={{ top: '-10px', left: '-10px', position: 'absolute', width: '20px', height: '20px', backgroundColor: '#f8f9fa', borderRadius: '50%' }}></div>
                                        <div className="notch notch-bottom" style={{ bottom: '-10px', left: '-10px', position: 'absolute', width: '20px', height: '20px', backgroundColor: '#f8f9fa', borderRadius: '50%' }}></div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1 text-uppercase">{event?.event_name}</h6>
                                                <div className="small text-muted d-flex align-items-center mb-2">
                                                    <FaCalendar className="me-2 text-primary" /> {formatDateTime(event?.start_datetime)}
                                                </div>

                                                {ticket.seat ? (
                                                    <div className="bg-white border px-3 py-1 rounded-pill d-inline-flex align-items-center fw-bold small">
                                                        <FaChair className="me-1 text-success small" />
                                                        {ticket.seat.row_name}{ticket.seat.seat_number}
                                                    </div>
                                                ) : (
                                                    <Badge bg="light" text="dark" className="border">Vé chung</Badge>
                                                )}
                                            </div>
                                            <div className="text-end d-flex flex-column justify-content-between h-100">
                                                <div>
                                                    <div className="fw-bold text-dark fs-5">{formatCurrency(ticket.price)}</div>
                                                    <div className="small text-muted mb-2">Mã: {ticket.ticket_code}</div>
                                                </div>

                                                <div className="bg-light p-1 rounded-2 text-center d-flex align-items-center justify-content-center" style={{ width: '85px', height: '85px', margin: '0px 0px 0px auto' }}>
                                                    <div className="w-100 h-100 bg-white d-flex align-items-center justify-content-center rounded border overflow-hidden">
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticket_code}`}
                                                            alt="QR Code"
                                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                        <div style={{ display: 'none' }}>
                                                            <QRCodeSVG value={ticket.ticket_code} size={65} level="L" />
                                                        </div>
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
