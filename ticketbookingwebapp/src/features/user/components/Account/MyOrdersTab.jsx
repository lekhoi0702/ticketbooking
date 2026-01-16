import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Typography, Empty, message } from 'antd';
import { ShoppingOutlined, EyeOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import { formatCurrency } from '@shared/utils/eventUtils';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const { Text } = Typography;

const MyOrdersTab = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user?.user_id) {
            fetchOrders();
        }
    }, [user?.user_id]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.getUserOrders(user.user_id);
            if (res.success) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            message.error('Không thể tải lịch sử đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PAID': { color: 'success', label: 'Đã thanh toán' },
            'PENDING': { color: 'warning', label: 'Chờ thanh toán' },
            'CANCELLED': { color: 'error', label: 'Đã hủy' },
            'COMPLETED': { color: 'blue', label: 'Hoàn thành' },
            'CANCELLATION_PENDING': { color: 'processing', label: 'Đang xử lý hủy' }
        };
        return configs[status] || { color: 'default', label: status };
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'order_code',
            key: 'order_code',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Sự kiện',
            dataIndex: 'event_name',
            key: 'event_name',
            render: (text) => <Text ellipsis>{text || 'Đơn hàng dịch vụ'}</Text>,
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'order_status',
            key: 'order_status',
            render: (status) => {
                const config = getStatusConfig(status);
                return <Tag color={config.color}>{config.label.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/order-success/${record.order_code}`)}
                    >
                        Chi tiết
                    </Button>
                    {canRequestRefund(record) && (
                        <Button
                            type="link"
                            danger
                            onClick={() => handleRefundRequest(record)}
                        >
                            Yêu cầu hoàn tiền
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const canRequestRefund = (order) => {
        // Can request refund if:
        // 1. Order is PAID
        // 2. Sale period is still active (is_sale_active = true)
        return order.order_status === 'PAID' && order.is_sale_active;
    };

    const handleRefundRequest = async (order) => {
        const { Modal } = await import('antd');

        Modal.confirm({
            title: 'Xác nhận yêu cầu hoàn tiền',
            content: `Bạn có chắc chắn muốn yêu cầu hoàn tiền cho đơn hàng ${order.order_code}? Yêu cầu sẽ được gửi đến ban tổ chức để xét duyệt.`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const res = await api.cancelOrder(order.order_id);
                    if (res.success) {
                        message.success(res.message || 'Yêu cầu hoàn tiền đã được gửi thành công!');
                        fetchOrders(); // Refresh orders list
                    } else {
                        message.error(res.message || 'Không thể gửi yêu cầu hoàn tiền');
                    }
                } catch (error) {
                    console.error('Error requesting refund:', error);
                    message.error('Có lỗi xảy ra khi gửi yêu cầu hoàn tiền');
                }
            }
        });
    };

    if (loading) return <LoadingSpinner tip="Đang tải lịch sử đặt vé..." />;

    if (orders.length === 0) {
        return (
            <div style={{ padding: '40px 0' }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Bạn chưa có đơn đặt vé nào"
                >
                    <Button type="primary" onClick={() => navigate('/')}>
                        Khám phá sự kiện
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <Table
            columns={columns}
            dataSource={orders}
            rowKey="order_id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: true }}
        />
    );
};

export default MyOrdersTab;
