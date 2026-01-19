import React from 'react';
import { Container, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';

// Hooks
import { useCheckout } from '@shared/hooks/useCheckout';

// Components
import CustomerInfoForm from '@features/user/components/Checkout/CustomerInfoForm';
import PaymentMethodSelector from '@features/user/components/Checkout/PaymentMethodSelector';
import OrderSummary from '@features/user/components/Checkout/OrderSummary';
import LoadingSpinner from '@shared/components/LoadingSpinner';

/**
 * Checkout Page Component
 * Refactored to be cleaner and more maintainable
 */
const Checkout = () => {
    const {
        loading,
        processing,
        error,
        event,
        ticketTypes,
        selectedTickets,
        selectedSeats,
        hasSeatMap,
        customerInfo,
        paymentMethod,
        setError,
        setCustomerInfo,
        setPaymentMethod,
        calculateTotal,
        getTotalTickets,
        handleSubmit,
        navigate,
        applyDiscount,
        discountAmount,
        isValidDiscount,
        discountMsg
    } = useCheckout();

    if (loading) {
        return <LoadingSpinner tip="Đang chuẩn bị đơn hàng..." />;
    }

    return (
        <Container className="py-5">
            <h2 className="mb-4 fw-bold">
                <FaShoppingCart className="me-2 text-primary" />
                Hoàn tất đặt vé
            </h2>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col lg={8}>
                        {/* Customer Information */}
                        <CustomerInfoForm
                            customerInfo={customerInfo}
                            setCustomerInfo={setCustomerInfo}
                        />

                        {/* Payment Method */}
                        <PaymentMethodSelector />
                    </Col>

                    <Col lg={4}>
                        {/* Order Summary Sidebar */}
                        <OrderSummary
                            event={event}
                            ticketTypes={ticketTypes}
                            selectedTickets={selectedTickets}
                            selectedSeats={selectedSeats}
                            calculateTotal={calculateTotal}
                            getTotalTickets={getTotalTickets}
                            paymentMethod={paymentMethod}
                            processing={processing}
                            applyDiscount={applyDiscount}
                            discountAmount={discountAmount}
                            isValidDiscount={isValidDiscount}
                            discountMsg={discountMsg}
                        />
                    </Col>
                </Row>
            </Form>

            <style>{`
                .payment-check-item { cursor: pointer; transition: all 0.2s; }
                .payment-check-item:hover { border-color: #0d6efd !important; background-color: #f8f9fa; }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </Container>
    );
};

export default Checkout;
