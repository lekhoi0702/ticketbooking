import { useState, useEffect } from 'react';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';

/**
 * Custom hook to get pending refund requests count for organizer
 */
export const usePendingRefunds = () => {
    const { user } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchPendingRefunds = async () => {
        if (!user?.user_id) {
            console.log('[usePendingRefunds] No user ID, skipping fetch');
            return;
        }

        try {
            setLoading(true);
            console.log('[usePendingRefunds] Fetching pending refunds for user:', user.user_id);

            // Get all organizer's events
            const eventsRes = await api.getOrganizerEvents(user.user_id);
            console.log('[usePendingRefunds] Events response:', eventsRes);

            if (eventsRes.success && eventsRes.data.length > 0) {
                const eventIds = eventsRes.data.map(e => e.event_id);
                console.log('[usePendingRefunds] Event IDs:', eventIds);

                // Fetch orders for each event and count CANCELLATION_PENDING
                const orderPromises = eventIds.map(eventId =>
                    api.getEventOrders(eventId).catch(() => ({ success: false, data: [] }))
                );

                const ordersResults = await Promise.all(orderPromises);
                console.log('[usePendingRefunds] Orders results:', ordersResults);

                let totalPending = 0;
                ordersResults.forEach(result => {
                    if (result.success && result.data) {
                        const pending = result.data.filter(
                            order => order.order_status === 'CANCELLATION_PENDING'
                        ).length;
                        totalPending += pending;
                    }
                });

                console.log('[usePendingRefunds] Total pending count:', totalPending);
                setPendingCount(totalPending);
            } else {
                console.log('[usePendingRefunds] No events found, setting count to 0');
                setPendingCount(0);
            }
        } catch (error) {
            console.error('[usePendingRefunds] Error fetching pending refunds:', error);
            setPendingCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_id) {
            fetchPendingRefunds();

            // Refresh every 30 seconds
            const interval = setInterval(fetchPendingRefunds, 30000);

            return () => clearInterval(interval);
        }
    }, [user?.user_id]); // Only re-run when user_id changes

    return { pendingCount, loading, refresh: fetchPendingRefunds };
};
