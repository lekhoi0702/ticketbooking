import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Spinner, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

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
            // Get VNPay response parameters
            const responseCode = searchParams.get('vnp_ResponseCode');
            const txnRef = searchParams.get('vnp_TxnRef'); // This is our payment_code
            const transactionNo = searchParams.get('vnp_TransactionNo');
            const amount = searchParams.get('vnp_Amount');

            // Check if payment was successful
            if (responseCode === '00') {
                setSuccess(true);
                setMessage('Thanh toán thành công!');

                // The backend webhook should have already updated the payment status
                // We just need to get the order code to redirect

                // Wait a bit for backend to process
                setTimeout(() => {
                    // Redirect to order success page
                    // We need to get order code from payment code
                    // For now, we'll redirect to a generic success page
                    navigate(`/payment-success?payment_code=${txnRef}`);
                }, 2000);
            } else {
                setSuccess(false);
                setMessage(getErrorMessage(responseCode));

                setTimeout(() => {
                    navigate('/');
                }, 5000);
            }
        } catch (err) {
            console.error('Error processing payment result:', err);
            setSuccess(false);
            setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán');
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
                            <>
                                <Spinner animation="border" variant="primary" size="lg" />
                                <h4 className="mt-4 mb-3">Đang xử lý kết quả thanh toán...</h4>
                                <p className="text-muted">Vui lòng đợi trong giây lát</p>
                            </>
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
