import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { FaChair, FaCogs } from 'react-icons/fa';

const TicketTypeSidebar = ({
    ticketTypes,
    activeTicketType,
    setActiveTicketType,
    allOccupiedSeats,
    venueTemplate,
    venueName
}) => {
    return (
        <>
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <Card.Header className="bg-gradient-primary text-white py-3 border-0">
                    <h6 className="mb-0 fw-bold text-uppercase small letter-spacing-1">Hạng vé đang chọn</h6>
                </Card.Header>
                <ListGroup variant="flush">
                    {ticketTypes.map(tt => {
                        const isActive = activeTicketType?.ticket_type_id === tt.ticket_type_id;
                        const assignedCount = allOccupiedSeats.filter(s => s.ticket_type_id === tt.ticket_type_id).length;

                        return (
                            <ListGroup.Item
                                key={tt.ticket_type_id}
                                action
                                active={isActive}
                                onClick={() => setActiveTicketType(tt)}
                                className={`py-3 border-0 transition-all ${isActive ? 'bg-primary-light text-primary font-weight-bold' : ''}`}
                            >
                                <div className="d-flex justify-content-between align-items-baseline">
                                    <div>
                                        <div className="fw-bold text-dark">{tt.type_name}</div>
                                        <div className="small text-muted">
                                            Đã gán: <span className="fw-bold text-primary">{assignedCount}</span>/{tt.quantity}
                                        </div>
                                    </div>
                                    <FaChair className={isActive ? 'text-primary' : 'text-muted'} />
                                </div>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </Card>

            <Card className="border-0 shadow-sm rounded-4 border-start border-primary border-4">
                <Card.Body className="small py-4">
                    <h6 className="fw-bold mb-3"><FaCogs className="me-2 text-primary" /> Hướng dẫn gán ghế</h6>
                    {venueTemplate ? (
                        <>
                            <p className="mb-3 text-muted">Hệ thống phát hiện sơ đồ mẫu của <strong>{venueName}</strong>.</p>
                            <ul className="ps-3 mb-0 text-muted">
                                <li className="mb-2">Click và rê chuột để chọn nhiều ghế nhanh.</li>
                                <li className="mb-2"><span className="text-primary fw-bold">Xanh</span>: Ghế hạng này.</li>
                                <li className="mb-2"><span className="text-danger fw-bold">Đỏ</span>: Ghế hạng khác.</li>
                                <li>Nhấn <strong>"Lưu Sơ Đồ"</strong> để hoàn tất.</li>
                            </ul>
                        </>
                    ) : (
                        <p className="text-muted">Nhập kích thước lưới để tạo sơ đồ tự động cho hạng vé này.</p>
                    )}
                </Card.Body>
            </Card>
        </>
    );
};

export default TicketTypeSidebar;
