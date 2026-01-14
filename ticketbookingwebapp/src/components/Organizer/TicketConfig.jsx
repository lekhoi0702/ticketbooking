import React from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { FaPlus, FaTrashAlt, FaTicketAlt } from 'react-icons/fa';

const TicketConfig = ({ ticketTypes, handleTicketTypeChange, addTicketType, removeTicketType }) => {
    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <FaTicketAlt className="text-success me-2" />
                    <h6 className="text-white fw-bold mb-0">Thiết lập các loại vé</h6>
                </div>
                <Button
                    variant="outline-success"
                    size="sm"
                    onClick={addTicketType}
                    className="fw-bold border-success border-opacity-25"
                >
                    <FaPlus className="me-2" /> Thêm loại vé mới
                </Button>
            </div>

            {ticketTypes.map((tt, index) => (
                <Card key={index} className="mb-4 border-0 shadow-sm" style={{ backgroundColor: '#18181b' }}>
                    <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <h6 className="text-success fw-bold"># Loại vé {index + 1}</h6>
                            {ticketTypes.length > 1 && (
                                <Button
                                    variant="link"
                                    className="text-danger p-0 text-decoration-none"
                                    onClick={() => removeTicketType(index)}
                                >
                                    <FaTrashAlt />
                                </Button>
                            )}
                        </div>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="organizer-form-label">Tên Loại Vé <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="VD: VIP, Standard, Early Bird..."
                                        value={tt.type_name}
                                        onChange={(e) => handleTicketTypeChange(index, 'type_name', e.target.value)}
                                        className="organizer-form-control py-2"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="organizer-form-label">Giá Vé (VND) <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        value={tt.price}
                                        onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                                        className="organizer-form-control py-2"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="organizer-form-label">Số Lượng Vé <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        value={tt.quantity}
                                        onChange={(e) => handleTicketTypeChange(index, 'quantity', e.target.value)}
                                        className="organizer-form-control py-2"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group>
                            <Form.Label className="organizer-form-label">Quyền Lợi Vé</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="VD: Tea-break, Tặng áo, Ngồi hàng đầu..."
                                value={tt.description}
                                onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                                className="organizer-form-control"
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
};

export default TicketConfig;
