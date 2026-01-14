import React from 'react';

/**
 * Professional TemplateSeat Component for Organizer Management
 */
const TemplateSeat = React.memo(({ t, isSelected, occupiedBy, activeTicketTypeId, onMouseDown, onMouseEnter }) => {
    const isOtherType = occupiedBy && occupiedBy.ticket_type_id !== activeTicketTypeId;

    // Style determination
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    let textColor = 'rgba(255, 255, 255, 0.3)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';
    let shadow = 'none';
    let transform = 'none';
    let cursor = 'pointer';

    if (isSelected) {
        bgColor = '#2dc275';
        textColor = '#fff';
        borderColor = '#2dc275';
        shadow = '0 0 15px rgba(45, 194, 117, 0.5)';
        transform = 'scale(1.1)';
    } else if (isOtherType) {
        bgColor = '#ef4444';
        textColor = '#fff';
        borderColor = '#ef4444';
        cursor = 'not-allowed';
    }

    return (
        <div
            className="template-seat p-0 d-flex align-items-center justify-content-center"
            style={{
                width: '32px',
                height: '32px',
                fontSize: '10px',
                fontWeight: 'bold',
                backgroundColor: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                cursor: cursor,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: shadow,
                transform: transform,
                userSelect: 'none'
            }}
            onMouseDown={(e) => !isOtherType && onMouseDown(e, t)}
            onMouseEnter={() => !isOtherType && onMouseEnter(t)}
            title={`Hàng ${t.row_name} - Ghế ${t.seat_number} ${isOtherType ? '(Đã gán hạng vé khác)' : ''}`}
        >
            {t.seat_number}
        </div>
    );
});

export default TemplateSeat;
