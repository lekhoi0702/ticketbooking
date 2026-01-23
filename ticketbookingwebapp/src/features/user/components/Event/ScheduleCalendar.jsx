import React, { useState } from 'react';
import { FaList, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { parseLocalDateTime } from '@shared/utils/eventUtils';
import './ScheduleCalendar.css';

const ScheduleCalendar = ({ currentEvent, schedules, onSelectSchedule, selectedScheduleId }) => {
    const [viewMode, setViewMode] = useState('calendar'); // Default to calendar view
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Combine current event with other schedules
    const allSchedules = [
        {
            event_id: currentEvent.event_id,
            start_datetime: currentEvent.start_datetime,
            end_datetime: currentEvent.end_datetime
        },
        ...schedules
    ];


    // Group schedules by date - Use parseLocalDateTime to prevent timezone issues
    const schedulesByDate = allSchedules.reduce((acc, schedule) => {
        const date = parseLocalDateTime(schedule.start_datetime);
        if (!date) return acc;
        // Create dateKey from local date components to avoid UTC conversion
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(schedule);
        return acc;
    }, {});

    // Get days in month
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    const weekDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const getSchedulesForDay = (day) => {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return schedulesByDate[dateKey] || [];
    };

    const renderCalendarDays = () => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Empty cells for days before month starts
        for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
            days.push(<div key={`empty-${i}`} className="schedule-calendar-day empty"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const daySchedules = getSchedulesForDay(day);
            const isToday = currentDate.toDateString() === today.toDateString();
            const hasSchedules = daySchedules.length > 0;
            const isPast = currentDate < today;
            const isSelected = daySchedules.some(s => s.event_id === selectedScheduleId);

            days.push(
                <div
                    key={day}
                    className={`schedule-calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasSchedules ? 'has-schedules' : ''} ${isPast ? 'past' : ''}`}
                    onClick={() => hasSchedules && !isPast && onSelectSchedule(daySchedules[0].event_id)}
                >
                    <div className="schedule-day-number">{String(day).padStart(2, '0')}</div>
                    {hasSchedules && (
                        <div className="schedule-indicator">
                            <div className="schedule-indicator-bar"></div>
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    // Count schedules by month
    const getMonthScheduleCount = (monthOffset) => {
        const targetDate = new Date(year, month + monthOffset, 1);
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();

        return allSchedules.filter(schedule => {
            const scheduleDate = parseLocalDateTime(schedule.start_datetime);
            return scheduleDate && scheduleDate.getFullYear() === targetYear && scheduleDate.getMonth() === targetMonth;
        }).length;
    };

    return (
        <div className="schedule-calendar-wrapper">
            <div className="schedule-calendar-header">
                <div className="schedule-view-toggle">
                    <button
                        className={`schedule-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <FaList />
                    </button>
                    <button
                        className={`schedule-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                        onClick={() => setViewMode('calendar')}
                    >
                        <FaCalendarAlt />
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <div className="schedule-calendar-view">
                    <div className="schedule-month-navigation">
                        <button className="schedule-nav-btn" onClick={handlePrevMonth}>
                            <FaChevronLeft />
                        </button>
                        <div className="schedule-month-tabs">
                            <div className="schedule-month-tab active">
                                <div className="schedule-month-name">{monthNames[month]}, {year}</div>
                                <div className="schedule-month-count">{getMonthScheduleCount(0)} suất diễn</div>
                            </div>
                        </div>
                        <button className="schedule-nav-btn" onClick={handleNextMonth}>
                            <FaChevronRight />
                        </button>
                    </div>

                    <div className="schedule-weekdays">
                        {weekDays.map(day => (
                            <div key={day} className="schedule-weekday">{day}</div>
                        ))}
                    </div>

                    <div className="schedule-calendar-grid">
                        {renderCalendarDays()}
                    </div>
                </div>
            ) : (
                <div className="schedule-list-view">
                    {allSchedules.map(schedule => {
                        const scheduleDate = parseLocalDateTime(schedule.start_datetime);
                        return (
                            <div
                                key={schedule.event_id}
                                className={`schedule-list-item ${selectedScheduleId === schedule.event_id ? 'selected' : ''}`}
                                onClick={() => onSelectSchedule(schedule.event_id)}
                            >
                                <div className="schedule-item-time">
                                    {scheduleDate ? scheduleDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </div>
                                <div className="schedule-item-date">
                                    {scheduleDate ? scheduleDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ScheduleCalendar;
