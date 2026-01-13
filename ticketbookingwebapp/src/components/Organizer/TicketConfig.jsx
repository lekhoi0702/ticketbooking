import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { FaPlus, FaTimes } from 'react-icons/fa';

const TicketConfig = ({ ticketTypes, handleTicketTypeChange, addTicketType, removeTicketType }) => {
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">Cấu Hình Vé</h5>
                <Button variant="outline-primary" size="sm" onClick={addTicketType}>
                    <FaPlus className="me-1" /> Thêm Loại Vé
                </Button>
            </div>

            {ticketTypes.map((ticket, index) => (
                <div key={index} className="bg-light p-3 rounded mb-3 border">
                    <Row className="g-2 align-items-end">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="small text-muted">Tên Loại Vé</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ví dụ: Vé VIP"
                                    value={ticket.type_name}
                                    onChange={(e) => handleTicketTypeChange(index, 'type_name', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="small text-muted">Giá Vé (VND)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="0"
                                    value={ticket.price}
                                    onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="small text-muted">Số Lượng</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="100"
                                    value={ticket.quantity}
                                    onChange={(e) => handleTicketTypeChange(index, 'quantity', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label className="small text-muted">Mô tả</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Mô tả ngắn"
                                    value={ticket.description}
                                    onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={1} className="text-end">
                            {ticketTypes.length > 1 && (
                                <Button
                                    variant="link"
                                    className="text-danger p-0 text-decoration-none"
                                    onClick={() => removeTicketType(index)}
                                >
                                    <FaTimes size={20} />
                                </Button>
                            )}
                        </Col>
                    </Row>
                </div>
            ))}
        </>
    );
};

export default TicketConfig;
