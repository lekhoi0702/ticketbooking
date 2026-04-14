import { useState, useEffect } from 'react';
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

                if (eventData.ticket_types && typeof eventData.ticket_types === 'object' && !Array.isArray(eventData.ticket_types)) {
                    eventData.ticket_types = Object.values(eventData.ticket_types);
                }

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
        const qty = Math.max(0, parseInt(quantity, 10) || 0);
        setSelectedTickets((prev) => ({
            ...prev,
            [ticketTypeId]: qty,
        }));

        if (selectedSeats[ticketTypeId]?.length > qty) {
            setSelectedSeats((prev) => ({
                ...prev,
                [ticketTypeId]: prev[ticketTypeId].slice(0, qty),
            }));
        }
    };

    const handleSeatSelection = (ticketTypeId, seats) => {
        setSelectedSeats((prev) => ({
            ...prev,
            [ticketTypeId]: seats,
        }));

        setSelectedTickets((prev) => ({
            ...prev,
            [ticketTypeId]: seats.length,
        }));
    };

    const calculateTotal = () => {
        if (!event || !event.ticket_types) return 0;
        return event.ticket_types.reduce((total, tt) => {
            const qty = selectedTickets[tt.ticket_type_id] || 0;
            return total + tt.price * qty;
        }, 0);
    };

    const totalTickets = Object.values(selectedTickets).reduce((a, b) => a + b, 0);

    const validateSelection = () => {
        for (const tid in selectedTickets) {
            if (selectedTickets[tid] <= 0) continue;
            const ticketTypeName = event.ticket_types.find((t) => t.ticket_type_id === parseInt(tid, 10))?.type_name;

            if (hasSeatMap[tid] !== true) {
                return {
                    valid: false,
                    message: `Loai ve ${ticketTypeName} chua co so do ghe. Vui long lien he organizer.`,
                };
            }

            if ((selectedSeats[tid]?.length || 0) < selectedTickets[tid]) {
                return {
                    valid: false,
                    message: `Vui long chon du ghe cho loai ve ${ticketTypeName}`,
                };
            }
        }
        return { valid: true };
    };

    return {
        event,
        loading,
        selectedTickets,
        selectedSeats,
        hasSeatMap,
        activeTicketType,
        totalTickets,
        setActiveTicketType,
        setHasSeatMap,
        handleTicketQuantityChange,
        handleSeatSelection,
        calculateTotal,
        validateSelection,
    };
};
