import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Spinner, Alert, ListGroup, Badge, Form } from 'react-bootstrap';
import { FaChair, FaArrowLeft, FaCheckCircle, FaTrash, FaCogs, FaSave, FaTh } from 'react-icons/fa';
import { api } from '../../services/api';
import SeatMap from '../../components/event/SeatMap';

// Memoized Seat Component for better performance
const TemplateSeat = React.memo(({ t, isSelected, occupiedBy, activeTicketTypeId, onMouseDown, onMouseEnter }) => {
    const isOtherType = occupiedBy && occupiedBy.ticket_type_id !== activeTicketTypeId;

    return (
        <div
            className={`template-seat transition-all d-flex align-items-center justify-content-center rounded-1 cursor-pointer
                ${isSelected ? 'bg-primary text-white scale-11 shadow-lg' :
                    isOtherType ? 'bg-danger text-white opacity-50 cursor-not-allowed' :
                        'bg-light text-dark hover-primary shadow-sm'}`}
            style={{ width: '32px', height: '32px', fontSize: '10px', fontWeight: 'bold' }}
            onMouseDown={(e) => onMouseDown(e, t)}
            onMouseEnter={() => onMouseEnter(t)}
            title={`Hàng ${t.row_name} - Ghế ${t.seat_number} ${isOtherType ? '(Đã gán hạng vé khác)' : ''}`}
        >
            {t.seat_number}
        </div>
    );
});

