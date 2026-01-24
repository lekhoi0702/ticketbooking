import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, message } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    CloudUploadOutlined,
    ReloadOutlined,
    StopOutlined,
    PlayCircleOutlined,
    DeleteOutlined,
    WarningOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { api } from '@services/api';

const EVENT_STATUS_CONFIG = {
    DRAFT: { color: 'default', label: 'Nháp', icon: CalendarOutlined },
    PENDING_APPROVAL: { color: 'warning', label: 'Chờ duyệt', icon: ReloadOutlined },
    PUBLISHED: { color: 'success', label: 'Công khai', icon: CloudUploadOutlined },
    REJECTED: { color: 'error', label: 'Từ chối duyệt', icon: CloseCircleOutlined },
    CANCELLED: { color: 'error', label: 'Hủy', icon: StopOutlined },
    ONGOING: { color: 'processing', label: 'Đang diễn ra', icon: PlayCircleOutlined },
    COMPLETED: { color: 'default', label: 'Hoàn thành', icon: CheckCircleOutlined },
    DELETED: { color: 'magenta', label: 'Đã xóa', icon: DeleteOutlined },
};

const getStatusConfig = (status) => {
    const c = EVENT_STATUS_CONFIG[status];
    if (!c) return { color: 'default', label: status, icon: null };
    const Icon = c.icon;
    return {
        ...c,
        icon: Icon ? <Icon spin={status === 'PENDING_APPROVAL'} /> : null,
    };
};

const useEventManagement = () => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterFeatured, setFilterFeatured] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setSelectedRowKeys([]); // Clear selection when refreshing
            const res = await api.getAllAdminEvents();
            if (res?.success) setEvents(res.data ?? []);
        } catch (err) {
            console.error('Error fetching admin events:', err);
            message.error('Lỗi khi tải danh sách sự kiện');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleUpdateStatus = useCallback(
        async (eventId, newStatus) => {
            try {
                setActionLoading(true);
                const res = await api.adminUpdateEventStatus(eventId, { status: newStatus });
                if (res?.success) {
                    message.success('Cập nhật trạng thái thành công');
                    setShowModal(false);
                    fetchEvents();
                } else {
                    message.error(res?.message || 'Có lỗi xảy ra');
                }
            } catch (err) {
                message.error(err?.message || 'Có lỗi xảy ra');
            } finally {
                setActionLoading(false);
            }
        },
        [fetchEvents]
    );

    const toggleFeatured = useCallback(
        async (event) => {
            const allowed = ['PUBLISHED', 'ONGOING'];
            if (!event.is_featured && !allowed.includes(event.status)) {
                message.warning('Chỉ sự kiện công khai hoặc đang diễn ra mới có thể đánh dấu nổi bật');
                return;
            }
            try {
                const res = await api.adminUpdateEventStatus(event.event_id, {
                    is_featured: !event.is_featured,
                });
                if (res?.success) {
                    message.success(
                        event.is_featured ? 'Đã bỏ đánh dấu nổi bật' : 'Đã đánh dấu sự kiện nổi bật'
                    );
                    fetchEvents();
                } else {
                    message.error(res?.message || 'Có lỗi xảy ra');
                }
            } catch (err) {
                message.error(err?.message || 'Có lỗi xảy ra');
            }
        },
        [fetchEvents]
    );

    const handleDeleteEvent = useCallback(
        (eventId) => {
            Modal.confirm({
                title: 'Xác nhận xóa vĩnh viễn',
                icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
                content:
                    'Bạn có chắc chắn muốn XÓA VĨNH VIỄN sự kiện này không? Hành động này không thể hoàn tác.',
                okText: 'Xác nhận xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: async () => {
                    try {
                        setActionLoading(true);
                        const res = await api.adminDeleteEvent(eventId);
                        if (res?.success) {
                            message.success('Đã xóa sự kiện thành công');
                            setShowModal(false);
                            fetchEvents();
                        } else {
                            message.error(res?.message || 'Có lỗi xảy ra');
                        }
                    } catch (err) {
                        message.error(err?.message || 'Có lỗi xảy ra');
                    } finally {
                        setActionLoading(false);
                    }
                },
            });
        },
        [fetchEvents]
    );

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            if (filterStatus !== 'ALL' && event.status !== filterStatus) return false;
            if (filterFeatured === 'FEATURED' && !event.is_featured) return false;
            if (filterFeatured === 'NOT_FEATURED' && event.is_featured) return false;
            if (
                searchQuery &&
                !event.event_name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
                return false;
            return true;
        });
    }, [events, filterStatus, filterFeatured, searchQuery]);

    const pendingCount = useMemo(
        () => events.filter((e) => e.status === 'PENDING_APPROVAL').length,
        [events]
    );

    const openDetail = useCallback((record) => {
        setSelectedEvent(record);
        setShowModal(true);
    }, []);

    const closeDetail = useCallback(() => {
        setShowModal(false);
        setSelectedEvent(null);
    }, []);

    const handleSelectionChange = useCallback((keys) => {
        setSelectedRowKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
    }, []);

    return {
        events,
        loading,
        fetchEvents,
        filteredEvents,
        selectedEvent,
        showModal,
        setSelectedEvent,
        setShowModal,
        openDetail,
        closeDetail,
        selectedRowKeys,
        setSelectedRowKeys,
        handleSelectionChange,
        actionLoading,
        handleUpdateStatus,
        toggleFeatured,
        handleDeleteEvent,
        getStatusConfig,
        filterStatus,
        setFilterStatus,
        filterFeatured,
        setFilterFeatured,
        searchQuery,
        setSearchQuery,
        pendingCount,
    };
};

export default useEventManagement;
export { getStatusConfig, EVENT_STATUS_CONFIG };
