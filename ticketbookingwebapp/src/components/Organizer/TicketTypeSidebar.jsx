import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { FaChair, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

/**
 * Professional TicketTypeSidebar for Organizer
 */
const TicketTypeSidebar = ({
    ticketTypes,
    activeTicketType,
    setActiveTicketType,
    allOccupiedSeats,
    venueTemplate,
    venueName
}) => {
    return (
        <div className="animate-fade-in">
            <Card className="content-card mb-4 overflow-hidden border-0">
                <Card.Header className="content-card-header bg-dark bg-opacity-25">
                    <h6 className="mb-0 fw-bold text-uppercase small text-muted letter-spacing-1">Hạng vé sự kiện</h6>
                </Card.Header>
                <ListGroup variant="flush" className="bg-transparent">
                    {ticketTypes.map(tt => {
                        const isActive = activeTicketType?.ticket_type_id === tt.ticket_type_id;
                        const assignedCount = allOccupiedSeats.filter(s => s.ticket_type_id === tt.ticket_type_id).length;
                        const isFull = assignedCount >= tt.quantity;

                        return (
                            <ListGroup.Item
                                key={tt.ticket_type_id}
                                action
                                onClick={() => setActiveTicketType(tt)}
                                className={`py-4 px-4 border-0 transition-all bg-transparent ${isActive ? 'bg-success bg-opacity-10 border-start border-success border-4' : 'text-muted'}`}
                                style={{ borderLeftWidth: isActive ? '4px' : '0', borderLeftStyle: 'solid', transition: 'all 0.3s' }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="flex-grow-1">
                                        <div className={`fw-bold mb-1 ${isActive ? 'text-white' : 'text-secondary'}`}>
                                            {tt.type_name}
                                        </div>
                                        <div className="d-flex align-items-center small">
                                            <span className={`fw-bold ${assignedCount > 0 ? 'text-success' : 'text-muted'}`}>
                                                {assignedCount}
                                            </span>
                                            <span className="mx-1 text-muted">/</span>
                                            <span className="text-muted">{tt.quantity} ghế</span>
                                            {isFull && <FaCheckCircle className="ms-2 text-success" title="Đã gán đủ ghế" />}
                                        </div>
                                    </div>
                                    <div className={`stat-icon-wrapper rounded-circle ${isActive ? 'bg-success bg-opacity-20 text-success' : 'bg-secondary bg-opacity-10 text-muted'}`} style={{ width: '32px', height: '32px' }}>
                                        <FaChair size={14} />
                                    </div>
                                </div>
                                {isActive && (
                                    <div className="mt-2">
                                        <div className="progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                            <div
                                                className="progress-bar bg-success"
                                                role="progressbar"
                                                style={{ width: `${Math.min(100, (assignedCount / tt.quantity) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </Card>

            <Card className="content-card bg-info bg-opacity-5 border-0 rounded-4">
                <Card.Body className="p-4">
                    <h6 className="text-white fw-bold mb-3 d-flex align-items-center">
                        <FaInfoCircle className="me-2 text-info" /> Hướng dẫn
                    </h6>
                    {venueTemplate ? (
                        <>
                            <p className="text-muted small mb-3">Sơ đồ được nạp từ thiết kế của <strong>{venueName}</strong>.</p>
                            <ul className="text-muted small ps-3 mb-0" style={{ lineHeight: '1.6' }}>
                                <li className="mb-2">Click và <strong>Rê chuột</strong> để gán/hủy gán nhiều ghế cùng lúc.</li>
                                <li className="mb-2"><span className="text-success fw-bold">Xanh</span>: Đang gán cho hạng này.</li>
                                <li className="mb-2"><span className="text-danger fw-bold">Đỏ</span>: Đã gán cho hạng vé khác.</li>
                                {activeTicketType && (
                                    <li>Hãy chọn đúng <strong>{activeTicketType.quantity}</strong> ghế cho <strong>{activeTicketType.type_name}</strong>.</li>
                                )}
                            </ul>
                        </>
                    ) : (
                        <p className="text-muted small mb-0">Thiết lập lưới ghế bằng cách nhập số hàng và số ghế mỗi hàng.</p>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default TicketTypeSidebar;
