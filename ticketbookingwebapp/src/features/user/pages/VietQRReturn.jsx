import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { paymentApi } from '@services/api/payment';

const VietQRReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [orderCode, setOrderCode] = useState('');

    useEffect(() => {
        processPaymentResult();
    }, []);

    const processPaymentResult = async () => {
        try {
            // Get payment code from URL
            const paymentCode = searchParams.get('payment_code');

            if (!paymentCode) {
                setSuccess(false);
                setMessage('Thiếu thông tin thanh toán');
                setProcessing(false);
                setTimeout(() => {
                    navigate('/');
                }, 5000);
                return;
            }

            // Verify payment
            const verifyResponse = await paymentApi.verifyVietQRPayment(paymentCode);

            if (verifyResponse.success) {
                setSuccess(true);
                setMessage('Thanh toán thành công!');
                setOrderCode(verifyResponse.data.order_code);

                // Redirect to order success page
                setTimeout(() => {
                    navigate(`/order-success/${verifyResponse.data.order_code}`);
                }, 2000);
            } else {
                setSuccess(false);
                setMessage(verifyResponse.message || 'Thanh toán không thành công');

                setTimeout(() => {
                    navigate('/');
                }, 5000);
            }
        } catch (err) {
            console.error('Error processing VietQR payment result:', err);
            setSuccess(false);
            setMessage(err.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán');

            setTimeout(() => {
                navigate('/');
            }, 5000);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Container className="py-5 payment-return-page">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Card className="border-0 shadow-sm text-center" style={{ maxWidth: '500px', width: '100%', backgroundColor: '#ffffff' }}>
                    <Card.Body className="py-5 px-4" style={{ backgroundColor: '#ffffff' }}>
                        {processing ? (
                            <LoadingSpinner fullScreen tip="Đang xử lý kết quả thanh toán..." />
                        ) : (
                            <>
                                {success ? (
                                    <>
                                        <FaCheckCircle className="text-success" size={80} />
                                        <h3 className="mt-4 mb-3 text-success fw-bold" style={{ color: '#28a745' }}>{message}</h3>
                                        {orderCode && (
                                            <p className="mb-2" style={{ color: '#6c757d' }}>
                                                Mã đơn hàng: <strong style={{ color: '#212529' }}>{orderCode}</strong>
                                            </p>
                                        )}
                                        <p style={{ color: '#6c757d' }}>Đang chuyển hướng đến trang xác nhận...</p>
                                    </>
                                ) : (
                                    <>
                                        <FaTimesCircle className="text-danger" size={80} />
                                        <h3 className="mt-4 mb-3 text-danger fw-bold" style={{ color: '#dc3545' }}>Thanh Toán Thất Bại</h3>
                                        <p className="mb-4" style={{ color: '#6c757d' }}>{message}</p>
                                        <Alert variant="warning">
                                            Bạn sẽ được chuyển về trang chủ sau 5 giây...
                                        </Alert>
                                    </>
                                )}
                            </>
                        )}
                    </Card.Body>
                </Card>
            </div>
            <style>{`
                .payment-return-page .card,
                .payment-return-page .card-body {
                    background-color: #ffffff !important;
                }
                .payment-return-page .card h3,
                .payment-return-page .card p,
                .payment-return-page .card span,
                .payment-return-page .card strong {
                    color: #212529 !important;
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

export default VietQRReturn;
