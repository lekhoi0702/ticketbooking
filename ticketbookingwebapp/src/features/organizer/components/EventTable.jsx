import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    Button,
    Tag,
    Avatar,
    Typography,
    Space,
    Tooltip,
    Image,
    Card,
    Skeleton
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    SyncOutlined,
    PlayCircleOutlined,
    CloudUploadOutlined,
    ShoppingOutlined
} from '@ant-design/icons';

import { getImageUrl } from '@shared/utils/eventUtils';

const { Text } = Typography;

const EventTable = ({
    events,
    onSelectionChange,
    selectedRowKeys,
    loading
}) => {
    const navigate = useNavigate();

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING_APPROVAL': { color: 'warning', label: 'Đang duyệt', icon: <SyncOutlined spin /> },
            'APPROVED': { color: 'cyan', label: 'Đã duyệt', icon: <CheckCircleOutlined /> },
            'REJECTED': { color: 'error', label: 'Bị từ chối', icon: <CloseCircleOutlined /> },
            'PUBLISHED': { color: 'success', label: 'Công khai', icon: <CloudUploadOutlined /> },
            'DRAFT': { color: 'default', label: 'Nháp', icon: <ClockCircleOutlined /> },
            'ONGOING': { color: 'processing', label: 'Đang diễn ra', icon: <PlayCircleOutlined /> },
            'COMPLETED': { color: 'default', label: 'Hoàn thành', icon: <CheckCircleOutlined /> }
        };
        return configs[status] || { color: 'default', label: status, icon: null };
    };

    const columns = [
        {
            title: 'SỰ KIỆN',
            key: 'event',
            render: (_, record) => (
                <Space size={16}>
                    <Image
                        width={60}
                        height={60}
                        src={getImageUrl(record.banner_image_url)}
                        fallback="/placeholder-event.png"
                        style={{ borderRadius: 4, objectFit: 'cover', border: '1px solid #f0f0f0' }}
                    />
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 14, color: '#303133' }}>{record.event_name}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ID: #{record.event_id} • {record.category?.category_name}
                        </Text>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'THỜI GIAN / ĐỊA ĐIỂM',
            key: 'info',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 13 }}>{new Date(record.start_datetime).toLocaleDateString('vi-VN')}</Text>
                    <Text type="secondary" style={{ fontSize: 12, maxWidth: 200 }} ellipsis>
                        {record.venue?.venue_name}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            render: (_, record) => {
                const config = getStatusConfig(record.status);
                return (
                    <Tag icon={config.icon} color={config.color}>
                        {record.status}
                    </Tag>
                );
            },
        },
    ];

    const rowSelection = {
        type: 'radio', // Chỉ cho phép chọn 1 hàng
        selectedRowKeys,
        onChange: (keys) => {
            onSelectionChange(keys);
        },
    };

    if (loading) {
        return (
            <div style={{ padding: 20 }}>
                <Skeleton active paragraph={{ rows: 5 }} />
            </div>
        );
    }

    return (
        <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={events}
            rowKey="event_id"
            loading={false}
            pagination={{ pageSize: 10 }}
            size="middle"
            locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
            onRow={(record) => ({
                onClick: () => {
                    // Chỉ cho phép chọn 1, nếu đã chọn thì bỏ chọn
                    const isSelected = selectedRowKeys.includes(record.event_id);
                    if (isSelected) {
                        onSelectionChange([]);
                    } else {
                        onSelectionChange([record.event_id]);
                    }
                },
                style: { cursor: 'pointer' }
            })}
        />
    );
};

export default EventTable;
