import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from 'react-bootstrap';
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
            'ACTIVE': { color: '#2DC275', text: 'Chưa sử dụng', icon: FaCheckCircle },
            'CANCELLED': { color: '#ff4d4f', text: 'Đã hủy', icon: null },
            'REFUNDED': { color: '#faad14', text: 'Đã hoàn tiền', icon: null }
        };
        const s = statuses[status] || { color: '#888', text: status, icon: null };
        return (
            <div className="d-inline-flex align-items-center gap-2" style={{
                color: s.color,
                fontWeight: 'bold',
                fontSize: '12px',
                letterSpacing: '0.5px'
            }}>
                {s.icon && <s.icon size={14} />}
                {s.text.toUpperCase()}
            </div>
        );
    };

    return (
        <div style={{ position: 'relative', minHeight: '200px' }}>
            {loading && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <LoadingSpinner tip="Đang tải vé của bạn..." />
                </div>
            )}

            {!loading && tickets.length === 0 ? (
                <Card className="border-0 shadow-sm rounded-4" style={{ background: '#121212', border: '1px solid #333 !important' }}>
                    <Card.Body className="text-center py-5">
                        <div style={{ fontSize: '80px', color: 'rgba(255, 255, 255, 0.1)' }}>
                            <FaTicketAlt />
                        </div>
                        <h3 className="mb-3 mt-4 text-white">Bạn chưa có vé nào</h3>
                        <p className="text-muted mb-4">
                            Khám phá các sự kiện hấp dẫn và đặt vé ngay để không bỏ lỡ những trải nghiệm tuyệt vời!
                        </p>
                        <Button variant="success" size="lg" className="px-5 shadow-sm" onClick={() => navigate('/')}>
                            Khám phá sự kiện
                        </Button>
                    </Card.Body>
                </Card>
            ) : !loading && (
                <div className="tickets-list">
                    {tickets.map((ticket) => (
                        <div className="ticket-card-container mb-4" key={ticket.ticket_id} onClick={() => handleShowQR(ticket)}>
                            <div className="ticket-main-part">
                                <div className="ticket-event-info">
                                    <div className="ticket-status-label">
                                        {getStatusBadge(ticket.ticket_status)}
                                    </div>
                                    <h3 className="ticket-event-title">{ticket.event_name || 'Sự kiện'}</h3>
                                    <div className="ticket-details-grid">
                                        <div className="detail-item">
                                            <FaCalendar className="detail-icon" />
                                            <span>{formatTime(ticket.event_date)} {formatDate(ticket.event_date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <FaMapMarkerAlt className="detail-icon" />
                                            <span>{ticket.venue_name || 'Địa điểm'}</span>
                                        </div>
                                        <div className="detail-item">
                                            <FaChair className="detail-icon" />
                                            <span>{ticket.seat ? `${ticket.seat.row_name}${ticket.seat.seat_number}` : (ticket.ticket_type_name || 'Vé tham dự')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="ticket-bottom-info">
                                    <div className="info-group">
                                        <div className="info-label">MÃ VÉ</div>
                                        <div className="info-value code-font">{ticket.ticket_code}</div>
                                    </div>
                                    <div className="info-group">
                                        <div className="info-label">GIÁ VÉ</div>
                                        <div className="info-value">{formatCurrency(ticket.price)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="ticket-perforation-divider">
                                <div className="perforation-notch notch-top"></div>
                                <div className="perforation-line"></div>
                                <div className="perforation-notch notch-bottom"></div>
                            </div>

                            <div className="ticket-stub-part">
                                <div className="stub-qr-wrapper">
                                    {ticket.ticket_code && (
                                        <QRCodeSVG
                                            id={`qr-${ticket.ticket_id}`}
                                            value={ticket.ticket_code}
                                            size={90}
                                            level="H"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
            <Modal show={showQRModal} onHide={handleCloseQR} centered dialogClassName="custom-qr-modal">
                <Modal.Header closeButton className="border-0 pb-0 bg-dark text-white custom-modal-header">
                    <Modal.Title className="fw-bold fs-5">Vé Điện Tử</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-3 bg-dark text-white">
                    {selectedTicket && (
                        <div className="qr-modal-horizontal">
                            <div className="qr-code-wrapper p-3 bg-white rounded-4 shadow-sm">
                                <QRCodeSVG
                                    id="ticket-qr-code-tab"
                                    value={selectedTicket.ticket_code || 'TICKET'}
                                    size={160}
                                    level="H"
                                />
                            </div>

                            <div className="qr-ticket-info-side text-center">
                                <div className="mb-2">
                                    {getStatusBadge(selectedTicket.ticket_status)}
                                </div>
                                <div className="mb-2 px-3 py-1 d-inline-block fw-bold" style={{ color: '#2DC275', fontSize: '12px' }}>
                                    {(selectedTicket.ticket_type_name || 'Vé tham dự').toUpperCase()}
                                </div>
                                <h5 className="fw-bold mb-1 text-white">{selectedTicket.event_name}</h5>
                                <div className="text-secondary small mb-2" style={{ fontSize: '12px' }}>
                                    <div className="mb-1"><FaCalendar className="me-2" />{formatDate(selectedTicket.event_date)}</div>
                                    <div className="mb-1"><FaMapMarkerAlt className="me-2" />{selectedTicket.venue_name}</div>
                                    <div className="fw-bold text-white mt-2" style={{ fontSize: '13px' }}>
                                        <FaChair className="me-2" style={{ color: '#2DC275' }} />
                                        {selectedTicket.seat ? `HÀNG GHẾ: ${selectedTicket.seat.row_name}${selectedTicket.seat.seat_number}` : `LOẠI VÉ: ${selectedTicket.ticket_type_name || 'Vé tham dự'}`}
                                    </div>
                                </div>


                                <p className="text-muted small mb-3 fst-italic" style={{ fontSize: '11px' }}>
                                    Vui lòng xuất trình mã QR này để nhân viên quét khi vào cổng
                                </p>

                                <div className="d-grid mt-auto">
                                    <Button
                                        variant="success"
                                        className="rounded-3 shadow-sm fw-bold py-2"
                                        onClick={downloadQR}
                                    >
                                        <FaDownload className="me-2" />
                                        Tải vé về điện thoại
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <style>{`
                .ticket-card-container {
                    display: flex;
                    height: 145px;
                    max-width: 700px;
                    margin: 0 0 24px 0;
                    border-radius: 16px;
                    position: relative;
                    background: #121212;
                    border: 2px solid #333;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    -webkit-mask-image: radial-gradient(circle at calc(100% - 150px) 0, transparent 12px, black 13px),
                                      radial-gradient(circle at calc(100% - 150px) 100%, transparent 12px, black 13px);
                    mask-image: radial-gradient(circle at calc(100% - 150px) 0, transparent 12px, black 13px),
                                radial-gradient(circle at calc(100% - 150px) 100%, transparent 12px, black 13px);
                    -webkit-mask-composite: source-in;
                    mask-composite: intersect;
                }

                .ticket-card-container:hover {
                    transform: translateY(-5px);
                    border-color: #2DC275;
                    box-shadow: 0 10px 30px rgba(45, 194, 117, 0.15);
                }

                .perforation-notch {
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    border: 2px solid #333;
                    border-radius: 50%;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 10;
                    background: transparent;
                }

                .notch-top { top: -17px; }
                .notch-bottom { bottom: -17px; }

                .ticket-card-container:hover .perforation-notch {
                    border-color: #2DC275;
                }

                .ticket-main-part {
                    flex: 1;
                    padding: 12px 18px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    background: transparent;
                }

                .ticket-event-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #fff;
                    margin: 2px 0;
                    text-transform: uppercase;
                }

                .ticket-details-grid {
                    display: flex;
                    gap: 20px;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #b0b3b8;
                    font-size: 0.85rem;
                }

                .detail-icon { color: #2DC275; }

                .ticket-bottom-info {
                    margin-top: auto;
                    border-top: 1px dashed rgba(255,255,255,0.1);
                    padding-top: 8px;
                    display: flex;
                    gap: 40px;
                    justify-content: flex-start;
                }

                .info-group {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .info-label {
                    font-size: 0.65rem;
                    color: #666;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: #2DC275;
                }

                .code-font {
                    font-family: 'Courier New', monospace;
                    color: #fff;
                    letter-spacing: 1px;
                }

                .ticket-perforation-divider {
                    width: 0;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .perforation-line {
                    height: calc(100% - 40px);
                    border-left: 1px dashed rgba(255,255,255,0.2);
                }

                .ticket-stub-part {
                    width: 150px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    border-left: 1px dashed rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.02);
                }

                .stub-qr-wrapper {
                    background: white;
                    padding: 8px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .ticket-status-label { margin-bottom: 8px; }

                .ticket-stamp {
                    color: #ff4d4f;
                    border: 2px solid #ff4d4f;
                    padding: 2px 8px;
                    text-transform: uppercase;
                    border-radius: 4px;
                    font-weight: 800;
                    font-size: 11px;
                    transform: rotate(-10deg);
                    display: inline-block;
                }

                @media (max-width: 768px) {
                    .ticket-card-container {
                        flex-direction: column;
                        height: auto;
                        -webkit-mask-image: none;
                        mask-image: none;
                    }
                    .ticket-stub-part {
                        width: 100%;
                        border-left: none;
                        border-top: 1px dashed rgba(255,255,255,0.2);
                    }
                    .perforation-notch { display: none; }
                }

                /* Horizontal Modal Layout */
                .qr-modal-horizontal {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    padding: 10px;
                }
                .qr-ticket-info-side {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .custom-modal-header .btn-close {
                    filter: invert(1) grayscale(100%) brightness(200%);
                }

                .custom-qr-modal {
                    max-width: 600px;
                }
            `}</style>
        </div>
    );
};

export default MyTicketsTab;
