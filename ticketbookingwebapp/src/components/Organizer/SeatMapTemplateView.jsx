import React from 'react';
import TemplateSeat from './TemplateSeat';

const SeatMapTemplateView = ({
    venueTemplate,
    selectedTemplateSeats,
    allOccupiedSeats,
    activeTicketType,
    handleSeatMouseDown,
    handleSeatMouseEnter
}) => {
    return (
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
    );
};

export default SeatMapTemplateView;
