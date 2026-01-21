import { useState, useEffect, useCallback } from 'react';
import { api } from '@services/api';

/**
 * Custom hook for event detail page logic
 */
export const useEventDetail = (eventId) => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTickets, setSelectedTickets] = useState({}); // { ticketTypeId: quantity }
    const [selectedSeats, setSelectedSeats] = useState({}); // { ticketTypeId: [seatObj, ...] }
    const [hasSeatMap, setHasSeatMap] = useState({}); // { ticketTypeId: boolean }
    const [activeTicketType, setActiveTicketType] = useState(null);
    const [seatTimers, setSeatTimers] = useState({}); // { seatId: remainingSeconds }

    useEffect(() => {
        window.scrollTo(0, 0);
        loadEvent();
    }, [eventId]);

    const loadEvent = async () => {
        if (!eventId) return;
        try {
            setLoading(true);
            const response = await api.getEvent(eventId);
            if (response.success) {
                const eventData = response.data;

                // Fix: Convert ticket_types to array if it's an object
                if (eventData.ticket_types && typeof eventData.ticket_types === 'object' && !Array.isArray(eventData.ticket_types)) {
                    console.log('Converting ticket_types object to array');
                    eventData.ticket_types = Object.values(eventData.ticket_types);
                }

                console.log('Event data after conversion:', eventData);
                console.log('Ticket types is array?', Array.isArray(eventData.ticket_types));

                setEvent(eventData);
                if (eventData.ticket_types?.length > 0) {
                    setActiveTicketType(eventData.ticket_types[0]);
                }
            }
        } catch (error) {
            console.error('Error loading event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketQuantityChange = (ticketTypeId, quantity) => {
        const qty = Math.max(0, parseInt(quantity) || 0);
        setSelectedTickets(prev => ({
            ...prev,
            [ticketTypeId]: qty
        }));

        // Clear seats if quantity decreases
        if (selectedSeats[ticketTypeId]?.length > qty) {
            setSelectedSeats(prev => ({
                ...prev,
                [ticketTypeId]: prev[ticketTypeId].slice(0, qty)
            }));
        }
    };

    const handleSeatSelection = (ticketTypeId, seats) => {
        setSelectedSeats(prev => ({
            ...prev,
            [ticketTypeId]: seats
        }));

        // Sync quantity with seats selected
        setSelectedTickets(prev => ({
            ...prev,
            [ticketTypeId]: seats.length
        }));
    };

    const calculateTotal = () => {
        if (!event || !event.ticket_types) return 0;
        return event.ticket_types.reduce((total, tt) => {
            const qty = selectedTickets[tt.ticket_type_id] || 0;
            return total + (tt.price * qty);
        }, 0);
    };

    const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

    const validateSelection = () => {
        for (const tid in selectedTickets) {
            if (selectedTickets[tid] > 0 && hasSeatMap[tid] && (selectedSeats[tid]?.length || 0) < selectedTickets[tid]) {
                return {
                    valid: false,
                    message: `Vui lòng chọn đủ ghế cho loại vé ${event.ticket_types.find(t => t.ticket_type_id === parseInt(tid))?.type_name}`
                };
            }
        }
        return { valid: true };
    };

    // Handle seat timer updates from SeatMap component
    const handleSeatTimerUpdate = useCallback((timers) => {
        setSeatTimers(timers);
    }, []);

    return {
        event,
        loading,
        selectedTickets,
        selectedSeats,
        hasSeatMap,
        activeTicketType,
        totalTickets,
        seatTimers,
        setActiveTicketType,
        setHasSeatMap,
        handleTicketQuantityChange,
        handleSeatSelection,
        handleSeatTimerUpdate,
        calculateTotal,
        validateSelection
    };
};
