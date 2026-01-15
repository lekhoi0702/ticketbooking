import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';
import { FaTicketAlt, FaChair } from 'react-icons/fa';
import { formatCurrency } from '../../../utils/eventUtils';

/**
 * Component hiển thị danh sách vé đã chọn
 */
const SelectedTicketsReview = ({
    ticketTypes,
    selectedTickets,
    selectedSeats,
    hasSeatMap,
    onGoBack
}) => {
    const selectedTypes = ticketTypes.filter(tt => selectedTickets[tt.ticket_type_id] > 0);

    if (selectedTypes.length === 0) {
        return null;
    }

    return (
        <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold">
                    <FaTicketAlt className="me-2 text-primary" />
                    Vé Đã Chọn
                </h5>
            </Card.Header>
            <Card.Body className="p-0">
                <ListGroup variant="flush">
                    {selectedTypes.map(tt => (
                        <ListGroup.Item key={tt.ticket_type_id} className="p-4 border-bottom-0">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 className="fw-bold mb-1">{tt.type_name}</h6>
                                    <div className="text-muted small">
                                        Số lượng: {selectedTickets[tt.ticket_type_id]}
                                    </div>
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold text-primary">
                                        {formatCurrency(tt.price * selectedTickets[tt.ticket_type_id])}
                                    </div>
                                    <div className="text-muted small">
                                        {formatCurrency(tt.price)} / vé
                                    </div>
                                </div>
                            </div>
                            {hasSeatMap[tt.ticket_type_id] && selectedSeats[tt.ticket_type_id] && (
                                <div className="mt-3 bg-light p-3 rounded-3">
                                    <div className="small fw-bold text-muted mb-2 text-uppercase">
                                        Vị trí ghế
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedSeats[tt.ticket_type_id].map(seat => (
                                            <div
                                                key={seat.seat_id}
                                                className="bg-white border px-3 py-1 rounded-pill small fw-bold"
                                            >
                                                <FaChair className="me-1 text-success small" />
                                                {seat.seat_label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                <div className="p-4 bg-light border-top text-center">
                    <Button
                        variant="link"
                        onClick={onGoBack}
                        className="text-decoration-none text-muted small p-0"
                    >
                        Thay đổi lựa chọn vé hoặc chỗ ngồi? Quay lại
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default SelectedTicketsReview;
