import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaTh } from 'react-icons/fa';

const SeatGridInitializer = ({ initData, setInitData, handleInitializeSeats }) => {
    return (
        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
            <FaTh size={48} className="text-muted opacity-50 mb-3" />
            <h4>Tạo sơ đồ nhanh</h4>
            <div className="d-flex justify-content-center gap-3 mt-4 mx-auto" style={{ maxWidth: '400px' }}>
                <Form.Control
                    type="number"
                    placeholder="Hàng"
                    value={initData.rows || ''}
                    onChange={e => setInitData({ ...initData, rows: e.target.value === '' ? '' : parseInt(e.target.value) })}
                />
                <Form.Control
                    type="number"
                    placeholder="Ghế/Hàng"
                    value={initData.seats_per_row || ''}
                    onChange={e => setInitData({ ...initData, seats_per_row: e.target.value === '' ? '' : parseInt(e.target.value) })}
                />
            </div>
            <Button
                variant="primary"
                className="mt-4 px-5 fw-bold"
                onClick={handleInitializeSeats}
            >
                Khởi Tạo Sơ Đồ
            </Button>
        </div>
    );
};

export default SeatGridInitializer;
