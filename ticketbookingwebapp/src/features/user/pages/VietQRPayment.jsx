import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { paymentApi } from '@services/api/payment';
import { formatCurrency } from '@shared/utils/eventUtils';
import { QRCodeSVG } from 'qrcode.react';

const VietQRPayment = () => {
    const { paymentCode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [qrData, setQrData] = useState(location.state?.qrData || null);
    const [checking, setChecking] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('PENDING');
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    const intervalRef = useRef(null);
    const checkIntervalRef = useRef(null);

    useEffect(() => {
        // If no qrData in state, fetch it
        if (!qrData && paymentCode) {
            // In real implementation, you might want to fetch QR data
            // For now, we'll use mock data
            setError('Vui lòng quay lại trang thanh toán');
        }

        // Start countdown timer
        if (qrData?.expires_in) {
            setTimeLeft(qrData.expires_in);
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        // Auto-check payment status every 5 seconds
        if (paymentCode && paymentStatus === 'PENDING') {
            checkIntervalRef.current = setInterval(() => {
                checkPaymentStatus();
            }, 5000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentCode, qrData]);

    const checkPaymentStatus = useCallback(async () => {
        if (!paymentCode || checking) return;

        try {
            setChecking(true);
            const response = await paymentApi.checkVietQRStatus(paymentCode);
            
            if (response.success) {
                const status = response.data.payment_status;
                setPaymentStatus(status);
                
                if (status === 'SUCCESS') {
                    // Verify payment
                    await verifyPayment();
                }
            }
        } catch (err) {
            console.error('Error checking payment status:', err);
        } finally {
            setChecking(false);
        }
    }, [paymentCode, checking]);

    const verifyPayment = async () => {
        try {
            const response = await paymentApi.verifyVietQRPayment(paymentCode);
            
            if (response.success) {
                // Redirect to success page
                setTimeout(() => {
                    navigate(`/order-success/${response.data.order_code}`);
                }, 2000);
            }
        } catch (err) {
            console.error('Error verifying payment:', err);
            setError('Có lỗi xảy ra khi xác thực thanh toán');
        }
    };

    const handleManualCheck = () => {
        checkPaymentStatus();
    };

    const handleCancel = () => {
        navigate('/');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!qrData) {
        return (
            <Container className="py-5">
                <Card className="text-center">
                    <Card.Body className="py-5">
                        <FaTimesCircle className="text-danger" size={60} />
                        <h4 className="mt-3">Không tìm thấy thông tin thanh toán</h4>
                        <Button variant="primary" onClick={() => navigate('/')} className="mt-3">
                            Về trang chủ
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-5 payment-return-page" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div className="d-flex justify-content-center">
                <Card className="border-0 shadow-lg" style={{ maxWidth: '480px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px' }}>
                    <Card.Body className="p-0" style={{ backgroundColor: '#ffffff' }}>
                        {paymentStatus === 'SUCCESS' ? (
                            <div className="text-center p-5">
                                <FaCheckCircle className="text-success" size={80} />
                                <h3 className="mt-4 mb-3 text-success fw-bold" style={{ color: '#28a745' }}>
                                    Thanh Toán Thành Công!
                                </h3>
                                <p style={{ color: '#6c757d' }}>Đang chuyển hướng...</p>
                            </div>
                        ) : (
                            <>
                                {/* VietQR Header */}
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)',
                                    padding: '24px',
                                    borderRadius: '16px 16px 0 0',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ 
                                        display: 'inline-block',
                                        backgroundColor: '#ffffff',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        <svg width="120" height="32" viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <text x="10" y="22" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#1A73E8">VietQR</text>
                                        </svg>
                                    </div>
                                    <h4 className="text-white fw-bold mb-2" style={{ fontSize: '20px', marginTop: '8px' }}>
                                        Thanh toán bằng QR Code
                                    </h4>
                                    <p className="text-white mb-0" style={{ fontSize: '14px', opacity: 0.9 }}>
                                        Quét mã QR bằng ứng dụng ngân hàng
                                    </p>
                                </div>

                                <div className="p-4">
                                    {/* QR Code Section */}
                                    <div className="text-center mb-4">
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '20px',
                                            backgroundColor: '#ffffff',
                                            border: '2px solid #E0E0E0',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}>
                                            {qrData.vietqr_image_url ? (
                                                <img
                                                    src={qrData.vietqr_image_url.startsWith('http') 
                                                        ? qrData.vietqr_image_url 
                                                        : `http://127.0.0.1:5000${qrData.vietqr_image_url}`}
                                                    alt="VietQR Code"
                                                    style={{
                                                        width: '220px',
                                                        height: '220px',
                                                        objectFit: 'contain'
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

                                    {/* Account Info - Only show if using generated QR code */}
                                    {!qrData.vietqr_image_url && (
                                        <div style={{
                                            backgroundColor: '#F8F9FA',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            marginBottom: '20px',
                                            border: '1px solid #E0E0E0'
                                        }}>
                                            <div className="mb-3">
                                                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                                                    Số tài khoản
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1A73E8', fontFamily: 'monospace' }}>
                                                    {qrData.qr_data?.accountNo || '970422'}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                                                    Tên chủ tài khoản
                                                </div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#212529' }}>
                                                    {qrData.qr_data?.accountName || 'TICKET BOOKING'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                                                    Nội dung chuyển khoản
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#212529', wordBreak: 'break-word' }}>
                                                    {qrData.qr_data?.addInfo || `Thanh toan don hang ${qrData.order_code}`}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Amount Display */}
                                    <div className="text-center mb-4" style={{
                                        padding: '24px',
                                        backgroundColor: '#F0F7FF',
                                        borderRadius: '12px',
                                        border: '2px solid #1A73E8'
                                    }}>
                                        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>
                                            Số tiền cần thanh toán
                                        </div>
                                        <div style={{ 
                                            fontSize: '32px', 
                                            fontWeight: 'bold', 
                                            color: '#1A73E8',
                                            fontFamily: 'Arial, sans-serif'
                                        }}>
                                            {formatCurrency(qrData.amount)}
                                        </div>
                                    </div>

                                    {/* Timer */}
                                    <div className="d-flex justify-content-between align-items-center mb-4" style={{
                                        padding: '12px 16px',
                                        backgroundColor: '#FFF3CD',
                                        borderRadius: '8px',
                                        border: '1px solid #FFC107'
                                    }}>
                                        <div style={{ fontSize: '14px', color: '#856404' }}>
                                            <FaClock className="me-2" />
                                            Thời gian còn lại
                                        </div>
                                        <div style={{ 
                                            fontSize: '18px', 
                                            fontWeight: 'bold', 
                                            color: timeLeft < 60 ? '#dc3545' : '#856404',
                                            fontFamily: 'monospace'
                                        }}>
                                            {formatTime(timeLeft)}
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div style={{
                                        backgroundColor: '#E3F2FD',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        marginBottom: '20px',
                                        border: '1px solid #90CAF9'
                                    }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1565C0', marginBottom: '12px' }}>
                                            📱 Hướng dẫn thanh toán
                                        </div>
                                        <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1565C0', lineHeight: '1.8' }}>
                                            <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                                            <li>Chọn tính năng <strong>"Quét QR"</strong> hoặc <strong>"Thanh toán QR"</strong></li>
                                            <li>Quét mã QR ở trên</li>
                                            <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                                        </ol>
                                    </div>

                                    {/* Status Check */}
                                    {checking && (
                                        <div className="text-center mb-3" style={{ padding: '12px', backgroundColor: '#F8F9FA', borderRadius: '8px' }}>
                                            <Spinner animation="border" size="sm" className="me-2" style={{ color: '#1A73E8' }} />
                                            <span style={{ color: '#6c757d', fontSize: '14px' }}>Đang kiểm tra thanh toán...</span>
                                        </div>
                                    )}

                                    {error && (
                                        <Alert variant="danger" className="mb-3" style={{ borderRadius: '8px' }}>
                                            {error}
                                        </Alert>
                                    )}

                                    {/* Actions */}
                                    <div className="d-grid gap-2">
                                        <Button
                                            style={{
                                                backgroundColor: '#1A73E8',
                                                borderColor: '#1A73E8',
                                                borderRadius: '12px',
                                                padding: '14px',
                                                fontSize: '16px',
                                                fontWeight: '600'
                                            }}
                                            size="lg"
                                            onClick={handleManualCheck}
                                            disabled={checking}
                                        >
                                            {checking ? (
                                                <>
                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                    Đang kiểm tra...
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle className="me-2" />
                                                    Tôi đã thanh toán
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={handleCancel}
                                            style={{ borderRadius: '12px', padding: '12px' }}
                                        >
                                            Hủy thanh toán
                                        </Button>
                                    </div>

                                    {timeLeft === 0 && (
                                        <Alert variant="warning" className="mt-3" style={{ borderRadius: '8px' }}>
                                            ⚠️ Mã QR đã hết hạn. Vui lòng tạo đơn hàng mới.
                                        </Alert>
                                    )}

                                    {/* Footer Note */}
                                    <div className="text-center mt-4" style={{ fontSize: '12px', color: '#6c757d' }}>
                                        <div style={{ marginBottom: '4px' }}>
                                            💡 <strong>Lưu ý:</strong> Giữ nguyên nội dung chuyển khoản để hệ thống xác nhận đúng
                                        </div>
                                        <div>
                                            Mã đơn hàng: <strong style={{ color: '#1A73E8' }}>{qrData.order_code}</strong>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </div>
            <style>{`
                .payment-return-page {
                    background-color: #f5f5f5 !important;
                }
                .payment-return-page .card,
                .payment-return-page .card-body {
                    background-color: #ffffff !important;
                }
                .payment-return-page .card h3,
                .payment-return-page .card h4,
                .payment-return-page .card p,
                .payment-return-page .card span,
                .payment-return-page .card strong,
                .payment-return-page .card div {
                    color: inherit !important;
                }
                .payment-return-page .text-success {
                    color: #28a745 !important;
                }
                .payment-return-page .text-danger {
                    color: #dc3545 !important;
                }
                .payment-return-page .text-muted {
                    color: #6c757d !important;
                }
            `}</style>
        </Container>
    );
};

export default VietQRPayment;
