import React from 'react';
import TemplateSeat from './TemplateSeat';

/**
 * Premium SeatMapTemplateView for selecting seats from venue template.
 */
const SeatMapTemplateView = ({
    venueTemplate,
    selectedTemplateSeats,
    allOccupiedSeats,
    activeTicketType,
    handleSeatMouseDown,
    handleSeatMouseEnter
}) => {
    return (
        <div className="template-picker-view p-5 text-center bg-black bg-opacity-25" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="mb-5 d-flex flex-column align-items-center">
                <div className="stage-element mb-3 py-3 px-5 bg-secondary bg-opacity-10 rounded-bottom d-inline-block border-bottom border-start border-end border-secondary border-opacity-25 text-muted fw-bold small letter-spacing-2" style={{ width: '300px' }}>
                    SÂN KHẤU / STAGE
                </div>
                <div className="text-muted small opacity-50 fst-italic">Cáp nhìn từ phía sân khấu</div>
            </div>

            <div
                className="seats-map-interaction-area d-flex flex-wrap justify-content-center gap-2 mx-auto"
                style={{
                    maxWidth: '900px',
                    padding: '40px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
                }}
            >
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

            <div className="legend-area d-flex justify-content-center gap-5 mt-5 pt-4 border-top border-white border-opacity-5 w-100">
                <div className="d-flex align-items-center">
                    <span className="legend-dot me-2" style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}></span>
                    <span className="text-muted small">Ghế trống</span>
                </div>
                <div className="d-flex align-items-center">
                    <span className="legend-dot me-2 shadow-success" style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#2dc275', boxShadow: '0 0 10px rgba(45,194,117,0.4)' }}></span>
                    <span className="text-white fw-bold small">Đang chọn cho hạng này</span>
                </div>
                <div className="d-flex align-items-center">
                    <span className="legend-dot me-2 shadow-danger" style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.4)' }}></span>
                    <span className="text-muted small">Đã gán hạng vé khác</span>
                </div>
            </div>

            <style>{`
                .stage-element {
                    border-top: none;
                }
                .seats-map-interaction-area {
                    user-select: none;
                }
                .shadow-success {
                    box-shadow: 0 0 10px rgba(45,194,117,0.4);
                }
                .shadow-danger {
                    box-shadow: 0 0 10px rgba(239,68,68,0.4);
                }
                .letter-spacing-2 {
                    letter-spacing: 2px;
                }
            `}</style>
        </div>
    );
};

export default SeatMapTemplateView;
