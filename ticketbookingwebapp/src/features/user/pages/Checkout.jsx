import React, { useEffect } from 'react';
import { Container, Row, Col, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useCheckout } from '@shared/hooks/useCheckout';

// Components
import CustomerInfoForm from '@features/user/components/Checkout/CustomerInfoForm';
import PaymentMethodSelector from '@features/user/components/Checkout/PaymentMethodSelector';
import OrderSummary from '@features/user/components/Checkout/OrderSummary';
import CountdownTimer from '@features/user/components/Checkout/CountdownTimer';
import LoadingSpinner from '@shared/components/LoadingSpinner';


/**
 * Checkout Page Component
 * Refactored to be cleaner and more maintainable
 */
const Checkout = () => {
    const navigate = useNavigate();
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
        qrData,
        orderCreated,
        setError,
        setCustomerInfo,
        setPaymentMethod,
        calculateTotal,
        getTotalTickets,
        handleSubmit,
        applyDiscount,
        discountAmount,
        isValidDiscount,
        discountMsg,
        handlePaymentSuccess
    } = useCheckout();

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (loading) {
        return <LoadingSpinner fullScreen tip="Đang chuẩn bị đơn hàng..." />;
    }

    return (
        <Container className="pt-3 pb-5" style={{ minHeight: '100vh' }}>
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-3 mt-2">
                <ol className="breadcrumb" style={{
                    background: 'transparent',
                    padding: '0.5rem 0',
                    margin: 0
                }}>
                    <li className="breadcrumb-item">
                        <a 
                            href="/" 
                            className="text-decoration-none" 
                            style={{ color: '#2DC275' }}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/');
                            }}
                        >
                            Trang chủ
                        </a>
                    </li>
                    <li className="breadcrumb-item">
                        <a 
                            href={`/event/${event?.event_id}`} 
                            className="text-decoration-none" 
                            style={{ color: '#2DC275' }}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/event/${event?.event_id}`);
                            }}
                        >
                            {event?.event_name || 'Sự kiện'}
                        </a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page" style={{ color: 'rgb(42, 45, 52)' }}>
                        Thanh toán
                    </li>
                </ol>
            </nav>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Countdown Timer - Show when user has selected seats */}
            {(() => {
                const hasSelectedSeats = Object.values(selectedSeats).some(seats => seats && seats.length > 0);
                return (
                    <CountdownTimer 
                        hasSelectedSeats={hasSelectedSeats}
                        eventId={event?.event_id}
                        onExpired={() => {
                            setError('Thời gian giữ ghế đã hết. Vui lòng quay lại trang sự kiện để chọn lại ghế.');
                        }}
                    />
                );
            })()}

            <Form onSubmit={handleSubmit}>
                <Row className="align-items-stretch">
                    <Col lg={8} className="d-flex flex-column">
                        {/* Customer Information */}
                        <CustomerInfoForm
                            customerInfo={customerInfo}
                            setCustomerInfo={setCustomerInfo}
                        />

                        {/* Payment Method */}
                        <PaymentMethodSelector 
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                        />
                    </Col>

                    <Col lg={4} className="d-flex">
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
                            readonly={orderCreated && paymentMethod === 'VIETQR'}
                            qrData={orderCreated && paymentMethod === 'VIETQR' ? qrData : null}
                            onPaymentSuccess={handlePaymentSuccess}
                        />
                    </Col>
                </Row>
            </Form>

            <style>{`
                .payment-check-item { cursor: pointer; transition: all 0.2s; }
                .payment-check-item:hover { border-color: #0d6efd !important; background-color: #f8f9fa; }
                .letter-spacing-1 { letter-spacing: 1px; }
                /* Fix white text on white background - scoped to container only */
                .container h2, 
                .container h3, 
                .container h4, 
                .container h5, 
                .container h6, 
                .container p, 
                .container span:not(.navbar *), 
                .container label, 
                .container .card div {
                    color: rgb(42, 45, 52) !important;
                }
                .container .text-muted {
                    color: #6c757d !important;
                }
            `}</style>
        </Container>
    );
};

export default Checkout;
