import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaTicketAlt, FaChair } from 'react-icons/fa';

/**
 * Component hiển thị review các vé đã chọn
 */
const SelectedTicketsReview = ({
    ticketTypes,
    selectedTickets,
    selectedSeats,
    hasSeatMap,
    onGoBack
}) => {
    // Filter only selected ticket types
    const selectedTicketTypes = ticketTypes.filter(
        tt => selectedTickets[tt.ticket_type_id] > 0
    );

    if (selectedTicketTypes.length === 0) {
        return null;
    }

    return (
        <Card className="mb-4 border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">
                    <FaTicketAlt className="me-2 text-primary" />
                    Vé Đã Chọn
                </h5>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={onGoBack}
                    className="d-flex align-items-center gap-2"
                >
                    <FaArrowLeft />
                    Quay lại
                </Button>
            </Card.Header>
            <Card.Body className="p-4">
                {selectedTicketTypes.map(ticketType => {
                    const quantity = selectedTickets[ticketType.ticket_type_id];
                    const seats = selectedSeats[ticketType.ticket_type_id] || [];
                    const hasSeats = hasSeatMap[ticketType.ticket_type_id];

                    return (
                        <div
                            key={ticketType.ticket_type_id}
                            className="mb-3 pb-3 border-bottom"
                        >
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 className="mb-1 fw-bold">{ticketType.type_name}</h6>
                                    <div className="text-muted small">
                                        {ticketType.price.toLocaleString('vi-VN')}đ × {quantity} vé
                                    </div>
                                </div>
                                <div className="text-end">
                                    <Badge bg="primary" className="px-3 py-2">
                                        {quantity} vé
                                    </Badge>
                                    <div className="fw-bold mt-1">
                                        {(ticketType.price * quantity).toLocaleString('vi-VN')}đ
                                    </div>
                                </div>
                            </div>

                            {/* Show selected seats if applicable */}
                            {hasSeats && seats.length > 0 && (
                                <div className="mt-2 p-2 bg-light rounded">
                                    <small className="text-muted d-flex align-items-center gap-1">
                                        <FaChair className="text-primary" />
                                        <strong>Ghế đã chọn:</strong>
                                    </small>
                                    <div className="mt-1">
                                        {seats.map((seat, idx) => (
                                            <Badge
                                                key={idx}
                                                bg="secondary"
                                                className="me-1 mb-1"
                                            >
                                                {seat.seat_label || `${seat.row_label}${seat.seat_number}`}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </Card.Body>
            <style>{`
                .card h5,
                .card h6,
                .card div,
                .card small,
                .card strong {
                    color: rgb(42, 45, 52) !important;
                }
                .card .text-muted {
                    color: #6c757d !important;
                }
            `}</style>
        </Card>
    );
};

export default SelectedTicketsReview;
