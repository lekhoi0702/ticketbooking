import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaQrcode, FaDownload, FaCheckCircle, FaChair } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import { formatCurrency } from '@shared/utils/eventUtils';
import './MyTickets.css';

import { QRCodeSVG } from 'qrcode.react';

import LoadingSpinner from '@shared/components/LoadingSpinner';

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
            'ACTIVE': { bg: 'success', text: 'Chưa sử dụng', icon: FaCheckCircle },
            'USED': { bg: 'secondary', text: 'Đã Check-in', icon: FaCheckCircle },
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
        return <LoadingSpinner tip="Đang tải vé của bạn..." />;
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
                        <div className="tickets-list">
                            {tickets.map((ticket, index) => (
                                <Card
                                    className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden ticket-compact-card clickable-card"
                                    key={ticket.ticket_id}
                                    onClick={() => handleShowQR(ticket)}
                                >
                                    <div className="ticket-compact-content p-3 flex-grow-1 bg-white position-relative">
                                        {/* Notches */}
                                        <div className="notch notch-top"></div>
                                        <div className="notch notch-bottom"></div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-1 pe-3">
                                                    <h6 className="ticket-event-name-compact fw-bold mb-0 text-uppercase text-truncate" style={{ maxWidth: '75%' }}>
                                                        {ticket.event_name || 'Sự kiện'}
                                                    </h6>
                                                    <div style={{ transform: 'scale(0.9)', transformOrigin: 'right top' }}>
                                                        {getStatusBadge(ticket.ticket_status)}
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2 align-items-center">
                                                    <div className="small text-muted d-flex align-items-center">
                                                        <FaCalendarAlt className="me-2 text-primary" />
                                                        {formatTime(ticket.event_date)} {formatDate(ticket.event_date)}
                                                    </div>

                                                    {ticket.seat ? (
                                                        <div className="bg-white border px-3 py-1 rounded-pill d-inline-flex align-items-center fw-bold small">
                                                            <FaChair className="me-1 text-success small" />
                                                            {ticket.seat.row_name}{ticket.seat.seat_number}
                                                        </div>
                                                    ) : (
                                                        <div className="ticket-zone-badge d-inline-flex align-items-center fw-bold small">
                                                            <FaTicketAlt className="me-2" />
                                                            {ticket.ticket_type_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-end d-flex flex-column justify-content-between h-100">
                                                <div>
                                                    <div className="fw-bold text-dark fs-5">{formatCurrency(ticket.price)}</div>
                                                    <div className="small text-muted mb-2">Mã: {ticket.ticket_code}</div>
                                                </div>

                                                <div className="bg-light p-1 rounded-2 text-center d-flex align-items-center justify-content-center" style={{ width: '85px', height: '85px', margin: '0px 0px 0px auto' }}>
                                                    <div className="w-100 h-100 bg-white d-flex align-items-center justify-content-center rounded border overflow-hidden">
                                                        {ticket.ticket_code ? (
                                                            <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticket_code}`}
                                                                alt="QR Code"
                                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div style={{ display: 'none' }}>
                                                            {ticket.ticket_code ? (
                                                                <QRCodeSVG
                                                                    value={ticket.ticket_code}
                                                                    size={65}
                                                                    level="L"
                                                                />
                                                            ) : (
                                                                <div style={{ fontSize: '8px' }}>NO CODE</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
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
                                    value={selectedTicket.ticket_code || 'TICKET'}
                                    size={256}
                                    level="H"
                                />
                            </div>

                            <div className="qr-ticket-details border-top pt-4">
                                <div className="mb-2 d-flex justify-content-center">
                                    {getStatusBadge(selectedTicket.ticket_status)}
                                </div>
                                <Badge bg="light" text="dark" className="d-inline-block mb-3 px-3 py-2 rounded-pill border">
                                    {selectedTicket.ticket_type_name}
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
