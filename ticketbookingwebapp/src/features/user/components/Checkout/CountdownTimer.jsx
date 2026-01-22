import React, { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-bootstrap';
import { ClockCircleOutlined } from '@ant-design/icons';

/**
 * Countdown Timer Component
 * Displays a 10-minute countdown when user has selected seats
 */
const CountdownTimer = ({ hasSelectedSeats, onExpired, eventId }) => {
    const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
    const intervalRef = useRef(null);
    const STORAGE_KEY = eventId ? `seat_timer_start_${eventId}` : null;

    // Initialize timer from sessionStorage or start new
    useEffect(() => {
        // Clear any existing interval first
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (!hasSelectedSeats || !STORAGE_KEY) {
            // Clear timer if no seats selected
            if (STORAGE_KEY) {
                sessionStorage.removeItem(STORAGE_KEY);
            }
            setTimeLeft(10 * 60);
            return;
        }

        // Get stored start time
        let storedStartTime = sessionStorage.getItem(STORAGE_KEY);
        let startTime;
        
        if (storedStartTime) {
            // Continue from stored time (user navigated between pages or component remounted)
            startTime = parseInt(storedStartTime, 10);
        } else {
            // Start new timer (first time selecting seats)
            startTime = Date.now();
            sessionStorage.setItem(STORAGE_KEY, startTime.toString());
        }

        // Calculate initial time left
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const initialRemaining = Math.max(0, 10 * 60 - elapsed);
        setTimeLeft(initialRemaining);

        // If already expired, trigger callback immediately
        if (initialRemaining === 0) {
            if (STORAGE_KEY) {
                sessionStorage.removeItem(STORAGE_KEY);
            }
            if (onExpired) {
                onExpired();
            }
            return;
        }

        // Start countdown
        intervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, 10 * 60 - elapsed);
            
            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(intervalRef.current);
                if (STORAGE_KEY) {
                    sessionStorage.removeItem(STORAGE_KEY);
                }
                if (onExpired) {
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
