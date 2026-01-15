import React from 'react';
import { Card, ListGroup, Badge, Button, Spinner } from 'react-bootstrap';
import { FaTicketAlt } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/eventUtils';

/**
 * Component tóm tắt đơn hàng (sidebar)
 */
const OrderSummary = ({
    event,
    ticketTypes,
    selectedTickets,
    selectedSeats,
    calculateTotal,
    getTotalTickets,
    paymentMethod,
    processing
}) => {
    if (!event) return null;

    return (
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden order-summary-sidebar">
            <Card.Header className="py-3" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none' }}>
                <h5 className="mb-0 fw-bold text-center">Tóm tắt đơn hàng</h5>
            </Card.Header>
            <Card.Body className="p-4">
                <div className="mb-4">
                    <h6 className="text-uppercase small fw-bold text-muted mb-2 letter-spacing-1">Sự kiện</h6>
                    <h6 className="fw-bold fs-5 color-primary">{event.event_name}</h6>
                    <p className="text-muted mb-0 small">
                        <FaTicketAlt className="me-2" />{event.venue?.venue_name}
                    </p>
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
                                                    <Badge bg="white" text="dark" className="border px-2 py-1 rounded-pill fw-bold small">
                                                        Ghế: {seats.map(s => `${s.row_name || ''}${s.seat_number || ''}`).join(', ')}
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
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
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
    );
};

export default OrderSummary;
