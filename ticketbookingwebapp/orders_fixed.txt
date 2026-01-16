import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Tag,
    Input,
    Space,
    Typography,
    Tooltip,
    message,
    Modal
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    WalletOutlined,
    DollarOutlined,
    HistoryOutlined,
    CloseCircleOutlined,
    CheckOutlined,
    SyncOutlined
} from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';

const { Text } = Typography;

const AdminOrdersManagement = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.getAllAdminOrders();
            if (res.success) setOrders(res.data);
        } catch (error) {
            console.error("Error fetching admin orders:", error);
            message.error("Lỗi khi tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCash = (orderId) => {
        Modal.confirm({
            title: 'Xác nhận thanh toán tiền mặt',
            content: 'Bạn có chắc chắn muốn xác nhận thanh toán cho đơn hàng này? Trạng thái sẽ được cập nhật thành ĐÃ THANH TOÁN.',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await api.confirmCashPayment(orderId);
                    if (res.success) {
                        message.success("Xác nhận thanh toán thành công!");
                        fetchOrders();
                    }
                } catch (error) {
                    message.error(error.message);
                }
            }
        });
    };

    const handleProcessCancellation = (orderId, action) => {
        const isApprove = action === 'approve';
        Modal.confirm({
            title: isApprove ? 'Duyệt yêu cầu hủy' : 'Từ chối yêu cầu hủy',
            content: isApprove
                ? 'Bạn có chắc chắn muốn duyệt yêu cầu hủy này? Đơn hàng sẽ được đánh dấu là ĐÃ HỦY.'
                : 'Bạn có chắc chắn muốn từ chối yêu cầu hủy này? Đơn hàng sẽ quay lại trạng thái ĐÃ THANH TOÁN.',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await api.processOrderCancellation(orderId, action);
                    if (res.success) {
                        message.success(isApprove ? "Đã duyệt yêu cầu hủy" : "Đã từ chối yêu cầu hủy");
                        fetchOrders();
                    }
                } catch (error) {
                    message.error(error.message);
                }
            }
        });
    };

    const filteredOrders = orders.filter(order =>
        order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusConfig = (status) => {
        const configs = {
            'PAID': { color: 'success', label: 'Đã thanh toán', icon: <CheckCircleOutlined /> },
            'PENDING': { color: 'warning', label: 'Chờ thanh toán', icon: <HistoryOutlined /> },
            'CANCELLED': { color: 'error', label: 'Đã hủy', icon: <CloseCircleOutlined /> },
            'CANCELLATION_PENDING': { color: 'processing', label: 'Chờ hủy', icon: <SyncOutlined spin /> }
        };
        return configs[status] || { color: 'default', label: status, icon: null };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        {
            title: 'MÃ ĐƠN / NGÀY',
            key: 'order',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: '#52c41a' }}>{record.order_code}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        <HistoryOutlined /> {new Date(record.created_at).toLocaleString('vi-VN')}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'KHÁCH HÀNG',
            key: 'customer',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 13 }}>{record.customer_name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.customer_phone || 'N/A'}</Text>
                </Space>
            ),
        },
        {
            title: 'SỰ KIỆN',
            key: 'event',
            render: (_, record) => (
                <Text ellipsis style={{ maxWidth: 200, fontSize: 13 }}>{record.event_name || 'N/A'}</Text>
            ),
        },
        {
            title: 'PHƯƠNG THỨC',
            key: 'method',
            align: 'center',
            render: (_, record) => (
                <Tag icon={record.payment_method === 'VNPAY' ? <WalletOutlined /> : <DollarOutlined />} color={record.payment_method === 'VNPAY' ? 'blue' : 'default'}>
                    {record.payment_method}
                </Tag>
            ),
        },
        {
            title: 'SỐ TIỀN',
            key: 'amount',
            align: 'right',
            render: (_, record) => (
                <Text strong>{formatCurrency(record.total_amount)}</Text>
            ),
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            align: 'center',
            render: (_, record) => {
                const config = getStatusConfig(record.order_status);
                return <Tag color={config.color} icon={config.icon}>{config.label.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'THAO TÁC',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} style={{ color: '#52c41a' }} />
                    </Tooltip>
                    {record.payment_method === 'CASH' && record.order_status === 'PENDING' && (
                        <Button size="small" type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleConfirmCash(record.order_id)}>
                            Xác nhận
                        </Button>
                    )}
                    {record.order_status === 'CANCELLATION_PENDING' && (
                        <Space>
                            <Button size="small" type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} icon={<CheckOutlined />} onClick={() => handleProcessCancellation(record.order_id, 'approve')}>
                                Duyệt
                            </Button>
                            <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleProcessCancellation(record.order_id, 'reject')}>
                                Từ chối
                            </Button>
                        </Space>
                    )}
                </Space>
            ),
        },
    ];

    if (loading) {
        return <AdminLoadingScreen tip="Đang tải danh sách đơn hàng..." />;
    }

    return (
        <div>
            <Space style={{ marginBottom: 24, width: '100%', justifyContent: 'flex-end' }}>
                <Button icon={<ReloadOutlined />} onClick={fetchOrders}>Làm mới</Button>
            </Space>

            <Card
                title={
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 350 }}
                        allowClear
                    />
                }
                styles={{ body: { padding: 0 } }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="order_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default AdminOrdersManagement;
