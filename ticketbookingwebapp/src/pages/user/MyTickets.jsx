import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaQrcode, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/eventUtils';
import './MyTickets.css';

const MyTickets = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/my-tickets' } });
            return;
        }
        fetchUserTickets();
    }, [isAuthenticated, navigate]);

    const fetchUserTickets = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use new dedicated endpoint for tickets
            const ticketsRes = await api.getUserTickets(user.user_id);

            if (ticketsRes.success && ticketsRes.data) {
                setTickets(ticketsRes.data);
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError('Không thể tải danh sách vé. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowQR = (ticket) => {
        setSelectedTicket(ticket);
        setShowQRModal(true);
    };

    const handleCloseQR = () => {
        setShowQRModal(false);
        setSelectedTicket(null);
    };

    const getStatusBadge = (status) => {
        const statuses = {
            'ACTIVE': { bg: 'success', text: 'Có hiệu lực', icon: FaCheckCircle },
            'USED': { bg: 'secondary', text: 'Đã sử dụng', icon: FaCheckCircle },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy', icon: null },
            'REFUNDED': { bg: 'warning', text: 'Đã hoàn tiền', icon: null }
        };
        const s = statuses[status] || { bg: 'secondary', text: status, icon: null };
        return (
            <Badge bg={s.bg} className="px-3 py-2 d-flex align-items-center gap-2">
                {s.icon && <s.icon />}
                {s.text}
            </Badge>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="success" size="lg" />
                <p className="mt-3 text-muted">Đang tải vé của bạn...</p>
            </Container>
        );
    }

    return (
        <div className="my-tickets-page">
            <Container className="py-5">
                {/* Header */}
                <div className="page-header mb-5">
                    <div className="d-flex align-items-center mb-2">
                        <div className="header-icon">
                            <FaTicketAlt />
                        </div>
                        <div>
                            <h1 className="page-title mb-0">Vé của tôi</h1>
                            <p className="page-subtitle mb-0">Quản lý và xem chi tiết vé điện tử</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Empty State */}
                {tickets.length === 0 ? (
                    <Card className="empty-state-card">
                        <Card.Body className="text-center py-5">
                            <div className="empty-icon mb-4">
                                <FaTicketAlt />
                            </div>
                            <h3 className="mb-3">Bạn chưa có vé nào</h3>
                            <p className="text-muted mb-4">
                                Khám phá các sự kiện hấp dẫn và đặt vé ngay để không bỏ lỡ những trải nghiệm tuyệt vời!
                            </p>
                            <Link to="/" className="btn btn-success btn-lg px-5 shadow-sm">
                                Khám phá sự kiện
                            </Link>
                        </Card.Body>
                    </Card>
                ) : (
                    <>
                        {/* Tickets Grid */}
                        <Row className="g-4">
                            {tickets.map((ticket) => (
                                <Col lg={6} key={ticket.ticket_id}>
                                    <Card className="ticket-card h-100">
                                        <Card.Body className="p-0">
                                            {/* Ticket Header */}
                                            <div className="ticket-header">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="flex-grow-1">
                                                        <h5 className="ticket-event-name mb-2">
                                                            {ticket.event_name || 'Sự kiện'}
                                                        </h5>
                                                        <div className="ticket-code mb-2">
                                                            <span className="code-label">Mã vé:</span>
                                                            <span className="code-value">{ticket.ticket_code}</span>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(ticket.ticket_status)}
                                                </div>
                                            </div>

                                            {/* Ticket Body */}
                                            <div className="ticket-body">
                                                <Row className="g-3">
                                                    <Col md={6}>
                                                        <div className="ticket-info-item">
                                                            <FaCalendarAlt className="info-icon" />
                                                            <div>
                                                                <div className="info-label">Ngày diễn ra</div>
                                                                <div className="info-value">
                                                                    {formatDate(ticket.event_date)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="ticket-info-item">
                                                            <FaClock className="info-icon" />
                                                            <div>
                                                                <div className="info-label">Giờ bắt đầu</div>
                                                                <div className="info-value">
                                                                    {formatTime(ticket.event_date)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={12}>
                                                        <div className="ticket-info-item">
                                                            <FaMapMarkerAlt className="info-icon" />
                                                            <div>
                                                                <div className="info-label">Địa điểm</div>
                                                                <div className="info-value">
                                                                    {ticket.venue_name || 'Chưa cập nhật'}
                                                                </div>
                                                                {ticket.venue_address && (
                                                                    <div className="info-subtext">
                                                                        {ticket.venue_address}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {/* Ticket Type & Price */}
                                                <div className="ticket-pricing mt-3 pt-3 border-top">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <span className="ticket-type-label">Loại vé:</span>
                                                            <span className="ticket-type-value ms-2">
                                                                {ticket.ticket_type_name || 'Standard'}
                                                            </span>
                                                        </div>
                                                        <div className="ticket-price">
                                                            {formatCurrency(ticket.price)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Holder Info */}
                                                {ticket.holder_name && (
                                                    <div className="ticket-holder mt-3 pt-3 border-top">
                                                        <div className="holder-label">Người sở hữu</div>
                                                        <div className="holder-name">{ticket.holder_name}</div>
                                                        {ticket.holder_email && (
                                                            <div className="holder-email">{ticket.holder_email}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Ticket Footer */}
                                            <div className="ticket-footer">
                                                <Button
                                                    variant="success"
                                                    className="w-100 qr-button"
                                                    onClick={() => handleShowQR(ticket)}
                                                    disabled={ticket.ticket_status === 'CANCELLED'}
                                                >
                                                    <FaQrcode className="me-2" />
                                                    Xem mã QR
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </Container>

            {/* QR Code Modal */}
            <Modal show={showQRModal} onHide={handleCloseQR} centered size="md">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title>Mã QR vé điện tử</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-4">
                    {selectedTicket && (
                        <>
                            <div className="qr-code-container mb-4">
                                {selectedTicket.qr_code_url ? (
                                    <img
                                        src={selectedTicket.qr_code_url}
                                        alt="QR Code"
                                        className="qr-code-image"
                                    />
                                ) : (
                                    <div className="qr-placeholder">
                                        <FaQrcode size={150} className="text-muted" />
                                        <p className="mt-3 text-muted">Mã QR đang được tạo...</p>
                                    </div>
                                )}
                            </div>

                            <div className="qr-ticket-info">
                                <h5 className="mb-3">{selectedTicket.event_name}</h5>
                                <div className="qr-code-text mb-3">
                                    <strong>Mã vé:</strong> {selectedTicket.ticket_code}
                                </div>
                                <p className="text-muted small mb-0">
                                    Vui lòng xuất trình mã QR này tại cổng vào sự kiện
                                </p>
                            </div>

                            {selectedTicket.qr_code_url && (
                                <Button
                                    variant="outline-success"
                                    className="mt-4 px-4"
                                    onClick={() => window.open(selectedTicket.qr_code_url, '_blank')}
                                >
                                    <FaDownload className="me-2" />
                                    Tải xuống mã QR
                                </Button>
                            )}
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default MyTickets;
