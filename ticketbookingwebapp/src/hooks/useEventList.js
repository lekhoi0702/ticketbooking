import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing event list logic for organizers
 */
export const useEventList = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [events, setEvents] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [user]);

    const fetchEvents = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError(null);
            const response = await api.getOrganizerEvents(user.user_id);

            if (response.success) {
                setEvents(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách sự kiện');
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (event) => {
        setEventToDelete(event);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;

        try {
            setDeleting(true);
            const response = await api.deleteEvent(eventToDelete.event_id);

            if (response.success) {
                setEvents(prev => prev.filter(e => e.event_id !== eventToDelete.event_id));
                setShowDeleteModal(false);
                setEventToDelete(null);
            } else {
                alert(response.message || 'Không thể xóa sự kiện');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            alert(err.message || 'Không thể xóa sự kiện');
        } finally {
            setDeleting(false);
        }
    };

    const handlePublishEvent = async (eventId) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('status', 'PUBLISHED');

            const response = await api.updateEvent(eventId, formData);

            if (response.success) {
                setEvents(prev => prev.map(e =>
                    e.event_id === eventId ? { ...e, status: 'PUBLISHED' } : e
                ));
            } else {
                alert(response.message || 'Không thể đăng sự kiện');
            }
        } catch (err) {
            console.error('Error publishing event:', err);
            alert(err.message || 'Không thể đăng sự kiện');
        } finally {
            setLoading(false);
        }
    };

    return {
        events,
        loading,
        error,
        deleting,
        showDeleteModal,
        eventToDelete,
        setShowDeleteModal,
        handleDeleteClick,
        handleDeleteConfirm,
        handlePublishEvent,
        fetchEvents
    };
};
