import React from 'react';

/**
 * Professional TemplateSeat Component for Organizer Management
 */
const TemplateSeat = React.memo(({ t, isSelected, occupiedBy, activeTicketTypeId, onMouseDown, onMouseEnter, isLocked }) => {
    const isOtherType = occupiedBy && activeTicketTypeId && occupiedBy.ticket_type_id !== activeTicketTypeId;
    const isBooked = occupiedBy && occupiedBy.status === 'BOOKED';

    // Style determination
    let bgColor = 'rgba(255, 255, 255, 0.08)';
    let textColor = 'rgba(255, 255, 255, 0.6)'; // Increased from 0.3 for better readability
    let borderColor = 'rgba(255, 255, 255, 0.15)';
    let shadow = 'none';
    let transform = 'none';
    let cursor = 'pointer';

    if (isLocked) {
        bgColor = 'rgba(239, 68, 68, 0.15)';
        textColor = '#ff6b6b'; // Brighter red
        borderColor = 'rgba(239, 68, 68, 0.5)';
        cursor = 'not-allowed';
    } else if (isBooked) {
        bgColor = '#f59e0b';
        textColor = '#ffffff'; // Keep white for solid background
        borderColor = '#f59e0b';
        shadow = '0 0 10px rgba(245, 158, 11, 0.4)';
        cursor = 'default';
    } else if (isSelected) {
        bgColor = '#2dc275';
        textColor = '#ffffff';
        borderColor = '#2dc275';
        shadow = '0 0 15px rgba(45, 194, 117, 0.5)';
        transform = 'scale(1.1)';
    } else if (occupiedBy) {
        // If it's assigned to ANY ticket type but not booked
        bgColor = 'rgba(52, 152, 219, 0.25)';
        textColor = '#5dade2'; // Brighter blue
        borderColor = 'rgba(52, 152, 219, 0.6)';
        cursor = activeTicketTypeId ? 'not-allowed' : 'pointer';
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
            title={`${t.area ? t.area + ' - ' : ''}Hàng ${t.row_name} - Ghế ${t.seat_number} ${isLocked ? '(Ghế hỏng/Khóa)' : isBooked ? '(Đã đặt)' : occupiedBy ? '(Đã gán hạng vé)' : '(Chưa gán)'}`}
        >
            {isLocked ? '✕' : t.seat_number}
        </div>
    );
});

export default TemplateSeat;
