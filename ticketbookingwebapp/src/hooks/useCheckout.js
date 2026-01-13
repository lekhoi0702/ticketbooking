import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

/**
 * Custom hook for checkout page logic
 * Handles all business logic for the checkout process
 */
export const useCheckout = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Initial state from navigation
    const initialTickets = location.state?.selectedTickets || {};
    const initialSeats = location.state?.selectedSeats || {};
    const initialHasSeatMap = location.state?.hasSeatMap || {};

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

    // Customer info
    const [customerInfo, setCustomerInfo] = useState({
        name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    // Payment method
    const [paymentMethod, setPaymentMethod] = useState('VNPAY');

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

    // Fetch event data on mount
    useEffect(() => {
        fetchEventData();
    }, [eventId]);

    const fetchEventData = async () => {
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
    };

    const calculateTotal = () => {
        let total = 0;
        ticketTypes.forEach(tt => {
            const quantity = selectedTickets[tt.ticket_type_id] || 0;
            total += tt.price * quantity;
        });
        return total;
    };

    const getTotalTickets = () => {
        return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
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
                tickets: tickets
            };

            const orderResponse = await api.createOrder(orderData);

            if (!orderResponse.success) {
                throw new Error(orderResponse.message);
            }

            const orderId = orderResponse.data.order.order_id;

            // Handle payment based on method
            if (paymentMethod === 'VNPAY') {
                const paymentResponse = await api.createVNPayPaymentUrl(orderId);
                if (paymentResponse.success) {
                    window.location.href = paymentResponse.data.payment_url;
                } else {
                    throw new Error('Không thể tạo link thanh toán VNPay');
                }
            } else if (paymentMethod === 'CASH') {
                await api.createPayment({
                    order_id: orderId,
                    payment_method: 'CASH'
                });
                navigate(`/order-success/${orderResponse.data.order.order_code}`);
            }

        } catch (err) {
            console.error('Error creating order:', err);
            setError(err.message || 'Không thể tạo đơn hàng');
            setProcessing(false);
        }
    };

    return {
        // States
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

        // Setters
        setError,
        setCustomerInfo,
        setPaymentMethod,

        // Methods
        calculateTotal,
        getTotalTickets,
        handleSubmit,
        navigate
    };
};
