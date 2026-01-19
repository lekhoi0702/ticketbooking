import React from 'react';
import { Container, Button } from 'react-bootstrap';

const StickyBookingBar = ({ totalTickets, calculateTotal, onCheckout }) => {
    // Only show the bar when user has selected at least one ticket
    if (totalTickets === 0) {
        return null;
    }

    return (
        <div className="sticky-booking-bar shadow-lg">
            <Container>
                <div className="bar-content d-flex justify-content-between align-items-center">
                    <div className="selection-summary">
                        <div className="summary-tickets fw-bold">
                            {`${totalTickets} vé đã chọn`}
                        </div>
                        <div className="summary-total">Tổng cộng: <span>{calculateTotal().toLocaleString('vi-VN')}đ</span></div>
                    </div>
                    <Button
                        variant="success"
                        size="lg"
                        className="checkout-btn px-5 py-2 fw-bold"
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
