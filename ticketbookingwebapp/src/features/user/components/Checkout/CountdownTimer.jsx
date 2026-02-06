import React, { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-bootstrap';
import { ClockCircleOutlined } from '@ant-design/icons';

/** Thời gian giữ ghế (giây) - phải khớp với backend (duration_minutes=5) */
const HOLD_DURATION_SECONDS = 5 * 60;

/**
 * Countdown Timer Component
 * Hiển thị đếm ngược thời gian giữ ghế. Không reset khi đã hết giờ (tránh reset lúc đang ở checkout).
 */
const CountdownTimer = ({ hasSelectedSeats, onExpired, eventId }) => {
    const [timeLeft, setTimeLeft] = useState(HOLD_DURATION_SECONDS);
    const intervalRef = useRef(null);
    const expiredTriggeredRef = useRef(false);
    const STORAGE_KEY = eventId ? `seat_timer_start_${eventId}` : null;

    // Initialize timer from sessionStorage or start new. Khi đã hết giờ thì KHÔNG ghi lại startTime mới.
    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!hasSelectedSeats || !STORAGE_KEY) {
            if (STORAGE_KEY) {
                sessionStorage.removeItem(STORAGE_KEY);
            }
            expiredTriggeredRef.current = false;
            setTimeLeft(HOLD_DURATION_SECONDS);
            return;
        }

        let storedStartTime = sessionStorage.getItem(STORAGE_KEY);
        let startTime;

        if (storedStartTime) {
            startTime = parseInt(storedStartTime, 10);
        } else {
            startTime = Date.now();
            sessionStorage.setItem(STORAGE_KEY, startTime.toString());
        }

        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const initialRemaining = Math.max(0, HOLD_DURATION_SECONDS - elapsed);
        setTimeLeft(initialRemaining);

        if (initialRemaining === 0) {
            if (!expiredTriggeredRef.current && onExpired) {
                expiredTriggeredRef.current = true;
                onExpired();
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, HOLD_DURATION_SECONDS - elapsed);
            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(intervalRef.current);
                if (!expiredTriggeredRef.current && onExpired) {
                    expiredTriggeredRef.current = true;
                    onExpired();
                }
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [hasSelectedSeats, onExpired, STORAGE_KEY]);

    if (!hasSelectedSeats || timeLeft <= 0) {
        return null;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isWarning = timeLeft <= 60; // Warning when less than 1 minute

    const formatTime = (value) => String(value).padStart(2, '0');

    return (
        <Alert 
            variant={isWarning ? "danger" : "warning"} 
            className="mb-3 d-flex align-items-center"
            style={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
        >
            <ClockCircleOutlined 
                style={{ 
                    fontSize: '20px', 
                    marginRight: '12px',
                    color: isWarning ? '#dc3545' : '#ffc107'
                }} 
            />
            <div className="flex-grow-1">
                <strong style={{ fontSize: '14px', marginRight: '8px' }}>
                    Thời gian giữ ghế còn lại:
                </strong>
                <span 
                    style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        color: isWarning ? '#dc3545' : '#856404'
                    }}
                >
                    {formatTime(minutes)}:{formatTime(seconds)}
                </span>
            </div>
        </Alert>
    );
};

export default CountdownTimer;
