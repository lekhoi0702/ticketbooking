import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const EventBasicInfo = ({ formData, handleInputChange, categories, venues }) => {
    return (
        <div className="animate-fade-in">
            <Form.Group className="mb-4">
                <Form.Label className="organizer-form-label">Tên Sự Kiện <span className="text-danger">*</span></Form.Label>
                <Form.Control
                    type="text"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleInputChange}
                    placeholder="VD: Live Concert Rap Việt 2024"
                    className="organizer-form-control py-3"
                    required
                />
            </Form.Group>

            <Form.Group className="mb-4">
                <Form.Label className="organizer-form-label">Mô Tả Chi Tiết</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={6}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Giới thiệu về sự kiện, dàn nghệ sĩ, lịch trình..."
                    className="organizer-form-control"
                />
            </Form.Group>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label className="organizer-form-label">Danh Mục <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="organizer-form-control py-2"
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
                    <Form.Group className="mb-4">
                        <Form.Label className="organizer-form-label">Địa Điểm Tổ Chức <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            name="venue_id"
                            value={formData.venue_id}
                            onChange={handleInputChange}
                            className="organizer-form-control py-2"
                            required
                        >
                            <option value="">Chọn địa điểm</option>
                            {venues.map(venue => (
                                <option key={venue.venue_id} value={venue.venue_id}>
                                    {venue.venue_name} - {venue.city}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="align-items-center">
                <Col md={6}>
                    <Form.Group className="mb-4">
                        <Form.Label className="organizer-form-label">Trạng Thái Đăng</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="organizer-form-control py-2"
                        >
                            <option value="DRAFT">Lưu bản nháp</option>
                            <option value="PENDING_APPROVAL">Gửi yêu cầu phê duyệt</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Check
                        type="switch"
                        id="is-featured-switch"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        label="Đề xuất sự kiện nổi bật"
                        className="ms-2 mt-2 text-muted fw-bold"
                    />
                </Col>
            </Row>
        </div>
    );
};

export default EventBasicInfo;
