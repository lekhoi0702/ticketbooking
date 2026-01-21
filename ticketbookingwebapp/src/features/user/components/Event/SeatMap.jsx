import React, { useState, useEffect } from 'react';
import { Row, Col, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { FaChair } from 'react-icons/fa';
import { api } from '@services/api';
import './SeatMap.css';

const SeatMap = ({ ticketType, onSelectionChange, maxSelection = 10, onSeatsLoaded }) => {
    const [loading, setLoading] = useState(true);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState(null);
    const [rowsData, setRowsData] = useState({});

    useEffect(() => {
        if (ticketType) {
            fetchSeats();
            setSelectedSeats([]);
        }
    }, [ticketType]);

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

        const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
        let newSelection = [];

        if (isSelected) {
            newSelection = selectedSeats.filter(s => s.seat_id !== seat.seat_id);
        } else {
            if (selectedSeats.length >= maxSelection) {
                setError(`Bạn chỉ có thể chọn tối đa ${maxSelection} ghế`);
                setTimeout(() => setError(null), 4000); // Auto-dismiss
                return;
            }
            newSelection = [...selectedSeats, seat];
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
                                const isBooked = seat.status === 'BOOKED' || seat.status === 'RESERVED';

                                let seatClass = 'seat-item seat-available';
                                if (isSelected) {
                                    seatClass = 'seat-item seat-selected';
                                } else if (isBooked) {
                                    seatClass = 'seat-item seat-booked';
                                }

                                return (
                                    <OverlayTrigger
                                        key={seat.seat_id}
                                        placement="top"
                                        overlay={
                                            <Tooltip id={`seat-tooltip-${seat.seat_id}`}>
                                                {`Ghế ${seat.seat_label} - ${formatPrice(ticketType.price)}`}
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
                                                    style={!isSelected && !isBooked ? { 
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
