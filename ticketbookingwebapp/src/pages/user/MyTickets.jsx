import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaQrcode, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/eventUtils';
import './MyTickets.css';

import { QRCodeSVG } from 'qrcode.react';

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

    const downloadQR = () => {
        const svg = document.getElementById('ticket-qr-code');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = 500;
            canvas.height = 500;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 50, 50, 400, 400);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `Ticket_${selectedTicket.ticket_code}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
                                                    className="w-100 qr-button shadow-sm fw-bold"
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

            {/* QR Code Modal - Premium Design */}
            <Modal show={showQRModal} onHide={handleCloseQR} centered size="md">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Vé Điện Tử</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-4">
                    {selectedTicket && (
                        <div className="qr-modal-content">
                            <div className="qr-code-wrapper mb-4 p-4 bg-white rounded-4 shadow-sm border border-success border-opacity-10 d-inline-block">
                                <QRCodeSVG
                                    id="ticket-qr-code"
                                    value={selectedTicket.ticket_code}
                                    size={256}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/favicon.ico", // Attempt to use favicon as center logo for premium feel
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    }}
                                />
                            </div>

                            <div className="qr-ticket-details border-top pt-4">
                                <Badge bg="success" className="mb-3 px-3 py-2 rounded-pill">
                                    {selectedTicket.ticket_type_name || 'Hợp lệ'}
                                </Badge>
                                <h4 className="fw-bold mb-2 text-dark">{selectedTicket.event_name}</h4>
                                <div className="text-secondary small mb-3">
                                    <div className="mb-1"><FaCalendarAlt className="me-2" />{formatDate(selectedTicket.event_date)}</div>
                                    <div><FaMapMarkerAlt className="me-2" />{selectedTicket.venue_name}</div>
                                </div>
                                <div className="qr-code-display p-3 bg-light rounded-3 mb-4">
                                    <div className="text-muted x-small mb-1">Mã xác nhận</div>
                                    <div className="h5 mb-0 fw-bold font-monospace letter-spacing-1">{selectedTicket.ticket_code}</div>
                                </div>

                                <p className="text-muted small mb-4 italic">
                                    Vui lòng xuất trình mã QR này để nhân viên quét khi vào cổng
                                </p>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="success"
                                        size="lg"
                                        className="rounded-3 shadow-sm fw-bold"
                                        onClick={downloadQR}
                                    >
                                        <FaDownload className="me-2" />
                                        Tải vé về điện thoại
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handleCloseQR}
                                        className="border-0"
                                    >
                                        Đóng
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default MyTickets;
