import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { FaChair } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { api } from '@services/api';
import { seatApi } from '@services/api/seat';
import { useAuth } from '@context/AuthContext';
import './SeatMap.css';

const SeatMap = ({ ticketType, eventId, onSelectionChange, maxSelection = 10, onSeatsLoaded }) => {
    const { user, triggerLogin, isAuthenticated, redirectIntent, clearRedirectIntent } = useAuth();
    const [loading, setLoading] = useState(true);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [rowsData, setRowsData] = useState({});
    const socketRef = useRef(null);
    const reservationTimersRef = useRef({});
    const seatSelectionProcessedRef = useRef(false);

    // Initialize Socket.IO connection
    useEffect(() => {
        if (!eventId || !user) return;

        // Get Socket.IO URL from environment or default to localhost
        const socketUrl = import.meta.env.VITE_API_BASE_URL 
            ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
            : (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

        const socket = io(socketUrl, {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            socket.emit('join_event', { event_id: eventId });
        });

        socket.on('seat_reserved', (data) => {
            // Update seat status when another user reserves a seat
            setSeats(prevSeats => 
                prevSeats.map(seat => 
                    seat.seat_id === data.seat_id 
                        ? { ...seat, status: 'RESERVED' }
                        : seat
                )
            );
            updateRowsData();
        });

        socket.on('seat_released', (data) => {
            // Update seat status when a seat is released
            setSeats(prevSeats => 
                prevSeats.map(seat => 
                    seat.seat_id === data.seat_id 
                        ? { ...seat, status: 'AVAILABLE' }
                        : seat
                )
            );
            updateRowsData();
        });

        socketRef.current = socket;

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave_event', { event_id: eventId });
                socketRef.current.disconnect();
            }
        };
    }, [eventId, user]);

    // Handle seat selection after login
    useEffect(() => {
        if (!isAuthenticated || !redirectIntent || !seats.length || loading || !user) return;
        
        // Check if this is a seat selection intent for this ticket type
        if (redirectIntent.action === 'selectSeat' && 
            redirectIntent.eventId === eventId && 
            redirectIntent.ticketTypeId === ticketType.ticket_type_id &&
            redirectIntent.seatId) {
            
            // Prevent duplicate processing
            if (seatSelectionProcessedRef.current) return;
            
            const seatToSelect = seats.find(s => s.seat_id === redirectIntent.seatId);
            
            if (seatToSelect && !selectedSeats.some(s => s.seat_id === seatToSelect.seat_id)) {
                // Mark as processed to prevent duplicate selections
                seatSelectionProcessedRef.current = true;
                
                // Automatically select the seat after login
                const selectSeatAfterLogin = async () => {
                    try {
                        if (seatToSelect.status === 'AVAILABLE' || seatToSelect.status === 'RESERVED') {
                            const res = await seatApi.lockSeat(seatToSelect.seat_id, user.user_id, eventId);
                            if (res.success) {
                                const newSelection = [...selectedSeats, seatToSelect];
                                setSelectedSeats(newSelection);
                                onSelectionChange(newSelection);
                                
                                // Save to storage
                                const expiresAt = res.data.expires_at;
                                saveReservationsToStorage(newSelection.map(s => s.seat_id), expiresAt);
                                
                                // Update seat status
                                setSeats(prevSeats => 
                                    prevSeats.map(s => 
                                        s.seat_id === seatToSelect.seat_id 
                                            ? { ...s, status: 'RESERVED' }
                                            : s
                                    )
                                );
                                updateRowsData();
                                
                                // Clear the redirect intent
                                clearRedirectIntent();
                            }
                        } else {
                            // Seat is booked or unavailable
                            clearRedirectIntent();
                        }
                    } catch (err) {
                        console.error('Error selecting seat after login:', err);
                        clearRedirectIntent();
                    } finally {
                        seatSelectionProcessedRef.current = false;
                    }
                };
                
                selectSeatAfterLogin();
            } else {
                // Seat not found or already selected, clear intent
                clearRedirectIntent();
                seatSelectionProcessedRef.current = false;
            }
        }
    }, [isAuthenticated, redirectIntent, eventId, ticketType?.ticket_type_id, seats, loading, user, selectedSeats, onSelectionChange, clearRedirectIntent]);

    // Restore reservations from server after seats are loaded
    useEffect(() => {
        if (!eventId || !user || !ticketType || seats.length === 0 || loading) return;

        const restoreReservations = async () => {
            try {
                const res = await seatApi.getMyReservations(eventId, user.user_id);
                if (res.success && res.data) {
                    const validReservations = res.data.filter(r => !r.is_expired);
                    
                    if (validReservations.length > 0) {
                        // Map reservation seat_ids to actual seat objects
                        const restoredSeats = validReservations
                            .map(r => seats.find(s => s.seat_id === r.seat_id))
                            .filter(s => s !== undefined);
                        
                        if (restoredSeats.length > 0) {
                            setSelectedSeats(restoredSeats);
                            onSelectionChange(restoredSeats);
                            
                            // Save to localStorage
                            const storageKey = `seat_reservations_${eventId}_${user.user_id}`;
                            localStorage.setItem(storageKey, JSON.stringify(
                                validReservations.map(r => ({
                                    seat_id: r.seat_id,
                                    expires_at: r.expires_at
                                }))
                            ));
                        }
                    }
                }
            } catch (err) {
                console.error('Error restoring reservations:', err);
            }
        };

        restoreReservations();
    }, [eventId, user, ticketType, seats, loading]);

    useEffect(() => {
        if (ticketType) {
            fetchSeats();
            // Reset processed flag when ticket type changes
            seatSelectionProcessedRef.current = false;
        }
    }, [ticketType]);

    const updateRowsData = () => {
        const rowData = {};
        seats.forEach(seat => {
            if (!rowData[seat.row_name]) {
                rowData[seat.row_name] = [];
            }
            rowData[seat.row_name].push(seat);
        });

        Object.keys(rowData).forEach(row => {
            rowData[row].sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number));
        });

        setRows(Object.keys(rowData).sort());
        setRowsData(rowData);
    };

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

    const saveReservationsToStorage = (seatIds, expiresAt) => {
        if (!eventId || !user) return;
        const storageKey = `seat_reservations_${eventId}_${user.user_id}`;
        const reservations = seatIds.map(seatId => ({
            seat_id: seatId,
            expires_at: expiresAt
        }));
        localStorage.setItem(storageKey, JSON.stringify(reservations));
    };

    const clearReservationsFromStorage = () => {
        if (!eventId || !user) return;
        const storageKey = `seat_reservations_${eventId}_${user.user_id}`;
        localStorage.removeItem(storageKey);
    };

    const toggleSeat = async (seat) => {
        if (!isAuthenticated || !eventId) {
            // Trigger login modal and store seat selection intent
            triggerLogin({
                action: 'selectSeat',
                eventId: eventId,
                ticketTypeId: ticketType.ticket_type_id,
                seatId: seat.seat_id,
                seat: seat
            });
            return;
        }

        if (!user) {
            setError('Vui lòng đăng nhập để chọn ghế');
            setTimeout(() => setError(null), 4000);
            return;
        }

        // Prevent clicking on booked or reserved seats (by other users)
        if (seat.status === 'BOOKED') {
            setError('Ghế này đã được bán');
            setTimeout(() => setError(null), 4000);
            return;
        }

        const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
        
        // If seat is reserved by another user, don't allow selection
        if (seat.status === 'RESERVED' && !isSelected) {
            setError('Ghế này đang được người khác chọn');
            setTimeout(() => setError(null), 4000);
            return;
        }

        if (isSelected) {
            // Unlock seat
            try {
                await seatApi.unlockSeat(seat.seat_id, user.user_id, eventId);
                const newSelection = selectedSeats.filter(s => s.seat_id !== seat.seat_id);
                setSelectedSeats(newSelection);
                onSelectionChange(newSelection);
                
                // Update storage
                if (newSelection.length === 0) {
                    clearReservationsFromStorage();
                } else {
                    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
                    saveReservationsToStorage(newSelection.map(s => s.seat_id), expiresAt.toISOString());
                }
            } catch (err) {
                setError(err.message || 'Không thể hủy chọn ghế');
                setTimeout(() => setError(null), 4000);
            }
        } else {
            // Lock seat
            if (selectedSeats.length >= maxSelection) {
                setError(`Bạn chỉ có thể chọn tối đa ${maxSelection} ghế`);
                setTimeout(() => setError(null), 4000);
                return;
            }

            try {
                const res = await seatApi.lockSeat(seat.seat_id, user.user_id, eventId);
                if (res.success) {
                    const newSelection = [...selectedSeats, seat];
                    setSelectedSeats(newSelection);
                    onSelectionChange(newSelection);
                    
                    // Save to storage
                    const expiresAt = res.data.expires_at;
                    saveReservationsToStorage(newSelection.map(s => s.seat_id), expiresAt);
                    
                    // Update seat status
                    setSeats(prevSeats => 
                        prevSeats.map(s => 
                            s.seat_id === seat.seat_id 
                                ? { ...s, status: 'RESERVED' }
                                : s
                        )
                    );
                    updateRowsData();
                }
            } catch (err) {
                setError(err.message || 'Không thể chọn ghế này');
                setTimeout(() => setError(null), 4000);
            }
        }
    };

    if (loading) return <LoadingSpinner tip="Đang tải sơ đồ ghế..." />;

    if (seats.length === 0) return (
        <div className="seat-map-empty">
            <p className="mb-0">Loại vé này hiện không cần chọn số ghế cụ thể.</p>
        </div>
    );

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
                                const isBooked = seat.status === 'BOOKED';
                                const isReserved = seat.status === 'RESERVED' && !isSelected; // Reserved by another user

                                let seatClass = 'seat-item seat-available';
                                if (isSelected) {
                                    seatClass = 'seat-item seat-selected';
                                } else if (isBooked) {
                                    seatClass = 'seat-item seat-booked';
                                } else if (isReserved) {
                                    seatClass = 'seat-item seat-reserved';
                                }

                                // Determine tooltip message
                                let tooltipMessage = `Ghế ${seat.seat_label} - ${formatPrice(ticketType.price)}`;
                                if (isBooked) {
                                    tooltipMessage = `Ghế ${seat.seat_label} - Đã bán`;
                                } else if (isReserved) {
                                    tooltipMessage = `Ghế ${seat.seat_label} - Đang được chọn`;
                                }

                                return (
                                    <OverlayTrigger
                                        key={seat.seat_id}
                                        placement="top"
                                        overlay={
                                            <Tooltip id={`seat-tooltip-${seat.seat_id}`}>
                                                {tooltipMessage}
                                            </Tooltip>
                                        }
                                    >
                                        <div
                                            className={seatClass}
                                            onClick={() => {
                                                // Only allow click if seat is available or selected by current user
                                                if (seat.status === 'AVAILABLE' || isSelected) {
                                                    toggleSeat(seat);
                                                }
                                            }}
                                            style={{
                                                cursor: (seat.status === 'AVAILABLE' || isSelected) ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {isBooked ? (
                                                <FaChair size={12} />
                                            ) : isReserved ? (
                                                <FaChair size={12} style={{ opacity: 0.6 }} />
                                            ) : (
                                                <span 
                                                    className="seat-number"
                                                    style={!isSelected && seat.status === 'AVAILABLE' ? { 
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
                        <span className="seat-map-legend-indicator reserved"></span>
                        <span>Đang được chọn</span>
                    </div>
                    <div className="seat-map-legend-item">
                        <span className="seat-map-legend-indicator booked"></span>
                        <span>Đã bán</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default SeatMap;
