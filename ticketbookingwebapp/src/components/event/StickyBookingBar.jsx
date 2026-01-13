import React from 'react';
import { Container, Button } from 'react-bootstrap';

const StickyBookingBar = ({ totalTickets, calculateTotal, onCheckout }) => {
    if (totalTickets === 0) return null;

    return (
        <div className="sticky-booking-bar">
            <Container>
                <div className="bar-content">
                    <div className="selection-summary">
                        <div className="summary-tickets">{totalTickets} vé đã chọn</div>
                        <div className="summary-total">Tổng: <span>{calculateTotal().toLocaleString('vi-VN')}đ</span></div>
                    </div>
                    <Button
                        variant="success"
                        size="lg"
                        className="checkout-btn"
                        onClick={onCheckout}
                    >
                        Tiếp tục
                    </Button>
                </div>
            </Container>
        </div>
    );
};

export default StickyBookingBar;
