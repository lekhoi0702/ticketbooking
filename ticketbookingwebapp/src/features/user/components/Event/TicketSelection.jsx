import React from 'react';
import { Card, Tabs, Tab, Badge } from 'react-bootstrap';
import SeatMap from './SeatMap';

const TicketSelection = ({
    event,
    activeTicketType,
    setActiveTicketType,
    selectedTickets,
    handleTicketQuantityChange,
    handleSeatSelection,
    hasSeatMap,
    setHasSeatMap
}) => {
    return (
        <section id="ticket-selection" className="detail-section">
            <h3 className="section-title">Chọn vé & Chỗ ngồi</h3>
            <Card className="mb-4 border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Tabs
                        activeKey={activeTicketType?.ticket_type_id}
                        onSelect={(k) => setActiveTicketType(event.ticket_types.find(t => t.ticket_type_id === parseInt(k)))}
                        className="custom-tabs px-3 pt-3"
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
                                <div className="p-4">
                                    <div className="mb-4">
                                        <h5 className="fw-bold">{tt.type_name}</h5>
                                        <p className="text-muted small">{tt.description || 'Loại vé tiêu chuẩn cho sự kiện'}</p>
                                        <div className="h4 text-primary fw-bold">
                                            {tt.price > 0 ? `${tt.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                                        </div>
                                    </div>

                                    <SeatMap
                                        ticketType={tt}
                                        onSelectionChange={(seats) => handleSeatSelection(tt.ticket_type_id, seats)}
                                        maxSelection={tt.max_per_order}
                                        onSeatsLoaded={(exists) => {
                                            setHasSeatMap(prev => ({ ...prev, [tt.ticket_type_id]: exists }));
                                        }}
                                    />

                                    {!hasSeatMap[tt.ticket_type_id] && (
                                        <div className="mt-4 border-top pt-4">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div>
                                                    <h6 className="mb-0 fw-bold text-dark">Số lượng vé</h6>
                                                    <small className="text-muted">Tối đa {tt.max_per_order} vé mỗi đơn hàng</small>
                                                </div>
                                                <div className="quantity-selector border rounded-pill p-1 d-flex align-items-center bg-light">
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleTicketQuantityChange(tt.ticket_type_id, (selectedTickets[tt.ticket_type_id] || 0) - 1)}
                                                        disabled={!(selectedTickets[tt.ticket_type_id] > 0)}
                                                    >-</button>
                                                    <span className="qty-val px-3 fw-bold">{selectedTickets[tt.ticket_type_id] || 0}</span>
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleTicketQuantityChange(tt.ticket_type_id, (selectedTickets[tt.ticket_type_id] || 0) + 1)}
                                                        disabled={(selectedTickets[tt.ticket_type_id] || 0) >= tt.max_per_order}
                                                    >+</button>
                                                </div>
                                            </div>
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
