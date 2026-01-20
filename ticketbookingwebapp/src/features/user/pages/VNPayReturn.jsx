import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const VNPayReturn = () => {
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
            // Get all VNPay response parameters
            const vnpParams = {};
            for (const [key, value] of searchParams.entries()) {
                vnpParams[key] = value;
            }

            const responseCode = searchParams.get('vnp_ResponseCode');

            // Call backend to verify and update payment/order status
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payments/vnpay/return?${searchParams.toString()}`);
            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
                setSuccess(true);
                setMessage('Thanh toán thành công!');
                setOrderCode(verifyData.data.order_code);

                // Redirect to order success page
                setTimeout(() => {
                    navigate(`/order-success/${verifyData.data.order_code}`);
                }, 2000);
            } else {
                setSuccess(false);
                setMessage(verifyData.message || getErrorMessage(responseCode));

                setTimeout(() => {
                    navigate('/');
                }, 5000);
            }
        } catch (err) {
            console.error('Error processing payment result:', err);
            setSuccess(false);
            setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán');

            setTimeout(() => {
                navigate('/');
            }, 5000);
        } finally {
            setProcessing(false);
        }
    };

    const getErrorMessage = (code) => {
        const errorMessages = {
            '07': 'Giao dịch bị nghi ngờ gian lận',
            '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
            '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Đã hết hạn chờ thanh toán',
            '12': 'Thẻ/Tài khoản bị khóa',
            '13': 'Mật khẩu xác thực giao dịch không đúng',
            '24': 'Giao dịch bị hủy',
            '51': 'Tài khoản không đủ số dư',
            '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
            '75': 'Ngân hàng thanh toán đang bảo trì',
            '79': 'Giao dịch vượt quá số lần nhập sai mật khẩu',
            '99': 'Lỗi không xác định'
        };
        return errorMessages[code] || 'Thanh toán không thành công';
    };

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Card className="border-0 shadow-sm text-center" style={{ maxWidth: '500px', width: '100%' }}>
                    <Card.Body className="py-5 px-4">
                        {processing ? (
                            <LoadingSpinner fullScreen tip="Đang xử lý kết quả thanh toán..." />
                        ) : (
                            <>
                                {success ? (
                                    <>
                                        <FaCheckCircle className="text-success" size={80} />
                                        <h3 className="mt-4 mb-3 text-success fw-bold">{message}</h3>
                                        <p className="text-muted">Đang chuyển hướng đến trang xác nhận...</p>
                                    </>
                                ) : (
                                    <>
                                        <FaTimesCircle className="text-danger" size={80} />
                                        <h3 className="mt-4 mb-3 text-danger fw-bold">Thanh Toán Thất Bại</h3>
                                        <p className="text-muted mb-4">{message}</p>
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
        </Container>
    );
};

export default VNPayReturn;
