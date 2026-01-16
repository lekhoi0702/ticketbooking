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
    Card
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

const { Text } = Typography;

const EventTable = ({ events, handlePublishEvent, handleCancelApproval, handleDeleteClick }) => {
    const navigate = useNavigate();

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING_APPROVAL': { color: 'warning', label: 'Đang duyệt', icon: <SyncOutlined spin /> },
            'APPROVED': { color: 'cyan', label: 'Đã duyệt', icon: <CheckCircleOutlined /> },
            'REJECTED': { color: 'error', label: 'Bị từ chối', icon: <CloseCircleOutlined /> },
            'PUBLISHED': { color: 'success', label: 'Công khai', icon: <CloudUploadOutlined /> },
            'DRAFT': { color: 'default', label: 'Nháp', icon: <ClockCircleOutlined /> },
            'ONGOING': { color: 'processing', label: 'Đang diễn ra', icon: <PlayCircleOutlined /> },
            'COMPLETED': { color: 'default', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
            'PENDING_DELETION': { color: 'error', label: 'Chờ xóa', icon: <StopOutlined /> }
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
                        src={
                            record.banner_image_url?.startsWith('http')
                                ? record.banner_image_url
                                : `http://127.0.0.1:5000${record.banner_image_url}`
                        }
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
                        {config.label.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'THAO TÁC',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space size={8}>
                    {record.status === 'APPROVED' && (
                        <Button
                            type="text"
                            icon={<CloudUploadOutlined />}
                            size="small"
                            onClick={() => handlePublishEvent(record.event_id)}
                            style={{ color: '#52c41a' }}
                        >
                            Đăng
                        </Button>
                    )}
                    {record.status === 'PENDING_APPROVAL' && (
                        <Button
                            type="text"
                            icon={<CloseCircleOutlined />}
                            size="small"
                            onClick={() => handleCancelApproval(record.event_id)}
                            danger
                        >
                            Hủy
                        </Button>
                    )}

                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/organizer/event/${record.event_id}`)}
                            style={{ color: '#52c41a' }}
                        />
                    </Tooltip>

                    <Tooltip title="Quản lý đơn hàng">
                        <Button
                            type="text"
                            icon={<ShoppingOutlined />}
                            onClick={() => navigate(`/organizer/event/${record.event_id}/orders`)}
                            style={{ color: '#1890ff' }}
                        />
                    </Tooltip>

                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/organizer/edit-event/${record.event_id}`)}
                            disabled={['REJECTED', 'PENDING_APPROVAL', 'ONGOING', 'COMPLETED'].includes(record.status)}
                            style={{ color: '#52c41a' }}
                        />
                    </Tooltip>

                    {['DRAFT', 'REJECTED'].includes(record.status) && (
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDeleteClick(record)}
                                danger
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={events}
            rowKey="event_id"
            pagination={{ pageSize: 10 }}
            size="middle"
            locale={{ emptyText: 'Không tìm thấy dữ liệu' }}
        />
    );
};

export default EventTable;