const ManageSeats = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [activeTicketType, setActiveTicketType] = useState(null);
    const [initializing, setInitializing] = useState(false);

    // Global event state
    const [allOccupiedSeats, setAllOccupiedSeats] = useState([]); // List of {row_name, seat_number, ticket_type_id}
    const [hasSeats, setHasSeats] = useState(false);

    // Template selection state
    const [selectedTemplateSeats, setSelectedTemplateSeats] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState(null); // 'select' or 'deselect'

    // Grid initialization form
    const [initData, setInitData] = useState({
        rows: 5,
        seats_per_row: 10
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [eventRes, typesRes, occupiedRes] = await Promise.all([
                api.getEvent(eventId),
                api.getTicketTypes(eventId),
                api.getAllEventSeats(eventId)
            ]);

            if (eventRes.success) setEvent(eventRes.data);
            if (typesRes.success) {
                setTicketTypes(typesRes.data);
                if (typesRes.data.length > 0) setActiveTicketType(typesRes.data[0]);
            }
            if (occupiedRes.success) setAllOccupiedSeats(occupiedRes.data);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải thông tin cấu hình ghế');
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchData();

        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, [fetchData]);

    // Update selection when active ticket type or occupied seats change
    useEffect(() => {
        if (activeTicketType && allOccupiedSeats.length > 0) {
            const currentTypeSeats = allOccupiedSeats.filter(s => s.ticket_type_id === activeTicketType.ticket_type_id);
            setSelectedTemplateSeats(currentTypeSeats.map(s => ({
                row_name: s.row_name,
                seat_number: s.seat_number,
                x_pos: s.x_pos,
                y_pos: s.y_pos
            })));
            setHasSeats(currentTypeSeats.length > 0);
        } else {
            setSelectedTemplateSeats([]);
            setHasSeats(false);
        }
    }, [activeTicketType, allOccupiedSeats]);

    const toggleTemplateSeat = useCallback((templateItem, forceMode = null) => {
        const isOccupiedByOther = allOccupiedSeats.some(s =>
            s.row_name === templateItem.row_name &&
            s.seat_number === templateItem.seat_number &&
            s.ticket_type_id !== activeTicketType?.ticket_type_id
        );

        if (isOccupiedByOther) return;

        setSelectedTemplateSeats(prev => {
            const isSelected = prev.some(s =>
                s.row_name === templateItem.row_name &&
                s.seat_number === templateItem.seat_number
            );

            const mode = forceMode || (isSelected ? 'deselect' : 'select');

            if (mode === 'deselect' && isSelected) {
                return prev.filter(s => !(s.row_name === templateItem.row_name && s.seat_number === templateItem.seat_number));
            } else if (mode === 'select' && !isSelected) {
                return [...prev, templateItem];
            }
            return prev;
        });

        const isCurrentlySelected = selectedTemplateSeats.some(s =>
            s.row_name === templateItem.row_name &&
            s.seat_number === templateItem.seat_number
        );
        return forceMode || (isCurrentlySelected ? 'deselect' : 'select');
    }, [allOccupiedSeats, activeTicketType, selectedTemplateSeats]);

    const handleSeatMouseDown = useCallback((e, templateItem) => {
        e.preventDefault();
        const isSelected = selectedTemplateSeats.some(s =>
            s.row_name === templateItem.row_name &&
            s.seat_number === templateItem.seat_number
        );
        const mode = isSelected ? 'deselect' : 'select';
        toggleTemplateSeat(templateItem, mode);
        setDragMode(mode);
        setIsDragging(true);
    }, [toggleTemplateSeat, selectedTemplateSeats]);

    const handleSeatMouseEnter = useCallback((templateItem) => {
        if (isDragging && dragMode) {
            toggleTemplateSeat(templateItem, dragMode);
        }
    }, [isDragging, dragMode, toggleTemplateSeat]);

    const handleInitializeSeats = async () => {
        if (!activeTicketType) return;
        try {
            setInitializing(true);
            const res = await api.initializeSeats({
                ticket_type_id: activeTicketType.ticket_type_id,
                rows: initData.rows,
                seats_per_row: initData.seats_per_row
            });
            if (res.success) {
                await fetchData();
                alert("Đã khởi tạo sơ đồ ghế mặc định thành công!");
            }
        } finally {
            setInitializing(false);
        }
    };

    const handleSaveTemplateAssignment = async () => {
        if (!activeTicketType) return;
        try {
            setInitializing(true);
            const res = await api.assignSeatsFromTemplate({
                ticket_type_id: activeTicketType.ticket_type_id,
                seats: selectedTemplateSeats
            });
            if (res.success) {
                await fetchData();
                alert("Lưu sơ đồ ghế thành công!");
            }
        } finally {
            setInitializing(false);
        }
    };

    const venueTemplate = useMemo(() => event?.venue?.seat_map_template, [event]);

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

            <Row className="g-4">
                <Col lg={3}>
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
                                    <p className="mb-3 text-muted">Hệ thống phát hiện sơ đồ mẫu của <strong>{event?.venue?.venue_name}</strong>.</p>
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
                                <div className="template-picker-view bg-dark p-5 text-center" style={{ minHeight: '500px' }}>
                                    <div className="stage-label mb-5 py-2 px-5 bg-secondary bg-opacity-25 rounded-pill d-inline-block border border-secondary text-white fw-bold small letter-spacing-2">
                                        SÂN KHẤU / STAGE
                                    </div>

                                    <div className="seats-container d-flex flex-wrap justify-content-center gap-2 mx-auto" style={{ maxWidth: '800px' }}>
                                        {venueTemplate.map((t, idx) => {
                                            const isSelected = selectedTemplateSeats.some(s => s.row_name === t.row_name && s.seat_number === t.seat_number);
                                            const occupiedBy = allOccupiedSeats.find(s => s.row_name === t.row_name && s.seat_number === t.seat_number);

                                            return (
                                                <TemplateSeat
                                                    key={`${t.row_name}-${t.seat_number}`}
                                                    t={t}
                                                    isSelected={isSelected}
                                                    occupiedBy={occupiedBy}
                                                    activeTicketTypeId={activeTicketType?.ticket_type_id}
                                                    onMouseDown={handleSeatMouseDown}
                                                    onMouseEnter={handleSeatMouseEnter}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className="d-flex justify-content-center gap-4 mt-5 pt-3 border-top border-secondary border-opacity-25 text-white small">
                                        <div className="d-flex align-items-center"><span className="bg-light d-inline-block rounded-1 me-2" style={{ width: '12px', height: '12px' }}></span> Trống</div>
                                        <div className="d-flex align-items-center"><span className="bg-primary d-inline-block rounded-1 me-2" style={{ width: '12px', height: '12px' }}></span> Hạng này</div>
                                        <div className="d-flex align-items-center"><span className="bg-danger d-inline-block rounded-1 me-2" style={{ width: '12px', height: '12px' }}></span> Hạng khác</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4">
                                    {!hasSeats && !initializing ? (
                                        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                            <FaTh size={48} className="text-muted opacity-50 mb-3" />
                                            <h4>Tạo sơ đồ nhanh</h4>
                                            <div className="d-flex justify-content-center gap-3 mt-4 mx-auto" style={{ maxWidth: '400px' }}>
                                                <Form.Control type="number" placeholder="Hàng" value={initData.rows || ''} onChange={e => setInitData({ ...initData, rows: e.target.value === '' ? '' : parseInt(e.target.value) })} />
                                                <Form.Control type="number" placeholder="Ghế/Hàng" value={initData.seats_per_row || ''} onChange={e => setInitData({ ...initData, seats_per_row: e.target.value === '' ? '' : parseInt(e.target.value) })} />
                                            </div>
                                            <Button variant="primary" className="mt-4 px-5 fw-bold" onClick={handleInitializeSeats}>Khởi Tạo Sơ Đồ</Button>
                                        </div>
                                    ) : (
                                        <SeatMap key={activeTicketType?.ticket_type_id} ticketType={activeTicketType} onSeatsLoaded={setHasSeats} onSelectionChange={() => { }} />
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
