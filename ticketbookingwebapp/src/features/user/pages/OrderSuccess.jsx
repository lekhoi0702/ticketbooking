import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Alert, Row, Col, Badge } from 'react-bootstrap';
import { FaCheckCircle, FaTicketAlt, FaCalendar, FaMapMarkerAlt, FaChair } from 'react-icons/fa';
import { api } from '@services/api';
import { formatCurrency } from '@shared/utils/eventUtils';
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

    if (loading) return <LoadingSpinner tip="Đang tải thông tin vé..." />;

    if (error || !orderData) return (
        <Container className="py-5">
            <Alert variant="danger" className="bg-dark text-white border-danger">
                <h4>Lỗi!</h4>
                <p>{error || 'Không tìm thấy đơn hàng'}</p>
                <Link to="/" className="btn btn-outline-danger">Quay lại trang chủ</Link>
            </Alert>
        </Container>
    );

    const { order, tickets, event } = orderData;

    return (
        <Container className="py-5 order-success-page">
            <Row className="justify-content-center">
                <Col lg={10}>
                    {/* Header Status Card */}
                    <Card className="status-header-card border-0 shadow-lg mb-5 text-center rounded-4 overflow-hidden">
                        <Card.Body className="py-5">
                            {order.order_status === 'PAID' ? (
                                <>
                                    <div className="status-icon-wrapper mb-4">
                                        <FaCheckCircle className="text-success shadow-icon" size={80} />
                                    </div>
                                    <h1 className="fw-bold mb-3 text-white">Thanh toán thành công!</h1>
                                    <p className="text-secondary fs-5 mb-4">Cảm ơn bạn đã tin tưởng. Vé của bạn đã sẵn sàng sử dụng.</p>
                                    <div className="status-pill PAID">ĐÃ THANH TOÁN</div>
                                </>
                            ) : (
                                <>
                                    <div className="spinner-border text-warning mb-4" role="status" style={{ width: '80px', height: '80px' }}></div>
                                    <h1 className="fw-bold mb-3 text-white">Đang xử lý giao dịch</h1>
                                    <p className="text-secondary fs-5 mb-4">Hệ thống đang xác thực thanh toán của bạn. Vui lòng không đóng trình duyệt.</p>
                                    <div className="status-pill PENDING">ĐANG XỬ LÝ</div>
                                </>
                            )}
                        </Card.Body>
                    </Card>

                    <Row className="g-4">
                        {/* Tickets List */}
                        <Col lg={7}>
                            <h4 className="section-title mb-4">
                                <FaTicketAlt className="me-2 text-success" /> Danh sách vé của bạn
                            </h4>
                            <div className="tickets-stack">
                                {tickets.map((ticket) => (
                                    <div className="ticket-card-container mb-4" key={ticket.ticket_id}>
                                        <div className="ticket-main-part">
                                            <div className="ticket-event-info">
                                                <h3 className="ticket-event-title">{event?.event_name}</h3>
                                                <div className="ticket-details-grid">
                                                    <div className="detail-item">
                                                        <FaCalendar className="detail-icon" />
                                                        <span>{formatTime(event?.start_datetime)} {formatDate(event?.start_datetime)}</span>
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
                                                <QRCodeSVG
                                                    value={ticket.ticket_code}
                                                    size={110}
                                                    level="H"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>

                        {/* Order Summary */}
                        <Col lg={5}>
                            <h4 className="section-title mb-4 text-white">Chi tiết đơn hàng</h4>
                            <Card className="order-details-card border-0 shadow-lg rounded-4 overflow-hidden">
                                <Card.Body className="p-4">
                                    <div className="info-row mb-4">
                                        <span className="info-row-label">Mã đơn hàng:</span>
                                        <span className="info-row-value text-white">{order.order_code}</span>
                                    </div>
                                    <div className="info-row mb-4">
                                        <span className="info-row-label">Địa điểm:</span>
                                        <div className="info-row-value text-white d-flex align-items-start mt-1">
                                            <FaMapMarkerAlt className="text-danger me-2 mt-1" />
                                            <div>
                                                <div className="fw-bold">{event?.venue?.venue_name}</div>
                                                <div className="small text-secondary">{event?.venue?.address}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="info-row mb-4">
                                        <span className="info-row-label">Thời gian thanh toán:</span>
                                        <span className="info-row-value text-white">{formatDate(order.created_at)}</span>
                                    </div>

                                    <div className="payment-divider mb-4"></div>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="total-label text-white">Tổng cộng</span>
                                        <span className="total-value text-success">{formatCurrency(order.final_amount)}</span>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="border-0 bg-dark bg-opacity-50 p-4 text-center">
                                    <p className="text-secondary small mb-3">Bạn có thể xem lại vé trong mục "Cá nhân &gt; Vé của tôi"</p>
                                    <Link to="/" className="btn btn-success w-100 rounded-pill fw-bold py-2 shadow-sm">TIẾP TỤC KHÁM PHÁ</Link>
                                </Card.Footer>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <style>{`
                .order-success-page {
                    background: #000;
                    min-height: 100vh;
                }

                .status-header-card {
                    background: #121212;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .status-pill {
                    display: inline-block;
                    padding: 8px 30px;
                    border-radius: 50px;
                    font-weight: 800;
                    font-size: 14px;
                    letter-spacing: 1px;
                }

                .status-pill.PAID {
                    color: #52c41a;
                    border: 2px solid #52c41a;
                }
                
                .status-pill.PENDING {
                    color: #faad14;
                    border: 2px solid #faad14;
                }

                .shadow-icon {
                    filter: drop-shadow(0 0 15px rgba(82, 196, 26, 0.4));
                }

                .section-title {
                    color: #fff;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 1.1rem;
                }

                /* Realistic Ticket Styles (Matched with MyTicketsTab) */
                .ticket-card-container {
                    display: flex;
                    height: 200px;
                    border-radius: 16px;
                    position: relative;
                    background: #121212;
                    border: 2px solid #ffffff;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    -webkit-mask-image: radial-gradient(circle at calc(100% - 180px) 0, transparent 15px, black 16px),
                                      radial-gradient(circle at calc(100% - 180px) 100%, transparent 15px, black 16px);
                    mask-image: radial-gradient(circle at calc(100% - 180px) 0, transparent 15px, black 16px),
                                radial-gradient(circle at calc(100% - 180px) 100%, transparent 15px, black 16px);
                    -webkit-mask-composite: source-in;
                    mask-composite: intersect;
                }

                .ticket-main-part {
                    flex: 1;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .ticket-event-title {
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: #fff;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }

                .ticket-details-grid {
                    display: flex;
                    gap: 15px;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #b0b3b8;
                    font-size: 0.8rem;
                }

                .detail-icon { color: #52c41a; }

                .ticket-bottom-info {
                    margin-top: auto;
                    border-top: 1px dashed rgba(255,255,255,0.1);
                    padding-top: 12px;
                    display: flex;
                    gap: 30px;
                    justify-content: flex-start;
                }

                .info-group {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .info-label {
                    font-size: 0.6rem;
                    color: #666;
                    font-weight: 800;
                }

                .info-value {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #52c41a;
                }

                .code-font {
                    font-family: 'Courier New', monospace;
                    color: #fff;
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

                .perforation-notch {
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                    left: 50%;
                    transform: translateX(-50%);
                    background: transparent;
                }

                .notch-top { top: -17px; }
                .notch-bottom { bottom: -17px; }

                .ticket-stub-part {
                    width: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    border-left: 1px dashed rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.02);
                }

                .stub-qr-wrapper {
                    background: white;
                    padding: 8px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                /* Order Details Card */
                .order-details-card {
                    background: #121212;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .info-row-label {
                    color: #666;
                    font-size: 0.8rem;
                    display: block;
                    margin-bottom: 2px;
                }

                .info-row-value {
                    font-weight: 700;
                    font-size: 1rem;
                }

                .payment-divider {
                    height: 1px;
                    background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0));
                }

                .total-label {
                    font-size: 1.1rem;
                    font-weight: 700;
                }

                .total-value {
                    font-size: 1.8rem;
                    font-weight: 900;
                }

                @media (max-width: 991px) {
                    .ticket-card-container {
                        height: auto;
                        flex-direction: column;
                        -webkit-mask-image: none;
                        mask-image: none;
                    }
                    .ticket-stub-part {
                        width: 100%;
                        border-left: none;
                        border-top: 1px dashed rgba(255,255,255,0.2);
                        padding: 30px;
                    }
                    .perforation-notch { display: none; }
                }
            `}</style>
        </Container>
    );
};

export default OrderSuccess;
