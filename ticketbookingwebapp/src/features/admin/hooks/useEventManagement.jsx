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
  const [filterDateRange, setFilterDateRange] = useState(null); // [dayjs, dayjs] | null
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setSelectedRowKeys([]);
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

  const toggleFavorite = useCallback(
    async (event) => {
      try {
        const res = await api.adminUpdateEventStatus(event.event_id, {
          is_favorite: !event.is_favorite,
        });
        if (res?.success) {
          message.success(
            event.is_favorite ? 'Đã bỏ đánh dấu yêu thích' : 'Đã đánh dấu sự kiện yêu thích'
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
    if (!events) return [];
    const query = searchQuery?.toLowerCase().trim();

    return events.filter((event) => {
      const effectiveStatus = filterStatus || 'ALL';
      if (effectiveStatus !== 'ALL') {
        if (!event.status || event.status.toUpperCase() !== effectiveStatus.toUpperCase()) {
          return false;
        }
      }

      const effectiveFeatured = filterFeatured || 'ALL';
      if (effectiveFeatured === 'FEATURED' && !event.is_featured) return false;
      if (effectiveFeatured === 'NOT_FEATURED' && event.is_featured) return false;

      if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
        const startTs = new Date(event.start_datetime || 0).getTime();
        const fromTs = filterDateRange[0].startOf('day').valueOf();
        const toTs = filterDateRange[1].endOf('day').valueOf();
        if (Number.isNaN(startTs) || startTs < fromTs || startTs > toTs) return false;
      }

      if (query) {
        const nameMatch = event.event_name?.toLowerCase().includes(query);
        const locationMatch = event.location?.toLowerCase().includes(query);
        const organizerMatch = event.organizer_name?.toLowerCase().includes(query);
        if (!nameMatch && !locationMatch && !organizerMatch) return false;
      }

      return true;
    });
  }, [events, filterStatus, filterFeatured, filterDateRange, searchQuery]);

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
    toggleFavorite,
    handleDeleteEvent,
    getStatusConfig,
    filterStatus,
    setFilterStatus,
    filterFeatured,
    setFilterFeatured,
    filterDateRange,
    setFilterDateRange,
    searchQuery,
    setSearchQuery,
    pendingCount,
  };
};

export default useEventManagement;
export { getStatusConfig, EVENT_STATUS_CONFIG };
