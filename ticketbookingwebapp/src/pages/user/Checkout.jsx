import React from 'react';
import { Container, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';
import { FaShoppingCart } from 'react-icons/fa';

// Hooks
import { useCheckout } from '../../hooks/useCheckout';

// Components
import SelectedTicketsReview from '../../components/Customer/Checkout/SelectedTicketsReview';
import CustomerInfoForm from '../../components/Customer/Checkout/CustomerInfoForm';
import PaymentMethodSelector from '../../components/Customer/Checkout/PaymentMethodSelector';
import OrderSummary from '../../components/Customer/Checkout/OrderSummary';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
        navigate
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
                        {/* Selected Tickets Review */}
                        <SelectedTicketsReview
                            ticketTypes={ticketTypes}
                            selectedTickets={selectedTickets}
                            selectedSeats={selectedSeats}
                            hasSeatMap={hasSeatMap}
                            onGoBack={() => navigate(-1)}
                        />

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
