import React from 'react';
import { Typography } from '@mui/material';
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
                className="seats-map-interaction-area d-flex flex-column align-items-center gap-5 mx-auto w-100"
                style={{
                    maxWidth: '1000px',
                    padding: '40px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
                }}
            >
                {/* Case 1: Standard Flat Array */}
                {Array.isArray(venueTemplate) && (
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                        {venueTemplate.map((t, idx) => {
                            const isSelected = selectedTemplateSeats.some(s =>
                                String(s.row_name) === String(t.row_name) &&
                                String(s.seat_number) === String(t.seat_number)
                            );
                            const occupiedBy = allOccupiedSeats.find(s =>
                                String(s.row_name) === String(t.row_name) &&
                                String(s.seat_number) === String(t.seat_number)
                            );

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
                )}

                {/* Case 2: Grouped by areas (Admin Venue Designer Structure) */}
                {venueTemplate && venueTemplate.areas && Array.isArray(venueTemplate.areas) && (
                    venueTemplate.areas.map((area, areaIdx) => (
                        <div key={areaIdx} className="venue-area-block w-100">
                            <div className="area-header mb-3 pb-2 border-bottom border-white border-opacity-10 text-start">
                                <span className="badge bg-primary px-3 py-2 rounded-pill shadow-sm" style={{ background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)' }}>
                                    KHU VỰC: {area.name}
                                </span>
                                <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary', opacity: 0.7 }}>
                                    {area.rows} hàng x {area.cols} ghế
                                </Typography>
                            </div>
                            <div className="d-flex flex-column align-items-center gap-2 p-4 bg-black bg-opacity-10 rounded-4 overflow-auto">
                                {[...Array(area.rows)].map((_, rIdx) => {
                                    const rowName = String.fromCharCode(65 + rIdx);
                                    return (
                                        <div key={rowName} className="d-flex gap-2">
                                            {[...Array(area.cols)].map((_, cIdx) => {
                                                const seatNumber = String(cIdx + 1);
                                                const seatId = `${rIdx + 1}-${cIdx + 1}`;
                                                const isLocked = area.locked_seats?.includes(seatId);

                                                const t = {
                                                    row_name: rowName,
                                                    seat_number: seatNumber,
                                                    area: area.name,
                                                    x_pos: (cIdx + 1) * 40,
                                                    y_pos: (rIdx + 1) * 40
                                                };

                                                const isSelected = selectedTemplateSeats.some(s =>
                                                    String(s.row_name) === String(t.row_name) &&
                                                    String(s.seat_number) === String(t.seat_number) &&
                                                    (!s.area || s.area === t.area)
                                                );
                                                const occupiedBy = allOccupiedSeats.find(s =>
                                                    String(s.row_name) === String(t.row_name) &&
                                                    String(s.seat_number) === String(t.seat_number) &&
                                                    (!s.area || s.area === t.area)
                                                );

                                                return (
                                                    <TemplateSeat
                                                        key={`${area.name}-${rowName}-${seatNumber}`}
                                                        t={t}
                                                        isSelected={isSelected}
                                                        occupiedBy={occupiedBy}
                                                        isLocked={isLocked}
                                                        activeTicketTypeId={activeTicketType?.ticket_type_id}
                                                        onMouseDown={handleSeatMouseDown}
                                                        onMouseEnter={handleSeatMouseEnter}
                                                    />
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}

                {/* Case 3: No Template Data */}
                {(!venueTemplate || (!Array.isArray(venueTemplate) && !venueTemplate.areas)) && (
                    <div className="text-white opacity-50 py-5">
                        Không có dữ liệu sơ đồ mẫu cho địa điểm này.
                    </div>
                )}
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
