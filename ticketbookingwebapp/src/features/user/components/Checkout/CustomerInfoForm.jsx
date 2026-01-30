import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

/**
 * Component form thông tin khách hàng
 */
const CustomerInfoForm = ({ customerInfo, setCustomerInfo }) => {
    return (
        <Card className="mb-4 border-0 shadow-sm rounded-4">
            <Card.Header className="py-3 border-bottom" style={{ backgroundColor: 'rgb(45, 194, 117)' }}>
                <h5 className="mb-0 fw-bold" style={{ color: '#ffffff' }}>Thông Tin Liên Hệ</h5>
            </Card.Header>
            <Card.Body className="p-4" style={{ backgroundColor: 'rgba(18, 18, 18, 0.55)' }}>
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
                        border-color: rgba(45, 194, 117, 0.55) !important;
                        background-color: rgba(45, 194, 117, 0.10);
                    }
                    .border-success:focus {
                        border-color: rgba(45, 194, 117, 0.7) !important;
                        box-shadow: 0 0 0 3px rgba(45, 194, 117, 0.20);
                    }
                    /* Card header - white text on green background */
                    .card .card-header h5,
                    .card .card-header label {
                        color: #ffffff !important;
                    }
                    /* Card body - white text on dark surface */
                    .card .card-body .form-control,
                    .card .card-body .form-control:focus,
                    .card .card-body input,
                    .card .card-body input:focus {
                        color: rgba(255, 255, 255, 0.92) !important;
                        background-color: rgba(0, 0, 0, 0.18);
                        border-color: rgba(255, 255, 255, 0.14);
                        border-radius: 14px;
                    }
                    .card .card-body .form-label,
                    .card .card-body label {
                        color: rgba(255, 255, 255, 0.96) !important;
                        font-weight: 700;
                    }
                    .card .card-body .form-control::placeholder {
                        color: rgba(255, 255, 255, 0.55) !important;
                        opacity: 1;
                    }
                    .card .card-body .form-control:focus {
                        border-color: rgba(45, 194, 117, 0.7) !important;
                        box-shadow: 0 0 0 3px rgba(45, 194, 117, 0.20) !important;
                        outline: none !important;
                    }
                    .card .card-body .text-danger {
                        color: #ff6b6b !important;
                    }
                    .card .card-body .text-primary {
                        color: #2dc275 !important;
                    }
                    .card .card-body .text-info {
                        color: #60a5fa !important;
                    }
                    .card .card-body .text-warning {
                        color: #fbbf24 !important;
                    }
                `}</style>
            </Card.Body>
        </Card>
    );
};

export default CustomerInfoForm;
