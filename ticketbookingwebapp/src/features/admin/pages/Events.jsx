import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Avatar, Image, Space, Typography, Tooltip, Alert } from 'antd';
import {
    StarFilled,
    StarOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { api } from '@services/api';
import { getImageUrl } from '@shared/utils/eventUtils';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminTable from '@features/admin/components/AdminTable';
import EventFilters from '@features/admin/components/EventFilters';
import useEventManagement from '@features/admin/hooks/useEventManagement';

const { Text } = Typography;

const AdminEventsManagement = () => {
    const navigate = useNavigate();
    const {
        events,
        loading,
        fetchEvents,
        filteredEvents,
        selectedRowKeys,
        handleSelectionChange,
        toggleFeatured,
        getStatusConfig,
        filterStatus,
        setFilterStatus,
        filterFeatured,
        setFilterFeatured,
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
                        style={{ borderRadius: 12, objectFit: 'cover' }}
                        alt=""
                    />
                ),
            },
            {
                title: 'THÔNG TIN SỰ KIỆN',
                key: 'info',
                render: (_, record) => (
                    <Space direction="vertical" size={2}>
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
                    const config = getStatusConfig(record.status);
                    return (
                        <Tag color={config.color} style={{ fontSize: 16 }}>
                            {config.label.toUpperCase()}
                        </Tag>
                    );
                },
            },
            {
                title: 'NỔI BẬT',
                key: 'featured',
                align: 'center',
                render: (_, record) => (
                    <Tooltip title={record.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}>
                        <Button
                            type="text"
                            icon={
                                record.is_featured ? (
                                    <StarFilled style={{ color: '#faad14' }} />
                                ) : (
                                    <StarOutlined />
                                )
                            }
                            onClick={() => toggleFeatured(record)}
                            disabled={
                                !record.is_featured &&
                                !['PUBLISHED', 'ONGOING'].includes(record.status)
                            }
                            aria-label={record.is_featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                        />
                    </Tooltip>
                ),
            },
        ],
        [getStatusConfig, toggleFeatured]
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
