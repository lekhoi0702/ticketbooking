import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

/**
 * Component form thông tin khách hàng
 */
const CustomerInfoForm = ({ customerInfo, setCustomerInfo }) => {
    return (
        <Card className="mb-4 border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">Thông Tin Liên Hệ</h5>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    <Col md={12} className="mb-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold d-flex align-items-center gap-2">
                                <FaUser className="text-primary" />
                                Họ và Tên <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"

                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                required
                                className={`py-2 px-3 ${customerInfo.name ? 'border-success' : ''}`}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold d-flex align-items-center gap-2">
                                <FaEnvelope className="text-info" />
                                Email <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"

                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                required
                                className={`py-2 px-3 ${customerInfo.email ? 'border-success' : ''}`}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold d-flex align-items-center gap-2">
                                <FaPhone className="text-warning" />
                                Số Điện Thoại <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="tel"

                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                required
                                className={`py-2 px-3 ${customerInfo.phone ? 'border-success' : ''}`}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <style>{`
                    .border-success {
                        border-color: #28a745 !important;
                        background-color: rgba(40, 167, 69, 0.05);
                    }
                    .border-success:focus {
                        border-color: #28a745 !important;
                        box-shadow: 0 0 0 0.1rem rgba(40, 167, 69, 0.25);
                    }
                    /* Fix white text on white background */
                    .card .form-control,
                    .card .form-control:focus,
                    .card input,
                    .card input:focus {
                        color: rgb(42, 45, 52) !important;
                    }
                    .card .form-label,
                    .card label,
                    .card h5 {
                        color: rgb(42, 45, 52) !important;
                    }
                    .card .form-control::placeholder {
                        color: #6c757d !important;
                        opacity: 0.7;
                    }
                    /* Reduce default Bootstrap focus shadow */
                    .card .form-control:focus {
                        box-shadow: 0 0 0 0.1rem rgba(13, 110, 253, 0.25) !important;
                    }
                `}</style>
            </Card.Body>
        </Card>
    );
};

export default CustomerInfoForm;
