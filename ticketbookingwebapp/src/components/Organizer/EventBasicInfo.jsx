import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const EventBasicInfo = ({ formData, handleInputChange, categories, venues }) => {
    return (
        <>
            <h5 className="mb-3 text-primary">Thông Tin Sự Kiện</h5>

            <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Tên Sự Kiện <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleInputChange}
                    placeholder="Nhập tên sự kiện"
                    className="py-2"
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Mô Tả</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về sự kiện..."
                    className="py-2"
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Danh Mục <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="py-2"
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Địa Điểm <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            name="venue_id"
                            value={formData.venue_id}
                            onChange={handleInputChange}
                            className="py-2"
                            required
                        >
                            <option value="">Chọn địa điểm</option>
                            {venues.map(venue => (
                                <option key={venue.venue_id} value={venue.venue_id}>
                                    {venue.venue_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Trạng Thái</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="py-2"
                        >
                            <option value="DRAFT">Nháp</option>
                            <option value="PUBLISHED">Đã Đăng</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleInputChange}
                            label="Sự kiện nổi bật"
                            className="mt-4"
                        />
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
};

export default EventBasicInfo;
