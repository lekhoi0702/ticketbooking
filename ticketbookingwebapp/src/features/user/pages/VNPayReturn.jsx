import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Alert } from 'react-bootstrap';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const VNPayReturn = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        processPaymentResult();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const processPaymentResult = async () => {
        try {
            const responseCode = searchParams.get('vnp_ResponseCode');

            const verifyResponse = await fetch(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/payments/vnpay/return?${searchParams.toString()}`
            );
            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success && verifyData?.data?.order_code) {
                // Keep VNPay return page as a verification step only,
                // then route to the unified success UI.
                navigate(`/order-success/${verifyData.data.order_code}`, { replace: true });
                return;
            }

            setErrorMessage(verifyData.message || getErrorMessage(responseCode));
            setTimeout(() => navigate('/', { replace: true }), 5000);
        } catch (err) {
            console.error('Error processing VNPay result:', err);
            setErrorMessage('Co loi xay ra khi xu ly ket qua thanh toan');
            setTimeout(() => navigate('/', { replace: true }), 5000);
        } finally {
            setProcessing(false);
        }
    };

    const getErrorMessage = (code) => {
        const errorMessages = {
            '07': 'Giao dich bi nghi ngo gian lan',
            '09': 'The/Tai khoan chua dang ky InternetBanking',
            '10': 'Xac thuc thong tin the/tai khoan khong dung qua 3 lan',
            '11': 'Da het han cho thanh toan',
            '12': 'The/Tai khoan bi khoa',
            '13': 'Mat khau xac thuc giao dich khong dung',
            '24': 'Giao dich bi huy',
            '51': 'Tai khoan khong du so du',
            '65': 'Tai khoan da vuot qua han muc giao dich trong ngay',
            '75': 'Ngan hang thanh toan dang bao tri',
            '79': 'Giao dich vuot qua so lan nhap sai mat khau',
            '99': 'Loi khong xac dinh'
        };
        return errorMessages[code] || 'Thanh toan khong thanh cong';
    };

    if (processing) {
        return <LoadingSpinner fullScreen tip="Dang xac thuc ket qua thanh toan..." />;
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Card className="border-0 shadow-sm text-center" style={{ maxWidth: '520px', width: '100%' }}>
                    <Card.Body className="py-5 px-4">
                        <h3 className="mb-3 text-danger fw-bold">Thanh toan that bai</h3>
                        <p className="mb-3">{errorMessage}</p>
                        <Alert variant="warning" className="mb-0">
                            Ban se duoc chuyen ve trang chu sau 5 giay...
                        </Alert>
                    </Card.Body>
                </Card>
            </div>
        </Container>
    );
};

export default VNPayReturn;
