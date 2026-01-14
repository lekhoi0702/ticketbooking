import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaTh } from 'react-icons/fa';

/**
 * Professional SeatGridInitializer for Fallback scenarios
 */
const SeatGridInitializer = ({ initData, setInitData, handleInitializeSeats }) => {
    return (
        <div className="text-center py-5 bg-dark bg-opacity-25 rounded-5 border border-secondary border-opacity-10 border-dashed">
            <div className="stat-icon-wrapper bg-secondary bg-opacity-10 mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                <FaTh size={32} className="text-muted" />
            </div>
            <h4 className="text-white fw-bold">Khởi tạo lưới ghế tự do</h4>
            <p className="text-muted small mb-4">Dùng khi khu vực không có sơ đồ mẫu từ Admin</p>

            <div className="d-flex justify-content-center gap-3 mt-4 mx-auto" style={{ maxWidth: '400px' }}>
                <div className="w-100">
                    <label className="organizer-form-label d-block text-start">Số hàng</label>
                    <Form.Control
                        type="number"
                        placeholder="VD: 10"
                        className="organizer-form-control"
                        value={initData.rows || ''}
                        onChange={e => setInitData({ ...initData, rows: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    />
                </div>
                <div className="w-100">
                    <label className="organizer-form-label d-block text-start">Ghế mỗi hàng</label>
                    <Form.Control
                        type="number"
                        placeholder="VD: 15"
                        className="organizer-form-control"
                        value={initData.seats_per_row || ''}
                        onChange={e => setInitData({ ...initData, seats_per_row: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    />
                </div>
            </div>

            <Button
                className="organizer-btn-primary mt-5 px-5"
                onClick={handleInitializeSeats}
            >
                TẠO LƯỚI MẶC ĐỊNH
            </Button>
        </div>
    );
};

export default SeatGridInitializer;
