import React from 'react';

/**
 * Memoized Seat Component for better performance in the management view
 */
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

export default TemplateSeat;
