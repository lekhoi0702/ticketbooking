import React from 'react';
import { Card } from 'react-bootstrap';
import { UPLOADS_BASE_URL } from '@shared/constants';

/**
 * Component hiển thị phương thức thanh toán (VNPay và PayPal)
 */
const PaymentMethodSelector = ({ paymentMethod, setPaymentMethod }) => {
    const handleMethodChange = (method) => {
        if (setPaymentMethod) {
            setPaymentMethod(method);
        }
    };

    return (
        <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-white py-3 border-bottom-0">
                <h5 className="mb-0 fw-bold">Hình Thức Thanh Toán</h5>
            </Card.Header>
            <Card.Body className="p-4 pt-0">
                {/* VNPay Option */}
                <div 
                    className={`p-3 border rounded-4 mb-3 d-flex align-items-center cursor-pointer ${paymentMethod === 'VNPAY' ? 'bg-primary bg-opacity-10 border-primary border-opacity-50' : 'bg-light border-secondary border-opacity-25'}`}
                    onClick={() => handleMethodChange('VNPAY')}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                >
                    <div className="bg-white p-2 rounded-3 me-3 shadow-sm" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={`${UPLOADS_BASE_URL}/logo/vnpay-logo-inkythuatso-01.jpg`}
                            alt="VNPay"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    <div className="flex-grow-1">
                        <strong className="d-block fs-5" style={{ color: paymentMethod === 'VNPAY' ? '#007bff' : 'inherit' }}>
                            Thanh toán online qua VNPAY
                        </strong>
                        <small className="text-muted">Hỗ trợ ATM, Thẻ quốc tế Visa/MasterCard, QR Code</small>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="vnpay"
                            checked={paymentMethod === 'VNPAY'}
                            onChange={() => handleMethodChange('VNPAY')}
                        />
                    </div>
                </div>

                {/* PayPal Option */}
                <div 
                    className={`p-3 border rounded-4 mb-3 d-flex align-items-center cursor-pointer ${paymentMethod === 'PAYPAL' ? 'bg-primary bg-opacity-10 border-primary border-opacity-50' : 'bg-light border-secondary border-opacity-25'}`}
                    onClick={() => handleMethodChange('PAYPAL')}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                >
                    <div className="bg-white p-2 rounded-3 me-3 shadow-sm" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="60" height="60" fill="#003087"/>
                            <path d="M22.5 18L17.5 42H12L15 18H22.5Z" fill="#009CDE"/>
                            <path d="M45 18C47.5 18 49 19 49.5 21C50 23 49.5 25 48 26C46.5 27 44.5 27.5 42.5 27.5C40.5 27.5 39 27 38 26C37 25 36.5 23.5 36.5 22C36.5 20.5 37 19 38.5 18H45ZM42 24C42.5 24 43 24 43.5 24C44 24 44.5 23.5 44.5 23C44.5 22.5 44 22 43.5 22C43 22 42.5 22 42 22C41.5 22 41 22.5 41 23C41 23.5 41.5 24 42 24Z" fill="#009CDE"/>
                            <path d="M30 18L25 42H20L23 18H30Z" fill="#009CDE"/>
                        </svg>
                    </div>
                    <div className="flex-grow-1">
                        <strong className="d-block fs-5" style={{ color: paymentMethod === 'PAYPAL' ? '#007bff' : 'inherit' }}>
                            Thanh toán qua PayPal
                        </strong>
                        <small className="text-muted">Thanh toán an toàn với PayPal (Visa, MasterCard, PayPal Balance)</small>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="paypal"
                            checked={paymentMethod === 'PAYPAL'}
                            onChange={() => handleMethodChange('PAYPAL')}
                        />
                    </div>
                </div>

                {/* VietQR Option */}
                <div 
                    className={`p-3 border rounded-4 d-flex align-items-center cursor-pointer ${paymentMethod === 'VIETQR' ? 'bg-primary bg-opacity-10 border-primary border-opacity-50' : 'bg-light border-secondary border-opacity-25'}`}
                    onClick={() => handleMethodChange('VIETQR')}
                    style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                >
                    <div className="bg-white p-2 rounded-3 me-3 shadow-sm" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="60" height="60" rx="8" fill="#1A73E8"/>
                            <path d="M15 20H45V40H15V20Z" fill="white"/>
                            <rect x="20" y="25" width="20" height="20" fill="#1A73E8"/>
                            <circle cx="30" cy="35" r="3" fill="white"/>
                            <circle cx="30" cy="35" r="1.5" fill="#1A73E8"/>
                        </svg>
                    </div>
                    <div className="flex-grow-1">
                        <strong className="d-block fs-5" style={{ color: paymentMethod === 'VIETQR' ? '#007bff' : 'inherit' }}>
                            Thanh toán qua VietQR
                        </strong>
                        <small className="text-muted">Quét mã QR để thanh toán nhanh chóng và tiện lợi</small>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="paymentMethod"
                            id="vietqr"
                            checked={paymentMethod === 'VIETQR'}
                            onChange={() => handleMethodChange('VIETQR')}
                        />
                    </div>
                </div>
            </Card.Body>
            <style>{`
                .card h5,
                .card strong,
                .card small {
                    color: rgb(42, 45, 52) !important;
                }
                .cursor-pointer:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
            `}</style>
        </Card>
    );
};

export default PaymentMethodSelector;
