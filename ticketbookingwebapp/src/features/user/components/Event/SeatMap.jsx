import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Badge, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { FaChair } from 'react-icons/fa';
import { api } from '@services/api';

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

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tải sơ đồ ghế...</p>
        </div>
    );

    if (seats.length === 0) return (
        <div className="text-center py-4 bg-light rounded-4 border border-dashed">
            <p className="mb-0 text-muted">Loại vé này hiện không cần chọn số ghế cụ thể.</p>
        </div>
    );

    return (
        <div className="seat-map-container p-4 bg-dark rounded-4 shadow-lg text-white">
            {error && (
                <Alert
                    variant="danger"
                    className="mb-0" // The CSS now handles positioning globally
                    onClose={() => setError(null)}
                    dismissible
                >
                    {error}
                </Alert>
            )}
            <div className="text-center mb-5">
                <div className="stage-label mb-3 py-2 px-5 bg-secondary bg-opacity-25 rounded-pill d-inline-block border border-secondary fw-bold text-uppercase letter-spacing-2">
                    SÂN KHẤU / STAGE
                </div>
            </div>

            <div className="seats-grid mb-4 overflow-auto py-3">
                {rows.map(rowName => (
                    <div key={rowName} className="d-flex align-items-center justify-content-center mb-2 flex-nowrap min-w-max">
                        <div className="fw-bold me-3 text-muted" style={{ width: '20px' }}>{rowName}</div>
                        <div className="d-flex gap-2">
                            {rowsData[rowName].map(seat => {
                                const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);
                                const isBooked = seat.status === 'BOOKED' || seat.status === 'RESERVED';

                                return (
                                    <OverlayTrigger
                                        key={seat.seat_id}
                                        placement="top"
                                        overlay={<Tooltip id={`seat-tooltip-${seat.seat_id}`}>Ghế {seat.seat_label} - {formatPrice(ticketType.price)}</Tooltip>}
                                    ><div
                                        className={`seat-item cursor-pointer transition-all rounded-1 d-flex align-items-center justify-content-center
                                                ${isSelected ? 'bg-success text-white' :
                                                isBooked ? 'bg-secondary bg-opacity-25 text-muted cursor-not-allowed' :
                                                    'bg-light text-dark hover-scale'}`}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            fontSize: '10px',
                                            border: isSelected ? '2px solid #fff' : 'none'
                                        }}
                                        onClick={() => toggleSeat(seat)}
                                    >
                                            {isBooked ? <FaChair size={12} className="opacity-50" /> : seat.seat_number}
                                        </div>
                                    </OverlayTrigger>
                                );
                            })}
                        </div>
                        <div className="fw-bold ms-3 text-muted" style={{ width: '20px' }}>{rowName}</div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <hr className="bg-secondary" />
            <div className="d-flex justify-content-center gap-4 py-2 small fw-bold">
                <div className="d-flex align-items-center"><span className="bg-light d-inline-block rounded-1 me-2" style={{ width: '15px', height: '15px' }}></span> Trống</div>
                <div className="d-flex align-items-center"><span className="bg-success d-inline-block rounded-1 me-2" style={{ width: '15px', height: '15px' }}></span> Đang chọn</div>
                <div className="d-flex align-items-center"><span className="bg-secondary bg-opacity-25 d-inline-block rounded-1 me-2" style={{ width: '15px', height: '15px' }}></span> Đã bán</div>
            </div>

            <style>{`
                .min-w-max { min-width: max-content; }
                .hover-scale:hover { transform: scale(1.15); }
                .letter-spacing-2 { letter-spacing: 2px; }
            `}</style>
        </div>
    );
};

const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default SeatMap;
