import React from 'react';
import { Card } from 'react-bootstrap';
import { UPLOADS_BASE_URL } from '@shared/constants';

/**
 * Component hiển thị phương thức thanh toán duy nhất (Online)
 */
const PaymentMethodSelector = () => {
    return (
        <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-white py-3 border-bottom-0">
                <h5 className="mb-0 fw-bold">Hình Thức Thanh Toán</h5>
            </Card.Header>
            <Card.Body className="p-4 pt-0">
                <div className="p-3 border rounded-4 bg-primary bg-opacity-10 border-primary border-opacity-25 d-flex align-items-center">
                    <div className="bg-white p-2 rounded-3 me-3 shadow-sm" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={`${UPLOADS_BASE_URL}/logo/vnpay-logo-inkythuatso-01.jpg`}
                            alt="VNPay"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                    <div>
                        <strong className="d-block fs-5 text-primary">Thanh toán online qua VNPAY</strong>
                        <small className="text-muted">Hỗ trợ ATM, Thẻ quốc tế Visa/MasterCard, QR Code</small>
                    </div>
                </div>
                {/* <div className="mt-3 x-small text-muted p-2">
                    <i className="bi bi-info-circle me-1"></i>
                    Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao dịch an toàn.
                </div> */}
            </Card.Body>
        </Card>
    );
};

export default PaymentMethodSelector;
