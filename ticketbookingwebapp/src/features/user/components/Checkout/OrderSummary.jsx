import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, ListGroup, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { FaTicketAlt, FaTag } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { formatCurrency, getImageUrl } from '@shared/utils/eventUtils';
import { QRCodeSVG } from 'qrcode.react';
import { paymentApi } from '@services/api/payment';

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
    processing,
    applyDiscount,
    discountAmount,
    isValidDiscount,
    discountMsg,
    readonly = false,
    qrData = null,
    onPaymentSuccess = null
}) => {
    const [couponCode, setCouponCode] = useState('');
    const [applying, setApplying] = useState(false);
    const [checking, setChecking] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const checkIntervalRef = useRef(null);

    // Auto-check payment status when QR is displayed
    useEffect(() => {
        if (qrData?.payment_code && paymentStatus === 'PENDING' && readonly) {
            checkIntervalRef.current = setInterval(() => {
                checkPaymentStatus();
            }, 5000);
        }

        return () => {
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrData, paymentStatus, readonly]);

    const checkPaymentStatus = useCallback(async () => {
        if (!qrData?.payment_code || checking) return;

        try {
            setChecking(true);
            const response = await paymentApi.checkVietQRStatus(qrData.payment_code);
            
            if (response.success) {
                const status = response.data.payment_status;
                setPaymentStatus(status);
                
                if (status === 'SUCCESS') {
                    await verifyPayment();
                }
            }
        } catch (err) {
            console.error('Error checking payment status:', err);
        } finally {
            setChecking(false);
        }
    }, [qrData?.payment_code, checking]);

    const verifyPayment = async () => {
        try {
            const response = await paymentApi.verifyVietQRPayment(qrData.payment_code);
            
            if (response.success && onPaymentSuccess) {
                onPaymentSuccess(response.data.order_code);
            }
        } catch (err) {
            console.error('Error verifying payment:', err);
        }
    };

    if (!event) return null;

    const handleApply = async () => {
        if (!couponCode) return;
        setApplying(true);
        // Call parent method
        await applyDiscount(couponCode);
        setApplying(false);
    };

    const finalTotal = calculateTotal();
    const subTotal = finalTotal + (discountAmount || 0);

    return (
        <Card className={`h-100 w-100 d-flex flex-column border-0 shadow-sm rounded-4 order-summary-sidebar ${readonly && qrData && paymentMethod === 'VIETQR' ? 'overflow-visible' : 'overflow-hidden'}`}>
            <Card.Header className="py-3 flex-shrink-0" style={{ background: '#2DC275', color: 'white', border: 'none' }}>
                <h5 className="mb-0 fw-bold text-center">Tóm tắt đơn hàng</h5>
            </Card.Header>
            <Card.Body className="p-4 d-flex flex-column flex-grow-1">
                <div className="flex-grow-1">
                <div className="mb-4">
                    <h6 className="text-uppercase small fw-bold text-muted mb-2 letter-spacing-1">Sự kiện</h6>
                    <h6 className="fw-bold fs-5 color-primary">{event.event_name}</h6>
                    <p className="text-muted mb-0 small">
                        <FaTicketAlt className="me-2" />{event.venue?.venue_name}
                    </p>
                </div>

                <hr className="opacity-10" />

                <div className="mb-3">
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

                {/* Coupon Section */}
                {!readonly && (
                    <div className="mb-4">
                    <h6 className="text-uppercase small fw-bold text-muted mb-2 letter-spacing-1">Mã khuyến mãi</h6>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0">
                            <FaTag className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Nhập mã giảm giá"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            disabled={isValidDiscount || processing}
                            className="border-start-0"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleApply();
                                }
                            }}
                        />
                        <Button
                            style={isValidDiscount ? { background: '#2DC275', borderColor: '#2DC275', color: 'white' } : {}}
                            variant={isValidDiscount ? "success" : "outline-primary"}
                            onClick={handleApply}
                            disabled={processing || !couponCode || isValidDiscount || applying}
                        >
                            {applying ? <LoadingOutlined spin /> : (isValidDiscount ? "Đã dùng" : "Áp dụng")}
                        </Button>
                    </InputGroup>
                    {discountMsg && (
                        <div className={`mt-2 small fw-bold ${isValidDiscount ? 'text-success' : 'text-danger'}`}>
                            {isValidDiscount ? <FaTag className="me-1" /> : null}
                            {discountMsg}
                        </div>
                    )}
                    </div>
                )}
                
                {/* Show discount info in readonly mode */}
                {readonly && discountAmount > 0 && (
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center text-success">
                            <span className="small fw-bold"><FaTag className="me-1" />Mã giảm giá đã áp dụng:</span>
                            <span className="fw-bold">-{formatCurrency(discountAmount)}</span>
                        </div>
                    </div>
                )}

                {/* VietQR Display - Show QR code above total calculation */}
                {/* Show QR only if payment method is VIETQR and qrData exists */}
                {readonly && qrData && paymentMethod === 'VIETQR' && paymentStatus !== 'SUCCESS' && (
                    <div
                        className="mb-4 text-center"
                        id="vietqr-display"
                        style={{ scrollMarginTop: '130px' }}
                    >
                        <p className="small fw-bold text-muted mb-2" style={{ letterSpacing: '0.5px' }}>
                            Quét mã QR để thanh toán
                        </p>
                        <div style={{
                            display: 'inline-block',
                            padding: '20px',
                            backgroundColor: '#ffffff',
                            border: '2px solid #E0E0E0',
                            borderRadius: '12px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            overflow: 'visible'
                        }}>
                            {qrData.vietqr_image_url ? (
                                <img
                                    src={getImageUrl(qrData.vietqr_image_url)}
                                    alt="VietQR Code"
                                    style={{
                                        width: '220px',
                                        height: '220px',
                                        objectFit: 'contain',
                                        display: 'block',
                                        maxWidth: '100%'
                                    }}
                                />
                            ) : (
                                <QRCodeSVG
                                    value={qrData.qr_content || 'Mock QR Code'}
                                    size={220}
                                    level="H"
                                    includeMargin={true}
                                    bgColor="#FFFFFF"
                                    fgColor="#000000"
                                />
                            )}
                        </div>
                    </div>
                )}
                
                {/* Payment Success Message */}
                {readonly && qrData && paymentMethod === 'VIETQR' && paymentStatus === 'SUCCESS' && (
                    <div className="mb-4 text-center p-3 bg-success bg-opacity-10 rounded-4 border border-success">
                        <p className="text-success mb-0 fw-bold" style={{ fontSize: '14px' }}>
                            ✓ Thanh toán thành công! Đang chuyển hướng...
                        </p>
                    </div>
                )}

                </div>

                <div className="mt-auto flex-shrink-0">
                <div className="bg-light p-3 rounded-4 mb-4 mt-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-muted small">Tạm tính:</span>
                        <span className="fw-bold text-muted">{formatCurrency(subTotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                        <div className="d-flex justify-content-between align-items-center mb-1 text-success">
                            <span className="small fw-bold"><FaTag className="me-1" />Giảm giá:</span>
                            <span className="fw-bold">-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                        <h5 className="mb-0 fw-bold">Tổng thanh toán</h5>
                        <h4 className="mb-0 fw-bold" style={{ color: '#2DC275' }}>{formatCurrency(finalTotal)}</h4>
                    </div>
                </div>

                {!readonly && (
                    <>
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-100 py-3 rounded-4 shadow-sm fw-bold border-0 transition-all text-white"
                            type="submit"
                            disabled={processing || getTotalTickets() === 0}
                            style={{ background: '#2DC275', color: '#ffffff' }}
                        >
                            {processing ? (
                                <><LoadingOutlined spin className="me-2" /> Đang xử lý...</>
                            ) : (
                                <>Thanh toán ngay</>
                            )}
                        </Button>

                        <div className="text-center mt-3">
                            <p className="text-muted" style={{ fontSize: '11px' }}>
                                Bằng việc nhấn nút, bạn đồng ý với các Điều khoản & Chính sách của chúng tôi.
                            </p>
                        </div>
                    </>
                )}
                </div>
            </Card.Body>
            <style>{`
                .order-summary-sidebar h6,
                .order-summary-sidebar span,
                .order-summary-sidebar p,
                .order-summary-sidebar h5,
                .order-summary-sidebar h4,
                .order-summary-sidebar .form-control,
                .order-summary-sidebar input {
                    color: rgb(42, 45, 52) !important;
                }
                .order-summary-sidebar .form-control::placeholder {
                    color: #6c757d !important;
                    opacity: 0.7;
                }
                .order-summary-sidebar .text-muted {
                    color: #6c757d !important;
                }
                .order-summary-sidebar .text-success {
                    color: #2DC275 !important;
                }
                .order-summary-sidebar .btn-primary,
                .order-summary-sidebar .btn-primary * {
                    color: #ffffff !important;
                }
                .order-summary-sidebar .form-control:focus {
                    box-shadow: 0 0 0 0.1rem rgba(45, 194, 117, 0.25) !important;
                    border-color: #2DC275 !important;
                }
            `}</style>
        </Card>
    );
};

export default OrderSummary;
