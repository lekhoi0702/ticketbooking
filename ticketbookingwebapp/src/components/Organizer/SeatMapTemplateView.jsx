import React from 'react';
import { Typography, Button } from '@mui/material';
import { CheckBox as CheckBoxIcon, IndeterminateCheckBox as IndeterminateIcon } from '@mui/icons-material';
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
    handleSeatMouseEnter,
    toggleAreaSeats
}) => {
    return (
        <div className="template-picker-view p-3 p-md-4 text-center bg-black bg-opacity-25" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div className="mb-4 d-flex flex-column align-items-center">
                <div className="stage-element mb-2 py-2 px-5 bg-secondary bg-opacity-10 rounded-bottom d-inline-block border-bottom border-start border-end border-secondary border-opacity-25 text-muted fw-bold small letter-spacing-2" style={{ width: '250px' }}>
                    SÂN KHẤU / STAGE
                </div>
                <div className="text-muted extra-small opacity-50 fst-italic" style={{ fontSize: '0.7rem' }}>Cáp nhìn từ phía sân khấu</div>
            </div>

            <div
                className="seats-map-interaction-area d-flex flex-column align-items-center gap-4 mx-auto w-100"
                style={{
                    maxWidth: '100%',
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)',
                    overflowX: 'auto'
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
                    venueTemplate.areas.map((area, areaIdx) => {
                        // Pre-calculate all seats in this area for the toggle function
                        const seatsInArea = [];
                        for (let r = 0; r < area.rows; r++) {
                            const rowName = String.fromCharCode(65 + r);
                            for (let c = 0; c < area.cols; c++) {
                                seatsInArea.push({
                                    row_name: rowName,
                                    seat_number: String(c + 1),
                                    area: area.name
                                });
                            }
                        }

                        // Check if all available seats in this area are selected
                        const availableSeatsCount = seatsInArea.filter(t =>
                            !allOccupiedSeats.some(s =>
                                s.row_name === t.row_name &&
                                String(s.seat_number) === String(t.seat_number) &&
                                s.ticket_type_id !== activeTicketType?.ticket_type_id
                            )
                        ).length;

                        const selectedInAreaCount = selectedTemplateSeats.filter(s =>
                            s.area === area.name
                        ).length;

                        const isAllSelected = selectedInAreaCount >= availableSeatsCount && availableSeatsCount > 0;

                        return (
                            <div key={areaIdx} className="venue-area-block w-100" style={{ maxWidth: '800px', margin: '0 auto', alignSelf: 'center' }}>
                                <div className="area-header d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3 pb-2 border-bottom border-white border-opacity-10 text-center">
                                    <div className="d-flex align-items-center mb-2 mb-sm-0">
                                        <span className="badge bg-primary px-3 py-2 rounded-pill shadow-sm" style={{ background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)' }}>
                                            KHU VỰC: {area.name}
                                        </span>
                                        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary', opacity: 0.7 }}>
                                            {area.rows} hàng x {area.cols} ghế
                                        </Typography>
                                    </div>
                                    {toggleAreaSeats && (
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={isAllSelected ? <IndeterminateIcon /> : <CheckBoxIcon />}
                                            onClick={() => toggleAreaSeats(area.name, seatsInArea)}
                                            sx={{
                                                borderRadius: '20px',
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                color: isAllSelected ? '#ef4444' : 'rgba(255,255,255,0.7)',
                                                borderColor: isAllSelected ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.2)',
                                                '&:hover': {
                                                    borderColor: isAllSelected ? '#ef4444' : '#2dc275',
                                                    color: isAllSelected ? '#ef4444' : '#2dc275',
                                                    bgcolor: isAllSelected ? 'rgba(239,68,68,0.05)' : 'rgba(45,194,117,0.05)'
                                                }
                                            }}
                                        >
                                            {isAllSelected ? 'Hủy chọn tất cả' : 'Chọn nhanh tất cả'}
                                        </Button>
                                    )}
                                </div>
                                <div className="d-flex flex-column align-items-center gap-2 p-4 bg-black bg-opacity-10 rounded-4 overflow-auto">
                                    {[...Array(area.rows)].map((_, rIdx) => {
                                        const rowName = String.fromCharCode(65 + rIdx);
                                        return (
                                            <div key={rowName} className="d-flex justify-content-center gap-2">
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
                        );
                    })
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
                    <span className="text-white opacity-75 small">Ghế trống</span>
                </div>
                <div className="d-flex align-items-center">
                    <span className="legend-dot me-2 shadow-success" style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#f59e0b', boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)' }}></span>
                    <span className="text-white fw-bold small">Đã gán & Đã đặt</span>
                </div>
                <div className="d-flex align-items-center">
                    <span className="legend-dot me-2 shadow-danger" style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#3498db', boxShadow: '0 0 10px rgba(52, 152, 219, 0.4)' }}></span>
                    <span className="text-white opacity-75 small">Đã gán (Còn trống)</span>
                </div>
                <div className="d-flex align-items-center">
                    <span className="legend-dot me-2 shadow-danger" style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.4)' }}></span>
                    <span className="text-white opacity-75 small">Khóa/Hỏng</span>
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
