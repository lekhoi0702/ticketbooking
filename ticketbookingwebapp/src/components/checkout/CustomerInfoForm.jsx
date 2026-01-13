import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';

/**
 * Component form thông tin khách hàng
 */
const CustomerInfoForm = ({ customerInfo, setCustomerInfo }) => {
    return (
        <Card className="mb-4 border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold">Thông Tin Liên Hệ</h5>
            </Card.Header>
            <Card.Body className="p-4">
                <Row>
                    <Col md={12} className="mb-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold">
                                Họ và Tên <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập họ và tên"
                                value={customerInfo.name}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                required
                                className="py-2 px-3"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold">
                                Email <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="example@email.com"
                                value={customerInfo.email}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                required
                                className="py-2 px-3"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Form.Group>
                            <Form.Label className="small fw-bold">
                                Số Điện Thoại <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                placeholder="0123456789"
                                value={customerInfo.phone}
                                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                required
                                className="py-2 px-3"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default CustomerInfoForm;
