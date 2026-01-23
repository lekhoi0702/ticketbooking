import React, { useEffect } from 'react';
import { Card, Tabs, Tab, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaChair } from 'react-icons/fa';
import { seatApi } from '@services/api/seat';
import './TicketSelection.css';

// Component to check if seat map exists
const SeatMapChecker = ({ ticketType, eventId, onSeatsLoaded }) => {
    useEffect(() => {
        const checkSeatMap = async () => {
            if (!eventId || !ticketType) return;
            try {
                const response = await seatApi.getSeatsByTicketType(eventId, ticketType.ticket_type_id);
                const exists = response.success && response.data && response.data.length > 0;
                onSeatsLoaded(exists);
            } catch (error) {
                console.error('Error checking seat map:', error);
                onSeatsLoaded(false);
            }
        };
        checkSeatMap();
    }, [eventId, ticketType, onSeatsLoaded]);
    return null;
};

const TicketSelection = ({
    event,
    activeTicketType,
    setActiveTicketType,
    selectedTickets,
    handleTicketQuantityChange
}) => {
    const navigate = useNavigate();
    const [hasSeatMap, setHasSeatMap] = React.useState({});
    // Debug logging
    console.log('TicketSelection - event:', event);
    console.log('TicketSelection - ticket_types:', event?.ticket_types);

    // Check if ticket types exist
    if (!event || !event.ticket_types || event.ticket_types.length === 0) {
        return (
            <section id="ticket-selection" className="detail-section">
                <h3 className="section-title">Chọn vé & Chỗ ngồi</h3>
                <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Body className="p-4 text-center">
                        <p className="text-muted mb-0">Sự kiện này chưa có loại vé nào.</p>
                    </Card.Body>
                </Card>
            </section>
        );
    }

    return (
        <section id="ticket-selection" className="detail-section">
            <h3 className="section-title">Chọn vé & Chỗ ngồi</h3>
            <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Tabs
                        activeKey={activeTicketType?.ticket_type_id}
                        onSelect={(k) => setActiveTicketType(event.ticket_types.find(t => t.ticket_type_id === parseInt(k)))}
                        className="custom-tabs"
                    >
                        {event.ticket_types?.map(tt => (
                            <Tab
                                key={tt.ticket_type_id}
                                eventKey={tt.ticket_type_id}
                                title={
                                    <span>
                                        {tt.type_name}
                                        {selectedTickets[tt.ticket_type_id] > 0 &&
                                            <Badge bg="success" className="ms-2 pill">{selectedTickets[tt.ticket_type_id]}</Badge>
                                        }
                                    </span>
                                }
                            >
                                <div className="tab-pane">
                                    <div className="ticket-info-section">
                                        <h5 className="fw-bold">{tt.type_name}</h5>
                                        <p className="text-muted small">{tt.description || 'Loại vé tiêu chuẩn cho sự kiện'}</p>
                                        <div className="h4 text-primary fw-bold">
                                            {tt.price > 0 ? `${tt.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                                        </div>
                                    </div>

                                    {/* Check if seat map exists */}
                                    <SeatMapChecker
                                        ticketType={tt}
                                        eventId={event?.event_id}
                                        onSeatsLoaded={(exists) => {
                                            setHasSeatMap(prev => ({ ...prev, [tt.ticket_type_id]: exists }));
                                        }}
                                    />

                                    {/* Quantity Selector */}
                                    <div className="quantity-selector-wrapper">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="quantity-selector-label">
                                                <h6 className="mb-0 fw-bold">Số lượng vé</h6>
                                                <small className="text-muted">Tối đa {tt.max_per_order} vé mỗi đơn hàng</small>
                                            </div>
                                            <div className="quantity-selector">
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => handleTicketQuantityChange(tt.ticket_type_id, (selectedTickets[tt.ticket_type_id] || 0) - 1)}
                                                    disabled={!(selectedTickets[tt.ticket_type_id] > 0)}
                                                >-</button>
                                                <span className="qty-val">{selectedTickets[tt.ticket_type_id] || 0}</span>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => handleTicketQuantityChange(tt.ticket_type_id, (selectedTickets[tt.ticket_type_id] || 0) + 1)}
                                                    disabled={(selectedTickets[tt.ticket_type_id] || 0) >= tt.max_per_order}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Button to select seats if seat map exists */}
                                    {hasSeatMap[tt.ticket_type_id] && selectedTickets[tt.ticket_type_id] > 0 && (
                                        <div className="select-seats-button-wrapper">
                                            <Button
                                                variant="success"
                                                className="select-seats-button"
                                                onClick={() => {
                                                    navigate(`/event/${event.event_id}/seats`, {
                                                        state: {
                                                            ticketTypeId: tt.ticket_type_id,
                                                            quantity: selectedTickets[tt.ticket_type_id]
                                                        }
                                                    });
                                                }}
                                            >
                                                <FaChair /> Chọn ghế ({selectedTickets[tt.ticket_type_id]})
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Tab>
                        ))}
                    </Tabs>
                </Card.Body>
            </Card>
        </section>
    );
};

export default TicketSelection;
