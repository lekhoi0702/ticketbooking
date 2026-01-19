import { useState, useEffect } from 'react';
import { message } from 'antd';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';

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

            // Prepare request body with reason (will be collected from modal if needed)
            const requestBody = {
                manager_id: user.user_id,
                reason: eventToDelete.deleteReason || ''
            };

            const response = await api.deleteEvent(eventToDelete.event_id, requestBody);

            if (response.success) {
                if (response.requires_approval) {
                    // Event has sold tickets, deletion request created
                    const { Modal } = await import('antd');
                    Modal.success({
                        title: 'Yêu cầu đã được gửi',
                        content: response.message,
                    });
                    // Refresh events to show updated status
                    await fetchEvents();
                } else {
                    // Event deleted successfully
                    setEvents(prev => prev.filter(e => e.event_id !== eventToDelete.event_id));
                    const { message: antMessage } = await import('antd');
                    antMessage.success(response.message || 'Sự kiện đã được xóa thành công');
                }
                setShowDeleteModal(false);
                setEventToDelete(null);
            } else {
                // Handle specific error cases
                if (response.action_required === 'UNPUBLISH') {
                    const { Modal } = await import('antd');
                    Modal.warning({
                        title: 'Cần chuyển về bản nháp',
                        content: response.message,
                        okText: 'Đã hiểu'
                    });
                } else {
                    alert(response.message || 'Không thể xóa sự kiện');
                }
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
                message.success('Sự kiện đã được đăng công khai thành công');
            } else {
                message.error(response.message || 'Không thể đăng sự kiện');
            }
        } catch (err) {
            console.error('Error publishing event:', err);
            message.error(err.message || 'Không thể đăng sự kiện');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelApproval = async (eventId) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('status', 'DRAFT');

            const response = await api.updateEvent(eventId, formData);

            if (response.success) {
                setEvents(prev => prev.map(e =>
                    e.event_id === eventId ? { ...e, status: 'DRAFT' } : e
                ));
                message.success('Sự kiện đã được chuyển về trạng thái bản nháp');
            } else {
                message.error(response.message || 'Không thể chuyển trạng thái sự kiện');
            }
        } catch (err) {
            console.error('Error cancelling approval:', err);
            message.error(err.message || 'Không thể kết nối đến server');
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
        setEventToDelete,
        setShowDeleteModal,
        handleDeleteClick,
        handleDeleteConfirm,
        handlePublishEvent,
        handleCancelApproval,
        fetchEvents
    };
};
