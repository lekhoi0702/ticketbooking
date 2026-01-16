import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Spinner } from 'react-bootstrap';
import { FaTicketAlt, FaCalendar, FaMapMarkerAlt, FaChair, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@shared/utils/eventUtils';
import { QRCodeSVG } from 'qrcode.react';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const MyTicketsTab = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        if (user?.user_id) {
            fetchTickets();
        }
    }, [user?.user_id]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.getUserTickets(user.user_id);
            if (res.success) {
                setTickets(res.data);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
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
        const svg = document.getElementById('ticket-qr-code-tab');
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

    const getStatusBadge = (status) => {
        if (status === 'USED') {
            return (
                <div className="ticket-stamp">
                    ĐÃ CHECK-IN
                </div>
            );
        }

        const statuses = {
            'ACTIVE': { bg: 'success', text: 'Chưa sử dụng', icon: FaCheckCircle },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy', icon: null },
            'REFUNDED': { bg: 'warning', text: 'Đã hoàn tiền', icon: null }
        };
        const s = statuses[status] || { bg: 'secondary', text: status, icon: null };
        return (
            <div className={`badge bg-${s.bg} px-3 py-2 d-inline-flex align-items-center gap-2 rounded-pill`}>
                {s.icon && <s.icon className="me-1" />}
                {s.text}
            </div>
        );
    };

    if (loading) return <LoadingSpinner tip="Đang tải vé của bạn..." />;

    if (tickets.length === 0) {
        return (
            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="text-center py-5">
                    <div style={{ fontSize: '80px', color: 'rgba(0, 0, 0, 0.05)' }}>
                        <FaTicketAlt />
                    </div>
                    <h3 className="mb-3 mt-4">Bạn chưa có vé nào</h3>
                    <p className="text-muted mb-4">
                        Khám phá các sự kiện hấp dẫn và đặt vé ngay để không bỏ lỡ những trải nghiệm tuyệt vời!
                    </p>
                    <Button variant="success" size="lg" className="px-5 shadow-sm" onClick={() => navigate('/')}>
                        Khám phá sự kiện
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <div className="tickets-list">
                {tickets.map((ticket) => (
                    <Card
                        className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden ticket-compact-card clickable-card"
                        key={ticket.ticket_id}
                        onClick={() => handleShowQR(ticket)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="ticket-compact-content p-3 flex-grow-1 bg-white position-relative">
                            <div className="notch notch-top" style={{ top: '-10px', left: '-10px', position: 'absolute', width: '20px', height: '20px', backgroundColor: '#f8f9fa', borderRadius: '50%', zIndex: 2 }}></div>
                            <div className="notch notch-bottom" style={{ bottom: '-10px', left: '-10px', position: 'absolute', width: '20px', height: '20px', backgroundColor: '#f8f9fa', borderRadius: '50%', zIndex: 2 }}></div>

                            <div className="d-flex justify-content-between align-items-center">
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-1 pe-3">
                                        <h6 className="fw-bold mb-0 text-uppercase text-truncate" style={{ fontSize: '1.1rem', color: '#1f2937', maxWidth: '75%' }}>
                                            {ticket.event_name || 'Sự kiện'}
                                        </h6>
                                        <div style={{ transform: 'scale(0.9)', transformOrigin: 'right top' }}>
                                            {getStatusBadge(ticket.ticket_status)}
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 align-items-center">
                                        <div className="small text-muted d-flex align-items-center">
                                            <FaCalendar className="me-2 text-primary" />
                                            {formatTime(ticket.event_date)} {formatDate(ticket.event_date)}
                                        </div>

                                        {ticket.seat ? (
                                            <div className="bg-white border px-3 py-1 rounded-pill d-inline-flex align-items-center fw-bold small">
                                                <FaChair className="me-1 text-success small" />
                                                {ticket.seat.row_name}{ticket.seat.seat_number}
                                            </div>
                                        ) : (
                                            <div className="d-inline-flex align-items-center fw-bold small" style={{ background: 'rgba(45, 194, 117, 0.15)', color: '#2dc275', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid rgba(45, 194, 117, 0.3)' }}>
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
                                                    <QRCodeSVG value={ticket.ticket_code} size={65} level="L" />
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

            {/* QR Code Modal */}
            <Modal show={showQRModal} onHide={handleCloseQR} centered size="md">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Vé Điện Tử</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-4">
                    {selectedTicket && (
                        <div className="qr-modal-content">
                            <div className="qr-code-wrapper mb-4 p-4 bg-white rounded-4 shadow-sm border border-success border-opacity-10 d-inline-block">
                                <QRCodeSVG
                                    id="ticket-qr-code-tab"
                                    value={selectedTicket.ticket_code || 'TICKET'}
                                    size={256}
                                    level="H"
                                />
                            </div>

                            <div className="qr-ticket-details border-top pt-4">
                                <div className="mb-2 d-flex justify-content-center">
                                    {getStatusBadge(selectedTicket.ticket_status)}
                                </div>
                                <div className="badge bg-light text-dark d-inline-block mb-3 px-3 py-2 rounded-pill border">
                                    {selectedTicket.ticket_type_name || 'Vé tham dự'}
                                </div>
                                <h4 className="fw-bold mb-2">{selectedTicket.event_name}</h4>
                                <div className="text-secondary small mb-3">
                                    <div className="mb-1"><FaCalendar className="me-2" />{formatDate(selectedTicket.event_date)}</div>
                                    <div><FaMapMarkerAlt className="me-2" />{selectedTicket.venue_name}</div>
                                </div>
                                <div className="p-3 bg-light rounded-3 mb-4">
                                    <div className="text-muted small mb-1">Mã xác nhận</div>
                                    <div className="h5 mb-0 fw-bold font-monospace">{selectedTicket.ticket_code}</div>
                                </div>

                                <p className="text-muted small mb-4 fst-italic">
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
                                    <Button variant="outline-secondary" onClick={handleCloseQR} className="border-0">
                                        Đóng
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <style>{`
                .ticket-compact-card {
                    background: #ffffff !important;
                    border: 1px solid rgba(0, 0, 0, 0.05) !important;
                    border-radius: 16px !important;
                    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
                }

                .ticket-compact-card.clickable-card {
                    cursor: pointer;
                }

                .ticket-compact-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 24px rgba(45, 194, 117, 0.15) !important;
                    border-color: rgba(45, 194, 117, 0.3) !important;
                }

                .ticket-compact-content {
                    background: #ffffff !important;
                    padding: 24px !important;
                    position: relative;
                }

                .tickets-list {
                    max-width: 100%;
                }
                .ticket-stamp {
                    color: #c0392b;
                    border: 3px double #c0392b;
                    display: inline-block;
                    padding: 4px 12px;
                    text-transform: uppercase;
                    border-radius: 8px;
                    font-family: 'Courier New', Courier, monospace;
                    font-weight: 700;
                    font-size: 14px;
                    transform: rotate(-12deg);
                    letter-spacing: 1px;
                    background: rgba(192, 57, 43, 0.05);
                    white-space: nowrap;
                }
            `}</style>
        </>
    );
};

export default MyTicketsTab;
