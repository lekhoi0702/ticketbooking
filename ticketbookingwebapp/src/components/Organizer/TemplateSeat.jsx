import React from 'react';

/**
 * Professional TemplateSeat Component for Organizer Management
 */
const TemplateSeat = React.memo(({ t, isSelected, occupiedBy, activeTicketTypeId, onMouseDown, onMouseEnter, isLocked }) => {
    const isOtherType = occupiedBy && occupiedBy.ticket_type_id !== activeTicketTypeId;

    // Style determination
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    let textColor = 'rgba(255, 255, 255, 0.3)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';
    let shadow = 'none';
    let transform = 'none';
    let cursor = 'pointer';

    if (isLocked) {
        bgColor = 'rgba(239, 68, 68, 0.1)';
        textColor = '#ef4444';
        borderColor = 'rgba(239, 68, 68, 0.5)';
        cursor = 'not-allowed';
    } else if (isSelected) {
        bgColor = '#2dc275';
        textColor = '#fff';
        borderColor = '#2dc275';
        shadow = '0 0 15px rgba(45, 194, 117, 0.5)';
        transform = 'scale(1.1)';
    } else if (isOtherType) {
        bgColor = 'rgba(52, 152, 219, 0.2)'; // Blue-ish for occupied by others
        textColor = '#3498db';
        borderColor = 'rgba(52, 152, 219, 0.5)';
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
            onMouseDown={(e) => (!isOtherType && !isLocked) && onMouseDown(e, t)}
            onMouseEnter={() => (!isOtherType && !isLocked) && onMouseEnter(t)}
            title={`${t.area ? t.area + ' - ' : ''}Hàng ${t.row_name} - Ghế ${t.seat_number} ${isLocked ? '(Ghế hỏng/Khóa)' : isOtherType ? '(Đã gán hạng vé khác)' : ''}`}
        >
            {isLocked ? '✕' : t.seat_number}
        </div>
    );
});

export default TemplateSeat;
