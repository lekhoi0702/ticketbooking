import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import { paymentApi } from '@services/api/payment';
import { orderApi } from '@services/api/order';
import { seatApi } from '@services/api/seat';
import { API_BASE_URL } from '@shared/constants';

/**
 * Custom hook for checkout page logic
 * Handles all business logic for the checkout process
 */
export const useCheckout = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    // Initial state from navigation
    const initialTickets = location.state?.selectedTickets || {};
    const initialSeats = location.state?.selectedSeats || {};
    const initialHasSeatMap = location.state?.hasSeatMap || {};

    // CRITICAL: Validate navigation IMMEDIATELY - this MUST be the first useEffect
    // Run with empty dependency array to execute only once on mount, before any other effects
    useEffect(() => {
        if (hasValidatedRef.current) return; // Only run once
        hasValidatedRef.current = true;
        
        // Check if there's valid state data from navigation
        const hasStateData = location.state && 
            (location.state.selectedTickets || location.state.selectedSeats || location.state.hasSeatMap);
        
        // Check navigation ID - compare with stored ID to verify fresh navigation
        const stateNavigationId = location.state?.navigationId;
        const storedNavigationId = sessionStorage.getItem(`checkout_nav_id_${eventId}`);
        const isFreshNavigation = stateNavigationId && stateNavigationId === storedNavigationId;
        
        // Check if there's a pending VietQR order (allow access for payment continuation)
        const hasPendingVietQROrder = sessionStorage.getItem(`vietqr_order_created_${eventId}`) === 'true' &&
            sessionStorage.getItem(`vietqr_qr_${eventId}`);
        
        // Check if user has left checkout before (prevent forward button access)
        const hasLeftCheckout = sessionStorage.getItem(`checkout_left_${eventId}`) === 'true';
        
        // Debug logging
        if (import.meta.env.DEV) {
            console.log('Checkout validation (FIRST useEffect):', {
                hasStateData,
                stateNavigationId,
                storedNavigationId,
                isFreshNavigation: stateNavigationId === storedNavigationId,
                hasLeftCheckout,
                hasPendingVietQROrder,
                pathname: location.pathname
            });
        }
        
        // SIMPLIFIED LOGIC: If user has left checkout, block ALL access unless:
        // 1. Navigation ID matches (fresh navigation), OR
        // 2. There's a pending VietQR order (payment continuation)
        if (hasLeftCheckout && !hasPendingVietQROrder) {
            // Only allow if navigation ID matches (fresh navigation from event page)
            if (!isFreshNavigation) {
                if (import.meta.env.DEV) {
                    console.log('🚫 BLOCKING - User left checkout and navigation ID does not match. Redirecting to event page.');
                    console.log('  State navigationId:', stateNavigationId);
                    console.log('  Stored navigationId:', storedNavigationId);
                    console.log('  Match:', stateNavigationId === storedNavigationId);
                }
                // Replace current entry (checkout) with event page to prevent forward
                navigate(`/event/${eventId}`, { replace: true });
                return;
            } else {
                // Fresh navigation detected - clear the flag
                if (import.meta.env.DEV) {
                    console.log('✅ Allowing - Fresh navigation detected, clearing checkout_left flag');
                }
                sessionStorage.removeItem(`checkout_left_${eventId}`);
            }
        }
        
        // If no valid navigation state and no pending VietQR order, redirect to event page
        if (!hasStateData && !hasPendingVietQROrder) {
            if (import.meta.env.DEV) {
                console.log('🚫 BLOCKING - No valid state and no pending VietQR order. Redirecting to event page.');
            }
            navigate(`/event/${eventId}`, { replace: true });
            return;
        }
        
        // If we have state and it's fresh navigation, clear the flag
        if (hasStateData && isFreshNavigation && !hasLeftCheckout) {
            if (import.meta.env.DEV) {
                console.log('✅ Allowing - Fresh navigation without checkout_left flag');
            }
            // Flag already cleared or never set, which is fine
        }
    // Empty dependency array - run ONLY once on mount, before any other effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            // Save current path and state to redirect back after login
            navigate('/login', {
                state: {
                    from: {
                        pathname: location.pathname,
                        state: location.state
                    }
                },
                replace: true
            });
        }
    }, [isAuthenticated, navigate, location.pathname, location.state]);

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Event data
    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);

    // Selection states
    const [selectedTickets, setSelectedTickets] = useState(initialTickets);
    const [selectedSeats, setSelectedSeats] = useState(initialSeats);
    const [hasSeatMap, setHasSeatMap] = useState(initialHasSeatMap);

    // Discount states
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountMsg, setDiscountMsg] = useState('');
    const [isValidDiscount, setIsValidDiscount] = useState(false);

    // Customer info
    const [customerInfo, setCustomerInfo] = useState({
        name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');
    
    // VietQR state
    const [qrData, setQrData] = useState(null);
    const [orderCreated, setOrderCreated] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState(null); // Track current order ID
    const isInitialMountRef = useRef(true); // Track if this is the initial mount
    const previousPaymentMethodRef = useRef(paymentMethod); // Track previous payment method
    const hasValidatedRef = useRef(false); // Track if validation has run

    // Update customer info when user changes
    useEffect(() => {
        if (user) {
            setCustomerInfo({
                name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    // Clear QR data and reset orderCreated when payment method changes to non-VietQR
    // Only reset if user actually changed the payment method (not on initial mount/restore)
    useEffect(() => {
        // Skip on initial mount to avoid resetting during restore
        if (isInitialMountRef.current) {
            previousPaymentMethodRef.current = paymentMethod;
            return;
        }

        // Only reset if payment method actually changed from VIETQR to something else
        if (previousPaymentMethodRef.current === 'VIETQR' && paymentMethod !== 'VIETQR') {
            if (qrData) {
                setQrData(null);
            }
            // Reset orderCreated if switching away from VietQR to allow new order creation
            if (orderCreated) {
                setOrderCreated(false);
                // Clear sessionStorage for VietQR data
                sessionStorage.removeItem(`vietqr_qr_${eventId}`);
                sessionStorage.removeItem(`vietqr_order_created_${eventId}`);
                sessionStorage.removeItem(`vietqr_payment_method_${eventId}`);
            }
        }
        
        // Update previous payment method
        previousPaymentMethodRef.current = paymentMethod;
    }, [paymentMethod, orderCreated, eventId, qrData]);


    // Define fetchEventData as a useCallback to prevent unnecessary re-creation
    const fetchEventData = useCallback(async () => {
        try {
            setLoading(true);
            const [eventRes, ticketTypesRes] = await Promise.all([
                api.getEvent(eventId),
                api.getTicketTypes(eventId)
            ]);

            if (eventRes.success) {
                setEvent(eventRes.data);
            }
            if (ticketTypesRes.success) {
                const types = ticketTypesRes.data.filter(tt => tt.is_active);
                setTicketTypes(types);
            }
        } catch (err) {
            console.error('Error fetching event data:', err);
            setError('Không thể tải thông tin sự kiện');
        } finally {
            setLoading(false);
        }
    }, [eventId]); // Depend on eventId

    // Fetch event data on mount
    useEffect(() => {
        fetchEventData();
    }, [fetchEventData]);

    // Restore QR data and payment method from sessionStorage on mount (for page refresh)
    useEffect(() => {
        if (isInitialMountRef.current) {
            const storedQrData = sessionStorage.getItem(`vietqr_qr_${eventId}`);
            const storedOrderCreated = sessionStorage.getItem(`vietqr_order_created_${eventId}`);
            const storedPaymentMethod = sessionStorage.getItem(`vietqr_payment_method_${eventId}`);
            const storedOrderId = sessionStorage.getItem(`vietqr_order_id_${eventId}`);
            const storedCheckoutOrderId = sessionStorage.getItem(`checkout_order_id_${eventId}`);
            const storedCheckoutPaymentMethod = sessionStorage.getItem(`checkout_payment_method_${eventId}`);
            
            // Restore VietQR order if exists
            if (storedQrData && storedOrderCreated === 'true') {
                try {
                    const parsedQrData = JSON.parse(storedQrData);
                    // Verify the order is still valid (not paid yet)
                    if (parsedQrData.payment_code) {
                        // Only restore if payment method was VIETQR
                        if (storedPaymentMethod === 'VIETQR') {
                            setQrData(parsedQrData);
                            setOrderCreated(true);
                            setPaymentMethod('VIETQR');
                            previousPaymentMethodRef.current = 'VIETQR';
                            if (storedOrderId) {
                                setCurrentOrderId(parseInt(storedOrderId));
                            }
                        } else {
                            // Clear invalid QR data if payment method doesn't match
                            sessionStorage.removeItem(`vietqr_qr_${eventId}`);
                            sessionStorage.removeItem(`vietqr_order_created_${eventId}`);
                            sessionStorage.removeItem(`vietqr_payment_method_${eventId}`);
                            sessionStorage.removeItem(`vietqr_order_id_${eventId}`);
                        }
                    }
                } catch (e) {
                    console.error('Error restoring QR data:', e);
                }
            }
            
            // Restore checkout order ID for other payment methods
            if (storedCheckoutOrderId && storedCheckoutPaymentMethod && storedCheckoutPaymentMethod !== 'VIETQR') {
                setCurrentOrderId(parseInt(storedCheckoutOrderId));
                setOrderCreated(true);
                setPaymentMethod(storedCheckoutPaymentMethod);
            }
            
            // Mark initial mount as complete after restore attempt
            isInitialMountRef.current = false;
        }
    }, [eventId]); // Run when eventId changes

    // Handle browser back button - clear navigation ID immediately when back is pressed
    useEffect(() => {
        const handlePopState = (e) => {
            // When user presses back button, immediately clear navigation ID
            // This ensures forward navigation will fail validation
            if (window.location.pathname.includes('/checkout/')) {
                // User is still on checkout page (shouldn't happen, but just in case)
                return;
            } else {
                // User pressed back from checkout - clear navigation ID immediately
                sessionStorage.removeItem(`checkout_nav_id_${eventId}`);
                sessionStorage.setItem(`checkout_left_${eventId}`, 'true');
                if (import.meta.env.DEV) {
                    console.log('Back button pressed - cleared navigation ID and set checkout_left flag');
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [eventId]);

    // Release seats when user leaves checkout page (component unmount or navigation)
    useEffect(() => {
        // Cleanup function - unlock seats when component unmounts
        return () => {
            // Mark that user has left checkout page (prevent forward button access)
            // Set this flag BEFORE any async operations to ensure it's set immediately
            sessionStorage.setItem(`checkout_left_${eventId}`, 'true');
            
            // CRITICAL: Remove navigation ID from sessionStorage when leaving checkout
            // This ensures forward navigation will have mismatched IDs
            sessionStorage.removeItem(`checkout_nav_id_${eventId}`);
            
            // Unlock all seats when leaving checkout page if payment hasn't been completed
            // Check if payment was successful by checking if we're redirecting to success page
            const isPaymentSuccess = window.location.pathname.includes('/order-success');
            const isRedirectingToPayment = window.location.pathname.includes('/payment/');
            
            if (!isPaymentSuccess && !isRedirectingToPayment && user) {
                // Unlock all seats for this user in this event
                const unlockSeatsAsync = async () => {
                    try {
                        await seatApi.unlockAllSeats(user.user_id, eventId);
                        // Clear seat reservations from localStorage
                        const storageKey = `seat_reservations_${eventId}_${user.user_id}`;
                        localStorage.removeItem(storageKey);
                        console.log('Unlocked all seats on checkout exit');
                    } catch (error) {
                        console.error('Error unlocking seats on component unmount:', error);
                    }
                };
                
                // Try to unlock synchronously if possible, otherwise async
                unlockSeatsAsync();
            }
        };
    }, [eventId, user]);

    // Also handle beforeunload for browser navigation (back button, close tab, etc.)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            // Unlock all seats when page is closing if payment hasn't been completed
            if (user && eventId) {
                const isPaymentSuccess = window.location.pathname.includes('/order-success');
                const isRedirectingToPayment = window.location.pathname.includes('/payment/');
                
                if (!isPaymentSuccess && !isRedirectingToPayment) {
                    // Use fetch with keepalive for reliable delivery even if page is closing
                    fetch(`${API_BASE_URL}/seats/unlock-all`, {
                        method: 'POST',
                        keepalive: true,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: user.user_id,
                            event_id: eventId
                        })
                    }).catch(() => {
                        // Ignore errors - page might be closing
                    });
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [user, eventId]);

    const calculateTotal = () => {
        let total = 0;
        ticketTypes.forEach(tt => {
            const quantity = selectedTickets[tt.ticket_type_id] || 0;
            total += tt.price * quantity;
        });
        return Math.max(0, total - discountAmount);
    };

    const getTotalTickets = () => {
        return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    };

    const applyDiscount = async (code) => {
        if (!code) return;
        try {
            setProcessing(true);
            const items = [];
            Object.keys(selectedTickets).forEach(tidStr => {
                const tid = parseInt(tidStr);
                if (selectedTickets[tid] > 0)
                    items.push({ ticket_type_id: tid, quantity: selectedTickets[tid] });
            });

            const res = await api.checkDiscount({ code, items });
            if (res.success) {
                setDiscountCode(code);
                setDiscountAmount(res.discount_amount);
                setIsValidDiscount(true);
                setDiscountMsg('Đã áp dụng mã giảm giá');
                return { success: true, message: 'Áp dụng thành công' };
            } else {
                setDiscountCode('');
                setDiscountAmount(0);
                setIsValidDiscount(false);
                setDiscountMsg(res.message);
                return { success: false, message: res.message };
            }
        } catch (error) {
            console.error("Apply Discount Error:", error);
            setDiscountCode('');
            setDiscountAmount(0);
            setIsValidDiscount(false);
            setDiscountMsg(error.message);
            return { success: false, message: error.message };
        } finally {
            setProcessing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (getTotalTickets() === 0) {
            setError('Vui lòng chọn ít nhất một vé');
            return;
        }

        if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
            setError('Vui lòng điền đầy đủ thông tin liên hệ');
            return;
        }

        try {
            setProcessing(true);
            setError(null);

            // Prepare tickets data
            const tickets = [];
            Object.keys(selectedTickets).forEach(ticketTypeIdString => {
                const tid = parseInt(ticketTypeIdString);
                const quantity = selectedTickets[tid];
                const seatsForTid = selectedSeats[tid] || [];

                if (quantity > 0) {
                    // Check if seats are required but not fully selected
                    if (hasSeatMap[tid] && seatsForTid.length < quantity) {
                        throw new Error(`Vui lòng chọn đủ ${quantity} ghế cho loại vé ${ticketTypes.find(t => t.ticket_type_id === tid)?.type_name}`);
                    }

                    tickets.push({
                        ticket_type_id: tid,
                        quantity: quantity,
                        seat_ids: seatsForTid.map(s => s.seat_id)
                    });
                }
            });

            // Create order
            const orderData = {
                user_id: user.user_id,
                customer_name: customerInfo.name,
                customer_email: customerInfo.email,
                customer_phone: customerInfo.phone,
                tickets: tickets,
                discount_code: isValidDiscount ? discountCode : null
            };

            const orderResponse = await api.createOrder(orderData);

            if (!orderResponse.success) {
                throw new Error(orderResponse.message);
            }

            const orderId = orderResponse.data.order.order_id;
            setCurrentOrderId(orderId); // Save order ID for potential seat release
            setOrderCreated(true); // Mark order as created for all payment methods
            
            // Save order ID to sessionStorage for all payment methods
            sessionStorage.setItem(`checkout_order_id_${eventId}`, orderId.toString());
            sessionStorage.setItem(`checkout_payment_method_${eventId}`, paymentMethod);

            // Handle payment based on selected method
            if (paymentMethod === 'PAYPAL') {
                const paymentResponse = await paymentApi.createPayPalOrder(orderId);
                if (paymentResponse.success) {
                    // Don't clear order ID here - let cleanup handle it when redirecting
                    window.location.href = paymentResponse.data.payment_url;
                } else {
                    throw new Error('Không thể tạo link thanh toán PayPal');
                }
            } else if (paymentMethod === 'VIETQR') {
                const paymentResponse = await paymentApi.createVietQR(orderId);
                if (paymentResponse.success) {
                    // Set QR data to display on checkout page
                    setQrData(paymentResponse.data);
                    
                    // Save QR data and payment method to sessionStorage so it persists after page refresh
                    sessionStorage.setItem(`vietqr_qr_${eventId}`, JSON.stringify(paymentResponse.data));
                    sessionStorage.setItem(`vietqr_order_created_${eventId}`, 'true');
                    sessionStorage.setItem(`vietqr_payment_method_${eventId}`, 'VIETQR');
                    sessionStorage.setItem(`vietqr_order_id_${eventId}`, orderId.toString());
                    
                    setProcessing(false);
                    // Scroll to QR section (center in viewport so sticky header does not overlap)
                    setTimeout(() => {
                        const qrElement = document.getElementById('vietqr-display');
                        if (qrElement) {
                            qrElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 150);
                } else {
                    throw new Error('Không thể tạo mã QR thanh toán VietQR');
                }
            } else {
                // Default to VNPay
                const paymentResponse = await api.createVNPayPaymentUrl(orderId);
                if (paymentResponse.success) {
                    // Don't clear order ID here - let cleanup handle it when redirecting
                    window.location.href = paymentResponse.data.payment_url;
                } else {
                    throw new Error('Không thể tạo link thanh toán VNPay');
                }
            }

        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.message || 'Không thể tạo đơn hàng');
            setProcessing(false);
        }
    };

    const handlePaymentSuccess = (orderCode) => {
        // Clear stored QR data and payment method when payment succeeds
        sessionStorage.removeItem(`vietqr_qr_${eventId}`);
        sessionStorage.removeItem(`vietqr_order_created_${eventId}`);
        sessionStorage.removeItem(`vietqr_payment_method_${eventId}`);
        sessionStorage.removeItem(`vietqr_order_id_${eventId}`);
        sessionStorage.removeItem(`checkout_order_id_${eventId}`);
        sessionStorage.removeItem(`checkout_payment_method_${eventId}`);
        sessionStorage.removeItem(`checkout_left_${eventId}`); // Clear left flag on success
        
        // Clear order ID so seats won't be released
        setCurrentOrderId(null);
        
        // Redirect to success page
        navigate(`/order-success/${orderCode}`);
    };

    return {
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
        user,
        discountCode,
        discountAmount,
        isValidDiscount,
        discountMsg,
        qrData,
        orderCreated,

        setError,
        setCustomerInfo,
        setPaymentMethod,
        calculateTotal,
        getTotalTickets,
        handleSubmit,
        applyDiscount,
        setDiscountCode, // Expose setter if needed
        handlePaymentSuccess,
        navigate
    };
};
