import React from 'react';
import { Tooltip } from 'antd';

/**
 * Professional TemplateSeat Component for Organizer Management
 */
const TemplateSeat = React.memo(({ t, isSelected, occupiedBy, activeTicketTypeId, onMouseDown, onMouseEnter, isLocked }) => {
    const isOtherType = occupiedBy && activeTicketTypeId && String(occupiedBy.ticket_type_id) !== String(activeTicketTypeId);
    const isBooked = occupiedBy && occupiedBy.status === 'BOOKED';

    // Style determination
    let bgColor = 'rgba(255, 255, 255, 0.05)';
    let textColor = 'rgba(255, 255, 255, 0.3)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';
    let shadow = 'none';
    let transform = 'none';
    let cursor = 'pointer';

    if (isLocked) {
        bgColor = 'rgba(255, 77, 79, 0.2)';
        textColor = '#ff4d4f';
        borderColor = 'rgba(255, 77, 79, 0.4)';
        cursor = 'not-allowed';
    } else if (isBooked) {
        bgColor = '#faad14';
        textColor = '#ffffff';
        borderColor = '#faad14';
        shadow = '0 0 10px rgba(250, 173, 20, 0.3)';
        cursor = 'default';
    } else if (isSelected) {
        bgColor = '#52c41a';
        textColor = '#ffffff';
        borderColor = '#52c41a';
        shadow = '0 0 12px rgba(82, 196, 26, 0.4)';
        transform = 'scale(1.1)';
    } else if (occupiedBy) {
        // If it's assigned to ANY ticket type but not booked
        bgColor = '#ff4d4f'; // Highlighting other ticket types in red to avoid overlap
        textColor = '#ffffff';
        borderColor = '#ff4d4f';
        cursor = activeTicketTypeId ? 'not-allowed' : 'pointer';
    }

    const title = `${t.area ? t.area + ' - ' : ''}Hàng ${t.row_name} - Ghế ${t.seat_number} ${isLocked ? '(Ghế hỏng/Khóa)' : isBooked ? '(Đã đặt)' : occupiedBy ? '(Đã gán hạng vé khác)' : '(Chưa gán)'}`;

    return (
        <Tooltip title={title} mouseEnterDelay={0.5}>
            <div
                className="template-seat"
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    userSelect: 'none'
                }}
                onMouseDown={(e) => (!isOtherType && !isLocked) && onMouseDown(e, t)}
                onMouseEnter={() => (!isOtherType && !isLocked) && onMouseEnter(t)}
            >
                {isLocked ? '✕' : t.seat_number}
            </div>
        </Tooltip>
    );
});

export default TemplateSeat;
