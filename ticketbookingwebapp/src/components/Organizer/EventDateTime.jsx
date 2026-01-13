import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';

const EventDateTime = ({ formData, handleInputChange }) => {
    return (
        <>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Thời Gian Bắt Đầu <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="start_datetime"
                            value={formData.start_datetime}
                            onChange={handleInputChange}
                            className="py-2"
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Thời Gian Kết Thúc <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="end_datetime"
                            value={formData.end_datetime}
                            onChange={handleInputChange}
                            className="py-2"
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Bắt Đầu Bán Vé</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="sale_start_datetime"
                            value={formData.sale_start_datetime}
                            onChange={handleInputChange}
                            className="py-2"
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Kết Thúc Bán Vé</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="sale_end_datetime"
                            value={formData.sale_end_datetime}
                            onChange={handleInputChange}
                            className="py-2"
                        />
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
};

export default EventDateTime;
