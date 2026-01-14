import React from 'react';
import { Container, Button } from 'react-bootstrap';

const StickyBookingBar = ({ totalTickets, calculateTotal, onCheckout }) => {

    return (
        <div className="sticky-booking-bar shadow-lg">
            <Container>
                <div className="bar-content d-flex justify-content-between align-items-center">
                    <div className="selection-summary">
                        <div className="summary-tickets fw-bold">
                            {totalTickets > 0 ? `${totalTickets} vé đã chọn` : 'Chưa chọn vé'}
                        </div>
                        <div className="summary-total">Tổng cộng: <span>{calculateTotal().toLocaleString('vi-VN')}đ</span></div>
                    </div>
                    <Button
                        variant="success"
                        size="lg"
                        className="checkout-btn px-5 py-2 fw-bold"
                        onClick={onCheckout}
                        disabled={totalTickets === 0}
                    >
                        Tiếp tục
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default StickyBookingBar;
