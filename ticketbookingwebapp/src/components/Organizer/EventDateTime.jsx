import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const EventDateTime = ({ formData, handleInputChange }) => {
    return (
        <div className="animate-fade-in mt-4">
            <h6 className="text-white fw-bold mb-4 opacity-75">Thời gian thực hiện sự kiện</h6>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label className="organizer-form-label">Ngày & Giờ Bắt Đầu <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="start_datetime"
                            value={formData.start_datetime}
                            onChange={handleInputChange}
                            className="organizer-form-control py-2"
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label className="organizer-form-label">Ngày & Giờ Kết Thúc <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="end_datetime"
                            value={formData.end_datetime}
                            onChange={handleInputChange}
                            className="organizer-form-control py-2"
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <h6 className="text-white fw-bold mb-4 mt-2 opacity-75">Thời gian mở bán gói vé</h6>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label className="organizer-form-label">Ngày Mở Bán</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="sale_start_datetime"
                            value={formData.sale_start_datetime}
                            onChange={handleInputChange}
                            className="organizer-form-control py-2"
                        />
                        <Form.Text className="text-muted small">Mặc định là thời điểm đăng sự kiện</Form.Text>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label className="organizer-form-label">Ngày Kết Thúc Bán</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            name="sale_end_datetime"
                            value={formData.sale_end_datetime}
                            onChange={handleInputChange}
                            className="organizer-form-control py-2"
                        />
                        <Form.Text className="text-muted small">Mặc định là thời điểm kết thúc sự kiện</Form.Text>
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default EventDateTime;
