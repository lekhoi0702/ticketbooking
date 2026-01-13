import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

// Components
import SeatMap from '../../components/event/SeatMap';
import TicketTypeSidebar from '../../components/organizer/TicketTypeSidebar';
import SeatMapTemplateView from '../../components/organizer/SeatMapTemplateView';
import SeatGridInitializer from '../../components/organizer/SeatGridInitializer';

// Hooks
import { useManageSeats } from '../../hooks/useManageSeats';

/**
 * ManageSeats page component refactored for better maintainability.
 */
const ManageSeats = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const {
        loading,
        error,
        event,
        ticketTypes,
        activeTicketType,
        initializing,
        allOccupiedSeats,
        hasSeats,
        selectedTemplateSeats,
        initData,
        venueTemplate,
        setActiveTicketType,
        setInitData,
        handleSeatMouseDown,
        handleSeatMouseEnter,
        handleInitializeSeats,
        handleSaveTemplateAssignment,
        setHasSeats
    } = useManageSeats(eventId);

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải cấu hình...</p>
        </div>
    );

    return (
        <div className="manage-seats-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
            <div className="d-flex align-items-center mb-4">
                <Button variant="white" onClick={() => navigate(-1)} className="shadow-sm rounded-circle me-3 border-0" style={{ width: '45px', height: '45px' }}>
                    <FaArrowLeft />
                </Button>
                <div>
                    <h2 className="fw-bold mb-0 text-dark">Thiết Lập Sơ Đồ Ghế</h2>
                    <p className="text-muted mb-0">{event?.event_name} <span className="mx-2">•</span> {event?.venue?.venue_name}</p>
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-4">
                <Col lg={3}>
                    <TicketTypeSidebar
                        ticketTypes={ticketTypes}
                        activeTicketType={activeTicketType}
                        setActiveTicketType={setActiveTicketType}
                        allOccupiedSeats={allOccupiedSeats}
                        venueTemplate={venueTemplate}
                        venueName={event?.venue?.venue_name}
                    />
                </Col>

                <Col lg={9}>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                        <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center px-4">
                            <div>
                                <h5 className="mb-0 fw-bold">Sơ đồ: {activeTicketType?.type_name}</h5>
                                <small className="text-muted">Vị trí: {event?.venue?.address}</small>
                            </div>
                            {venueTemplate && (
                                <Button variant="primary" className="rounded-pill px-4 fw-bold shadow-sm" onClick={handleSaveTemplateAssignment} disabled={initializing}>
                                    <FaSave className="me-2" /> Lưu Sơ Đồ
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body className="p-0 position-relative">
                            {venueTemplate ? (
                                <SeatMapTemplateView
                                    venueTemplate={venueTemplate}
                                    selectedTemplateSeats={selectedTemplateSeats}
                                    allOccupiedSeats={allOccupiedSeats}
                                    activeTicketType={activeTicketType}
                                    handleSeatMouseDown={handleSeatMouseDown}
                                    handleSeatMouseEnter={handleSeatMouseEnter}
                                />
                            ) : (
                                <div className="p-4">
                                    {!hasSeats && !initializing ? (
                                        <SeatGridInitializer
                                            initData={initData}
                                            setInitData={setInitData}
                                            handleInitializeSeats={handleInitializeSeats}
                                        />
                                    ) : (
                                        <SeatMap
                                            key={activeTicketType?.ticket_type_id}
                                            ticketType={activeTicketType}
                                            onSeatsLoaded={setHasSeats}
                                            onSelectionChange={() => { }}
                                        />
                                    )}
                                </div>
                            )}

                            {initializing && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75" style={{ zIndex: 100 }}>
                                    <Spinner animation="grow" variant="primary" />
                                    <p className="mt-2 fw-bold">Đang xử lý...</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .bg-gradient-primary { background: linear-gradient(135deg, #4e73df 0%, #224abe 100%); }
                .bg-primary-light { background-color: rgba(78, 115, 223, 0.08); }
                .letter-spacing-1 { letter-spacing: 1px; }
                .letter-spacing-2 { letter-spacing: 2px; }
                .transition-all { transition: all 0.1s ease; }
                .hover-primary:hover { background-color: #4e73df !important; color: white !important; transform: scale(1.1); }
                .scale-11 { transform: scale(1.1); z-index: 5; }
            `}</style>
        </div>
    );
};

export default ManageSeats;
