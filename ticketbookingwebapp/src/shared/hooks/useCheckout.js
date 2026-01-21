import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import { io } from 'socket.io-client';

// Configuration: Must match backend
const SEAT_HOLD_TIMEOUT_SECONDS = 30 * 60; // 30 minutes
const WARNING_THRESHOLD_SECONDS = 5 * 60; // 5 minutes

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
    const initialSeatTimers = location.state?.seatTimers || {};

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

    // Seat timer states
    const [seatTimers, setSeatTimers] = useState(initialSeatTimers);
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    const [seatsExpired, setSeatsExpired] = useState(false);
    const timerIntervalRef = useRef(null);
    const socketRef = useRef(null);

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

    // Format seconds to mm:ss
    const formatTime = (seconds) => {
        if (seconds <= 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get minimum remaining time
    const getMinRemainingTime = useCallback(() => {
        const times = Object.values(seatTimers).filter(t => t > 0);
        return times.length > 0 ? Math.min(...times) : 0;
    }, [seatTimers]);

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

    // Socket connection to maintain seat locks during checkout
    useEffect(() => {
        if (!eventId) return;

        // Check if we have any seats to maintain
        const allSeats = Object.values(selectedSeats).flat();
        if (allSeats.length === 0) return;

        const newSocket = io(window.location.origin, {
            path: '/socket.io',
            transports: ['polling'],
            timeout: 20000,
            forceNew: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            upgrade: true
        });
        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('Checkout socket connected:', newSocket.id);
            newSocket.emit('join_event', { event_id: parseInt(eventId) });
            // Request current timers for our seats
            newSocket.emit('get_seat_timer', { event_id: parseInt(eventId) });
        });

        // Handle seat expiration
        newSocket.on('seat_expired', (data) => {
            console.log('Seat expired during checkout:', data);
            // Remove expired seat from selection
            setSelectedSeats(prev => {
                const updated = {};
                for (const [ttId, seats] of Object.entries(prev)) {
                    updated[ttId] = seats.filter(s => s.seat_id !== data.seat_id);
                }
                return updated;
            });
            setSeatTimers(prev => {
                const updated = { ...prev };
                delete updated[data.seat_id];
                return updated;
            });
            setSeatsExpired(true);
            setError('Một số ghế đã hết thời gian giữ (30 phút). Vui lòng quay lại chọn ghế.');
        });

        // Receive timer sync
        newSocket.on('seat_timers', (data) => {
            console.log('Received seat timers:', data);
            const timers = {};
            data.seats.forEach(seat => {
                timers[seat.seat_id] = seat.remaining_seconds;
            });
            setSeatTimers(timers);
        });

        return () => {
            if (newSocket && newSocket.connected) {
                newSocket.emit('leave_event', { event_id: parseInt(eventId) });
                newSocket.disconnect();
            }
        };
    }, [eventId, selectedSeats]);

    // Countdown timer for seat holds
    useEffect(() => {
        if (Object.keys(seatTimers).length === 0) {
            setShowTimeWarning(false);
            return;
        }

        timerIntervalRef.current = setInterval(() => {
            setSeatTimers(prev => {
                const updated = {};
                let hasExpired = false;

                for (const [seatId, remaining] of Object.entries(prev)) {
                    const newRemaining = remaining - 1;
                    if (newRemaining <= 0) {
                        hasExpired = true;
                    } else {
                        updated[seatId] = newRemaining;
                    }
                }

                // Check warning threshold
                const minTime = Object.values(updated).filter(t => t > 0);
                if (minTime.length > 0 && Math.min(...minTime) <= WARNING_THRESHOLD_SECONDS) {
                    setShowTimeWarning(true);
                } else {
                    setShowTimeWarning(false);
                }

                if (hasExpired) {
                    setSeatsExpired(true);
                }

                return updated;
            });
        }, 1000);

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [Object.keys(seatTimers).length]);

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

            // Handle payment (Always VNPAY)
            const paymentResponse = await api.createVNPayPaymentUrl(orderId);
            if (paymentResponse.success) {
                window.location.href = paymentResponse.data.payment_url;
            } else {
                throw new Error('Không thể tạo link thanh toán VNPay');
            }

        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.message || 'Không thể tạo đơn hàng');
            setProcessing(false);
        }
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
        
        // Seat timer related
        seatTimers,
        showTimeWarning,
        seatsExpired,
        getMinRemainingTime,
        formatTime,

        setError,
        setCustomerInfo,
        setPaymentMethod,
        calculateTotal,
        getTotalTickets,
        handleSubmit,
        applyDiscount,
        setDiscountCode, // Expose setter if needed
        navigate
    };
};
