import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Alert, Container } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaChair, FaInfoCircle } from 'react-icons/fa';

// Components
import SeatMap from '../../components/event/SeatMap';
import TicketTypeSidebar from '../../components/Organizer/TicketTypeSidebar';
import SeatMapTemplateView from '../../components/Organizer/SeatMapTemplateView';
import SeatGridInitializer from '../../components/Organizer/SeatGridInitializer';

// Hooks
import { useManageSeats } from '../../hooks/useManageSeats';

import '../../components/Organizer/OrganizerDashboard.css';

/**
 * ManageSeats page component refactored for professional dark theme.
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
        <div className="text-center py-5 min-vh-100 d-flex flex-column align-items-center justify-content-center">
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Đang tải cấu hình sơ đồ ghế...</p>
        </div>
    );

    return (
        <div className="animate-fade-in pb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                    <Button
                        variant="link"
                        className="text-muted p-0 me-3 hover-text-white"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-white fw-bold mb-0">Thiết Lập Sơ Đồ Ghế</h2>
                        <p className="text-muted mb-0">
                            {event?.event_name} <span className="mx-2 opacity-25">|</span> {event?.venue?.venue_name}
                        </p>
                    </div>
                </div>

                {venueTemplate && (
                    <Button
                        className="organizer-btn-primary px-4 shadow-sm"
                        onClick={handleSaveTemplateAssignment}
                        disabled={initializing}
                    >
                        <FaSave className="me-2" /> LƯU CẤU HÌNH GHẾ
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger" className="border-0 rounded-4 shadow-sm mb-4">{error}</Alert>}

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
                    <Card className="content-card">
                        <Card.Header className="content-card-header d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0 fw-bold text-white">
                                    Ghế {activeTicketType?.type_name}
                                </h5>
                                <div className="text-muted small mt-1 d-flex align-items-center">
                                    <FaChair className="me-1 opacity-50" />
                                    {selectedTemplateSeats.length} ghế đã chọn / {activeTicketType?.quantity} tổng số vé
                                </div>
                            </div>

                            {!venueTemplate && (
                                <div className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2">
                                    <FaInfoCircle className="me-2" /> Chế độ lưới tự do
                                </div>
                            )}
                        </Card.Header>

                        <Card.Body className="p-0 position-relative" style={{ minHeight: '600px' }}>
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
                                <div className="p-5 text-center">
                                    {!hasSeats && !initializing ? (
                                        <div className="max-w-500 mx-auto">
                                            <SeatGridInitializer
                                                initData={initData}
                                                setInitData={setInitData}
                                                handleInitializeSeats={handleInitializeSeats}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-dark rounded-4 p-4">
                                            <SeatMap
                                                key={activeTicketType?.ticket_type_id}
                                                ticketType={activeTicketType}
                                                onSeatsLoaded={setHasSeats}
                                                onSelectionChange={() => { }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {initializing && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-black bg-opacity-50 rounded-4" style={{ zIndex: 100, backdropFilter: 'blur(4px)' }}>
                                    <Spinner animation="grow" variant="success" />
                                    <p className="mt-3 fw-bold text-white">Đang thực hiện gán ghế...</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    <div className="mt-4 p-4 bg-info bg-opacity-5 rounded-4 border border-info border-opacity-10 d-flex align-items-start">
                        <FaInfoCircle className="text-info mt-1 me-3 fs-5" />
                        <div>
                            <h6 className="text-white fw-bold mb-1">Ghi chú từ hệ thống</h6>
                            <p className="text-muted small mb-0">
                                Sơ đồ ghế được hiển thị dựa trên thiết kế của quản trị viên (Admin) cho khu vực <strong>{event?.venue?.venue_name}</strong>.
                                Bạn chỉ cần chọn/hủy tập hợp ghế tương ứng với từng hạng vé để khách hàng có thể chọn chỗ khi mua vé.
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ManageSeats;
