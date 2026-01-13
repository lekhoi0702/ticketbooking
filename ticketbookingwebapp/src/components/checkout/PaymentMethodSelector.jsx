import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';

/**
 * Component chọn phương thức thanh toán
 */
const PaymentMethodSelector = ({ paymentMethod, setPaymentMethod }) => {
    return (
        <Card className="mb-4 border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold">Hình Thức Thanh Toán</h5>
            </Card.Header>
            <Card.Body className="p-4">
                <Form.Check
                    type="radio"
                    id="payment-vnpay"
                    name="paymentMethod"
                    label={
                        <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                                <FaCreditCard className="text-primary fs-4" />
                            </div>
                            <div>
                                <strong className="d-block">Thanh toán online qua VNPay</strong>
                                <small className="text-muted">ATM, Visa, MasterCard, QR Code</small>
                            </div>
                        </div>
                    }
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mb-3 p-3 border rounded-3 payment-check-item"
                />
                <Form.Check
                    type="radio"
                    id="payment-cash"
                    name="paymentMethod"
                    label={
                        <div className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                                <FaMoneyBillWave className="text-success fs-4" />
                            </div>
                            <div>
                                <strong className="d-block">Thanh toán trực tiếp (Cash)</strong>
                                <small className="text-muted">Thanh toán bằng tiền mặt tại sự kiện</small>
                            </div>
                        </div>
                    }
                    value="CASH"
                    checked={paymentMethod === 'CASH'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="p-3 border rounded-3 payment-check-item"
                />
            </Card.Body>
        </Card>
    );
};

export default PaymentMethodSelector;
