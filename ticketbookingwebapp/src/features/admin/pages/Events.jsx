import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Avatar, Image, Space, Typography, Tooltip, Alert } from 'antd';
import {
  StarFilled,
  StarOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { getImageUrl } from '@shared/utils/eventUtils';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminTable from '@features/admin/components/AdminTable';
import EventFilters from '@features/admin/components/EventFilters';
import useEventManagement from '@features/admin/hooks/useEventManagement';

const { Text } = Typography;

const formatDateOnly = (datetime) => {
  if (!datetime) return <Text type="secondary">—</Text>;
  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return <Text type="secondary">—</Text>;
  return (
    <Text style={{ fontSize: 14 }}>
      {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
    </Text>
  );
};

const isExpired = (endDatetime) => {
  if (!endDatetime) return false;
  const end = new Date(endDatetime);
  if (Number.isNaN(end.getTime())) return false;
  return end < new Date();
};

const AdminEventsManagement = () => {
  const navigate = useNavigate();
  const {
    events,
    loading,
    fetchEvents,
    filteredEvents,
    selectedRowKeys,
    handleSelectionChange,
    toggleFavorite,
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
  } = useEventManagement();

  const openDetail = (event) => {
    if (event?.event_id) {
      navigate(`/admin/events/${event.event_id}`);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'ẢNH BÌA',
        key: 'banner',
        width: 100,
        render: (_, record) => (
          <Image
            width={80}
            height={45}
            src={getImageUrl(record.banner_image_url)}
            fallback={getImageUrl(null)}
            style={{ borderRadius: 12, objectFit: 'cover' }}
            alt=""
          />
        ),
      },
      {
        title: 'THÔNG TIN SỰ KIỆN',
        key: 'info',
        render: (_, record) => (
          <Space orientation="vertical" size={2}>
            <Space wrap size={6}>
              <Text strong style={{ fontSize: 16 }}>
                {record.event_name}
              </Text>
              {record.group_id && (
                <Tag color="blue" style={{ fontSize: 16, margin: 0 }}>
                  Nhiều ngày diễn
                </Tag>
              )}
            </Space>
            {record.category?.category_name && (
              <Text type="secondary" style={{ fontSize: 16 }}>
                {record.category.category_name}
              </Text>
            )}
          </Space>
        ),
      },
      {
        title: 'NGÀY BẮT ĐẦU',
        key: 'start_date',
        width: 130,
        sorter: (a, b) =>
          new Date(a.start_datetime || 0).getTime() - new Date(b.start_datetime || 0).getTime(),
        render: (_, record) => formatDateOnly(record.start_datetime),
      },
      {
        title: 'NGÀY KẾT THÚC',
        key: 'end_date',
        width: 130,
        sorter: (a, b) =>
          new Date(a.end_datetime || 0).getTime() - new Date(b.end_datetime || 0).getTime(),
        render: (_, record) => formatDateOnly(record.end_datetime),
      },
      {
        title: 'NHÀ TỔ CHỨC',
        key: 'organizer',
        render: (_, record) => (
          <Space>
            <Avatar size="small" style={{ backgroundColor: '#2DC275' }}>
              {record.organizer_name?.charAt(0)}
            </Avatar>
            <Text style={{ fontSize: 16 }}>{record.organizer_name}</Text>
          </Space>
        ),
      },
      {
        title: 'TRẠNG THÁI',
        key: 'status',
        align: 'center',
        render: (_, record) => {
          if (isExpired(record.end_datetime)) {
            return (
              <Tag color="default" style={{ fontSize: 16 }}>
                HẾT HẠN
              </Tag>
            );
          }
          const config = getStatusConfig(record.status);
          return (
            <Tag color={config.color} style={{ fontSize: 16 }}>
              {config.label.toUpperCase()}
            </Tag>
          );
        },
      },
      {
        title: 'YÊU THÍCH',
        key: 'favorite',
        align: 'center',
        render: (_, record) => (
          <Tooltip title={record.is_favorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}>
            <Button
              type="text"
              icon={
                record.is_favorite ? (
                  <StarFilled style={{ color: '#faad14' }} />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={() => toggleFavorite(record)}
              aria-label={record.is_favorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
            />
          </Tooltip>
        ),
      },
    ],
    [getStatusConfig, toggleFavorite]
  );

  if (loading) {
    return <AdminLoadingScreen tip="Đang tải danh sách sự kiện..." />;
  }

  return (
    <div style={{ padding: '0 24px' }}>
      <EventFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterFeatured={filterFeatured}
        setFilterFeatured={setFilterFeatured}
        filterDateRange={filterDateRange}
        setFilterDateRange={setFilterDateRange}
        selectedRowKeys={selectedRowKeys}
        events={events}
        onViewDetail={openDetail}
        onRefresh={fetchEvents}
        loading={loading}
      />

      {pendingCount > 0 && (
        <Alert
          message={
            <Space>
              <WarningOutlined />
              <Text strong>
                Cần chú ý: Đang có {pendingCount} sự kiện chờ bạn phê duyệt.
              </Text>
            </Space>
          }
          type="warning"
          showIcon={false}
          style={{
            marginBottom: 24,
            borderRadius: 8,
            border: 'none',
            backgroundColor: '#fffbe6',
          }}
        />
      )}

      <Card styles={{ body: { padding: 0 } }}>
        <AdminTable
          rowSelection={{
            selectedRowKeys,
            onChange: handleSelectionChange,
          }}
          selectionType="single"
          rowKey="event_id"
          columns={columns}
          dataSource={filteredEvents}
          pagination={{
            pageSize: 50,
            showTotal: (total) => `Tổng số ${total} sự kiện`,
          }}
          emptyText="Không có sự kiện"
        />
      </Card>
    </div>
  );
};

export default AdminEventsManagement;
