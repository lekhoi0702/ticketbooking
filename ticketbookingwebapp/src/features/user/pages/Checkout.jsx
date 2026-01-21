import React, { useEffect } from 'react';
import { Container, Row, Col, Form, Alert, Spinner, ProgressBar, Badge } from 'react-bootstrap';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';

// Hooks
import { useCheckout } from '@shared/hooks/useCheckout';

// Components
import CustomerInfoForm from '@features/user/components/Checkout/CustomerInfoForm';
import PaymentMethodSelector from '@features/user/components/Checkout/PaymentMethodSelector';
import OrderSummary from '@features/user/components/Checkout/OrderSummary';
import LoadingSpinner from '@shared/components/LoadingSpinner';

// Constants
const SEAT_HOLD_TIMEOUT_SECONDS = 30 * 60; // 30 minutes
const WARNING_THRESHOLD_SECONDS = 5 * 60; // 5 minutes

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
        discountMsg,
        // Seat timer states
        seatTimers,
        showTimeWarning,
        seatsExpired,
        getMinRemainingTime,
        formatTime
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
                        <a href="/" className="text-decoration-none" style={{ color: '#2DC275' }}>Trang chủ</a>
                    </li>
                    <li className="breadcrumb-item">
                        <a href={`/event/${event?.event_id}`} className="text-decoration-none" style={{ color: '#2DC275' }}>
                            {event?.event_name || 'Sự kiện'}
                        </a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page" style={{ color: 'rgb(42, 45, 52)' }}>
                        Thanh toán
                    </li>
                </ol>
            </nav>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            {/* Seat Hold Timer Warning */}
            {Object.keys(seatTimers).length > 0 && getMinRemainingTime() > 0 && (
                <Alert 
                    variant={showTimeWarning ? 'danger' : 'info'} 
                    className="d-flex align-items-center justify-content-between"
                >
                    <div className="d-flex align-items-center">
                        {showTimeWarning ? (
                            <FaExclamationTriangle className="me-2" size={20} />
                        ) : (
                            <FaClock className="me-2" size={20} />
                        )}
                        <div>
                            <strong>Thời gian giữ ghế: {formatTime(getMinRemainingTime())}</strong>
                            {showTimeWarning && (
                                <div className="small mt-1">
                                    Sắp hết thời gian! Vui lòng hoàn tất thanh toán ngay.
                                </div>
                            )}
                        </div>
                    </div>
                    <ProgressBar 
                        now={(getMinRemainingTime() / SEAT_HOLD_TIMEOUT_SECONDS) * 100}
                        variant={showTimeWarning ? 'danger' : getMinRemainingTime() <= WARNING_THRESHOLD_SECONDS * 2 ? 'warning' : 'success'}
                        style={{ width: '150px', height: '8px' }}
                        className="ms-3"
                    />
                </Alert>
            )}

            {/* Seats Expired Warning */}
            {seatsExpired && (
                <Alert variant="warning" className="d-flex align-items-center justify-content-between">
                    <div>
                        <FaExclamationTriangle className="me-2" />
                        <strong>Một số ghế đã hết thời gian giữ!</strong>
                        <div className="small mt-1">Vui lòng quay lại trang sự kiện để chọn ghế mới.</div>
                    </div>
                    <button 
                        type="button"
                        className="btn btn-warning btn-sm"
                        onClick={() => navigate(`/event/${event?.event_id}`)}
                    >
                        Chọn lại ghế
                    </button>
                </Alert>
            )}

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
