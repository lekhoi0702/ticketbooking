import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { FaChair, FaClock } from 'react-icons/fa';
import { api } from '@services/api';
import { io } from 'socket.io-client';
import { BASE_URL } from '@shared/constants';
import './SeatMap.css';

// Configuration: Must match backend SEAT_HOLD_TIMEOUT_MINUTES
const SEAT_HOLD_TIMEOUT_SECONDS = 30 * 60; // 30 minutes in seconds

const SeatMap = ({ ticketType, onSelectionChange, maxSelection = 10, onSeatsLoaded, onTimerUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [rowsData, setRowsData] = useState({});
    const [lockedByOthers, setLockedByOthers] = useState([]); // Array of seat IDs
    const [socket, setSocket] = useState(null);
    
    // Timer state for seat hold countdown
    const [seatTimers, setSeatTimers] = useState({}); // { seat_id: remaining_seconds }
    const timerIntervalRef = useRef(null);

    // Format seconds to mm:ss
    const formatTime = (seconds) => {
        if (seconds <= 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get minimum remaining time across all selected seats
    const getMinRemainingTime = useCallback(() => {
        if (selectedSeats.length === 0) return 0;
        const times = Object.values(seatTimers).filter(t => t > 0);
        // If we have selected seats but no timer data yet, start with full 30 minutes
        if (times.length === 0 && selectedSeats.length > 0) {
            return SEAT_HOLD_TIMEOUT_SECONDS;
        }
        return times.length > 0 ? Math.min(...times) : 0;
    }, [seatTimers, selectedSeats.length]);

    // Ensure all selected seats have timers initialized
    useEffect(() => {
        if (selectedSeats.length > 0) {
            setSeatTimers(prev => {
                const updated = { ...prev };
                let hasChanges = false;
                
                selectedSeats.forEach(seat => {
                    // If this seat doesn't have a timer yet, initialize it
                    if (!updated[seat.seat_id] || updated[seat.seat_id] <= 0) {
                        updated[seat.seat_id] = SEAT_HOLD_TIMEOUT_SECONDS;
                        hasChanges = true;
                    }
                });
                
                // Remove timers for seats that are no longer selected
                Object.keys(updated).forEach(seatId => {
                    if (!selectedSeats.some(s => s.seat_id === parseInt(seatId))) {
                        delete updated[seatId];
                        hasChanges = true;
                    }
                });
                
                return hasChanges ? updated : prev;
            });
        } else {
            // Clear all timers when no seats are selected
            setSeatTimers({});
        }
    }, [selectedSeats]);

    // Countdown timer effect
    useEffect(() => {
        if (Object.keys(seatTimers).length === 0) {
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            setSeatTimers(prev => {
                const updated = {};
                
                for (const [seatId, remaining] of Object.entries(prev)) {
                    const newRemaining = remaining - 1;
                    if (newRemaining > 0) {
                        updated[seatId] = newRemaining;
                    }
                }
                
                return updated;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [Object.keys(seatTimers).length]);

    // Sync timers to parent component
    useEffect(() => {
        if (onTimerUpdate) {
            onTimerUpdate(seatTimers);
        }
    }, [seatTimers, onTimerUpdate]);

    useEffect(() => {
        if (ticketType) {
            fetchSeats();
            setSelectedSeats([]);
            setSeatTimers({});
        }
    }, [ticketType]);

    useEffect(() => {
        if (!ticketType || !ticketType.event_id) return;

        // Initialize socket connection through Vite proxy
        const newSocket = io(window.location.origin, {
            path: '/socket.io',
            transports: ['polling'], // Start with polling only, let server upgrade
            timeout: 20000,
            forceNew: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            upgrade: true // Allow upgrade to websocket
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            newSocket.emit('join_event', { event_id: ticketType.event_id });
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // When another user locks a seat
        newSocket.on('seat_locked', (data) => {
            console.log('Seat locked by others:', data);
            setLockedByOthers(prev => {
                if (prev.includes(data.seat_id)) return prev;
                return [...prev, data.seat_id];
            });
        });

        // When a seat is unlocked
        newSocket.on('seat_unlocked', (data) => {
            console.log('Seat unlocked:', data);
            setLockedByOthers(prev => prev.filter(id => id !== data.seat_id));
        });

        // When our seat lock is confirmed with timer
        newSocket.on('seat_lock_confirmed', (data) => {
            console.log('Seat lock confirmed:', data);
            setSeatTimers(prev => ({
                ...prev,
                [data.seat_id]: data.remaining_seconds
            }));
        });

        // When our seat lock fails
        newSocket.on('seat_lock_failed', (data) => {
            console.log('Seat lock failed:', data);
            setError(data.message || 'Không thể giữ ghế này');
            setTimeout(() => setError(null), 3000);
        });

        // When our seat deselection is confirmed
        newSocket.on('seat_deselect_confirmed', (data) => {
            console.log('Seat deselect confirmed:', data);
            setSeatTimers(prev => {
                const updated = { ...prev };
                delete updated[data.seat_id];
                return updated;
            });
        });

        // When a seat expires (from server cleanup)
        newSocket.on('seat_expired', (data) => {
            console.log('Seat expired:', data);
            // Remove from selected seats if it's ours
            setSelectedSeats(prev => {
                const updated = prev.filter(s => s.seat_id !== data.seat_id);
                if (updated.length !== prev.length) {
                    // This was our seat that expired
                    setError(`Ghế đã hết thời gian giữ (30 phút). Vui lòng chọn lại.`);
                    setTimeout(() => setError(null), 5000);
                    onSelectionChange(updated);
                }
                return updated;
            });
            setSeatTimers(prev => {
                const updated = { ...prev };
                delete updated[data.seat_id];
                return updated;
            });
        });

        // Receive timer sync from server
        newSocket.on('seat_timers', (data) => {
            console.log('Seat timers received:', data);
            const timers = {};
            data.seats.forEach(seat => {
                timers[seat.seat_id] = seat.remaining_seconds;
            });
            setSeatTimers(timers);
        });

        return () => {
            if (newSocket && newSocket.connected) {
                newSocket.emit('leave_event', { event_id: ticketType.event_id });
                newSocket.disconnect();
            }
        };
    }, [ticketType?.event_id, onSelectionChange]);

    const fetchSeats = async () => {
        try {
            setLoading(true);
            const res = await api.getSeatsByTicketType(ticketType.ticket_type_id);
            if (res.success) {
                setSeats(res.data);

                // Group seats by row
                const rowData = {};
                res.data.forEach(seat => {
                    if (!rowData[seat.row_name]) {
                        rowData[seat.row_name] = [];
                    }
                    rowData[seat.row_name].push(seat);
                });

                // Sort by seat number within rows
                Object.keys(rowData).forEach(row => {
                    rowData[row].sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number));
                });

                setRows(Object.keys(rowData).sort());
                setRowsData(rowData);
                if (onSeatsLoaded) onSeatsLoaded(true);
            } else {
                if (onSeatsLoaded) onSeatsLoaded(false);
            }
        } catch (error) {
            console.error("Error fetching seats:", error);
            if (onSeatsLoaded) onSeatsLoaded(false);
        } finally {
            setLoading(false);
        }
    };


    const toggleSeat = (seat) => {
        if (seat.status !== 'AVAILABLE') return;
        if (lockedByOthers.includes(seat.seat_id)) {
            setError("Ghế này đang được người khác chọn!");
            setTimeout(() => setError(null), 3000);
            return;
        }

        const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
        let newSelection = [];

        if (isSelected) {
            newSelection = selectedSeats.filter(s => s.seat_id !== seat.seat_id);
            // Remove timer when deselecting
            setSeatTimers(prev => {
                const updated = { ...prev };
                delete updated[seat.seat_id];
                return updated;
            });
            if (socket) {
                socket.emit('deselect_seat', {
                    event_id: ticketType.event_id,
                    seat_id: seat.seat_id
                });
            }
        } else {
            if (selectedSeats.length >= maxSelection) {
                setError(`Bạn chỉ có thể chọn tối đa ${maxSelection} ghế`);
                setTimeout(() => setError(null), 4000); // Auto-dismiss
                return;
            }
            newSelection = [...selectedSeats, seat];
            // Initialize timer immediately when selecting a seat
            setSeatTimers(prev => ({
                ...prev,
                [seat.seat_id]: SEAT_HOLD_TIMEOUT_SECONDS
            }));
            if (socket) {
                socket.emit('select_seat', {
                    event_id: ticketType.event_id,
                    seat_id: seat.seat_id
                });
            }
        }

        setSelectedSeats(newSelection);
        onSelectionChange(newSelection);
    };

    if (loading) return <LoadingSpinner tip="Đang tải sơ đồ ghế..." />;

    if (seats.length === 0) return (
        <div className="seat-map-empty">
            <p className="mb-0">Loại vé này hiện không cần chọn số ghế cụ thể.</p>
        </div>
    );

    const minRemainingTime = getMinRemainingTime();

    return (
        <div className="seat-map-container">
            {error && (
                <Alert
                    variant="danger"
                    className="mb-0"
                    onClose={() => setError(null)}
                    dismissible
                >
                    {error}
                </Alert>
            )}

            {/* Simple Countdown Timer */}
            {selectedSeats.length > 0 && (
                <div className="simple-countdown-timer">
                    <div className="timer-display">
                        <FaClock className="timer-icon" size={20} />
                        <div className="timer-countdown">{formatTime(minRemainingTime || SEAT_HOLD_TIMEOUT_SECONDS)}</div>
                    </div>
                </div>
            )}

            <div className="text-center mb-5">
                <div className="stage-label">
                    SÂN KHẤU / STAGE
                </div>
            </div>

            <div className="seats-grid">
                {rows.map(rowName => (
                    <div key={rowName} className="seats-row">
                        <div className="seats-row-label left">{rowName}</div>
                        <div className="seats-row-items">
                            {rowsData[rowName].map(seat => {
                                const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
                                const isLockedByOther = lockedByOthers.includes(seat.seat_id);
                                const isBooked = seat.status === 'BOOKED' || seat.status === 'RESERVED';

                                let seatClass = 'seat-item seat-available';
                                if (isSelected) {
                                    seatClass = 'seat-item seat-selected';
                                } else if (isBooked) {
                                    seatClass = 'seat-item seat-booked';
                                } else if (isLockedByOther) {
                                    seatClass = 'seat-item seat-locked';
                                }

                                return (
                                    <OverlayTrigger
                                        key={seat.seat_id}
                                        placement="top"
                                        overlay={
                                            <Tooltip id={`seat-tooltip-${seat.seat_id}`}>
                                                {isLockedByOther ? "Đang có người chọn" : `Ghế ${seat.seat_label} - ${formatPrice(ticketType.price)}`}
                                            </Tooltip>
                                        }
                                    >
                                        <div
                                            className={seatClass}
                                            onClick={() => toggleSeat(seat)}
                                        >
                                            {isBooked ? (
                                                <FaChair size={12} />
                                            ) : (
                                                <span 
                                                    className="seat-number"
                                                    style={!isSelected && !isBooked && !isLockedByOther ? { 
                                                        color: '#ffffff',
                                                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 0, 0, 0.3)'
                                                    } : undefined}
                                                >
                                                    {seat.seat_number}
                                                </span>
                                            )}
                                        </div>
                                    </OverlayTrigger>
                                );
                            })}
                        </div>
                        <div className="seats-row-label right">{rowName}</div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="seat-map-legend">
                <div className="seat-map-legend-items">
                    <div className="seat-map-legend-item">
                        <span className="seat-map-legend-indicator available"></span>
                        <span>Trống</span>
                    </div>
                    <div className="seat-map-legend-item">
                        <span className="seat-map-legend-indicator selected"></span>
                        <span>Bạn chọn</span>
                    </div>
                    <div className="seat-map-legend-item">
                        <span className="seat-map-legend-indicator locked"></span>
                        <span>Có người đang chọn</span>
                    </div>
                    <div className="seat-map-legend-item">
                        <span className="seat-map-legend-indicator booked"></span>
                        <span>Đã bán</span>
                    </div>
                </div>
            </div>
            
            {/* Seat hold time info */}
            <div className="seat-map-info">
                <FaClock />
                <span>Mỗi ghế được giữ tối đa 30 phút kể từ khi chọn</span>
            </div>
        </div>
    );
};

const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default SeatMap;
