import React from 'react';
import { Card } from 'react-bootstrap';
import { FaCreditCard } from 'react-icons/fa';

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
                    <div className="bg-primary p-3 rounded-circle me-3 shadow-sm">
                        <FaCreditCard className="text-white fs-4" />
                    </div>
                    <div>
                        <strong className="d-block fs-5 text-primary">Thanh toán online qua VNPay</strong>
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
