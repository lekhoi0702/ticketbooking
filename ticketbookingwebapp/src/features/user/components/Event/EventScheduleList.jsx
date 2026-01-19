import React from 'react';
import { Link } from 'react-router-dom';
import { parseLocalDateTime } from '@shared/utils/eventUtils';

const EventScheduleList = ({ event }) => {
    if (!event.schedule || event.schedule.length === 0) return null;

    const currentEventDate = parseLocalDateTime(event.start_datetime);

    return (
        <div className="schedule-selector" id="schedule">
            <h5 className="mb-3 text-white">Lịch diễn</h5>
            <p className="text-muted small">Vui lòng chọn suất diễn phù hợp:</p>
            <div className="schedule-list">
                <Link
                    to={`/event/${event.event_id}`}
                    className="schedule-item active"
                >
                    <div className="time">{currentEventDate ? currentEventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                    <div className="date">{currentEventDate ? currentEventDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'}</div>
                </Link>
                {event.schedule.map(s => {
                    const scheduleDate = parseLocalDateTime(s.start_datetime);
                    return (
                        <Link
                            key={s.event_id}
                            to={`/event/${s.event_id}`}
                            className={`schedule-item ${s.event_id === event.event_id ? 'active' : ''}`}
                        >
                            <div className="time">{scheduleDate ? scheduleDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                            <div className="date">{scheduleDate ? scheduleDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'}</div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default EventScheduleList;
