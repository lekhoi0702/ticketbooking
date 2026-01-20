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
    Modal,
    Select,
    Descriptions,
    Divider
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
import AdminPortal from '@shared/components/AdminPortal';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';

const { Text } = Typography;

const AdminOrdersManagement = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, eventsRes] = await Promise.all([
                api.getAllAdminOrders(),
                api.getAllAdminEvents()
            ]);

            if (ordersRes.success) setOrders(ordersRes.data);
            if (eventsRes.success) {
                setEvents(eventsRes.data.map(e => ({ label: e.event_name, value: e.event_id })));
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
            message.error("Lỗi khi tải dữ liệu");
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
                        fetchData();
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
                        fetchData();
                    }
                } catch (error) {
                    message.error(error.message);
                }
            }
        });
    };

    const handleViewDetails = async (orderId) => {
        try {
            const res = await api.getOrder(orderId);
            if (res.success) {
                setSelectedOrder(res.data);
                setDetailVisible(true);
            }
        } catch (error) {
            message.error("Không thể tải chi tiết đơn hàng");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.event_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEvent = selectedEventId ? order.event_id === selectedEventId : true;

        return matchesSearch && matchesEvent;
    });

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
                    <Text strong style={{ color: '#2DC275' }}>{record.order_code}</Text>
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
                    <Text type="secondary" style={{ fontSize: 12 }}>SĐT: {record.customer_phone || 'N/A'}</Text>
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
        // Actions column removed as requested - moved to toolbar
    ];

    if (loading) {
        return <AdminLoadingScreen tip="Đang tải danh sách đơn hàng..." />;
    }

    return (
        <div style={{ paddingTop: 0 }}>
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <div style={{ marginBottom: 8, fontSize: 12, color: '#8c8c8c', fontWeight: 600 }}>LỌC THEO SỰ KIỆN</div>
                        <Select
                            placeholder="Tất cả sự kiện"
                            style={{ width: '100%' }}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={events}
                            onChange={setSelectedEventId}
                            size="large"
                        />
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: 8, fontSize: 12, color: '#8c8c8c', fontWeight: 600 }}>TÌM KIẾM CHI TIẾT</div>
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%' }}
                            allowClear
                            placeholder="Tìm kiếm theo mã đơn, khách hàng..."
                            size="large"
                        />
                    </Col>
                </Row>
                <Divider style={{ margin: '16px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        {selectedRowKeys.length > 0 && (
                            <Space size="middle">
                                <Text strong>{selectedRowKeys.length} đã chọn:</Text>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={() => handleViewDetails(selectedRowKeys[0])}
                                    disabled={selectedRowKeys.length > 1}
                                >
                                    Xem chi tiết
                                </Button>
                                {(() => {
                                    const record = orders.find(o => o.order_id === selectedRowKeys[0]);
                                    if (!record || selectedRowKeys.length > 1) return null;

                                    return (
                                        <>
                                            {record.payment_method === 'CASH' && record.order_status === 'PENDING' && (
                                                <Button
                                                    type="primary"
                                                    style={{ background: '#2DC275', borderColor: '#2DC275' }}
                                                    onClick={() => handleConfirmCash(record.order_id)}
                                                >
                                                    Xác nhận thanh toán
                                                </Button>
                                            )}
                                            {record.order_status === 'CANCELLATION_PENDING' && (
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        style={{ background: '#2DC275', borderColor: '#2DC275' }}
                                                        icon={<CheckOutlined />}
                                                        onClick={() => handleProcessCancellation(record.order_id, 'approve')}
                                                    >
                                                        Duyệt hủy
                                                    </Button>
                                                    <Button
                                                        danger
                                                        icon={<CloseCircleOutlined />}
                                                        onClick={() => handleProcessCancellation(record.order_id, 'reject')}
                                                    >
                                                        Từ chối hủy
                                                    </Button>
                                                </Space>
                                            )}
                                        </>
                                    );
                                })()}
                            </Space>
                        )}
                    </div>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchData} size="middle">
                            Làm mới
                        </Button>
                    </Space>
                </div>
            </Card>

            <Card styles={{ body: { padding: 0 } }}>
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    rowKey="order_id"
                    columns={columns}
                    dataSource={filteredOrders}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={`Chi tiết đơn hàng - ${selectedOrder?.order_code}`}
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <>
                        <Descriptions title="Thông tin chung" bordered column={2}>
                            <Descriptions.Item label="Khách hàng">{selectedOrder.customer_name}</Descriptions.Item>
                            <Descriptions.Item label="SĐT">{selectedOrder.customer_phone}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedOrder.customer_email}</Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                {(() => {
                                    const config = getStatusConfig(selectedOrder.order_status);
                                    return <Tag color={config.color}>{config.label}</Tag>;
                                })()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong style={{ color: '#cf1322', fontSize: 16 }}>
                                    {formatCurrency(selectedOrder.total_amount)}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Danh sách vé</Divider>

                        <Table
                            dataSource={selectedOrder.tickets || []}
                            rowKey="ticket_id"
                            pagination={false}
                            size="small"
                            columns={[
                                { title: 'Mã vé', dataIndex: 'ticket_code', key: 'code', render: t => <Text code>{t}</Text> },
                                { title: 'Loại vé', dataIndex: 'ticket_type_name', key: 'type' },
                                { title: 'Ghế', dataIndex: 'seat_name', key: 'seat', render: t => t || 'Vé tự do' },
                                { title: 'Giá', dataIndex: 'price', key: 'price', render: p => formatCurrency(p) },
                                {
                                    title: 'Trạng thái',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: s => {
                                        let color = s === 'sold' ? 'green' : 'default';
                                        return <Tag color={color}>{s.toUpperCase()}</Tag>;
                                    }
                                }
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div >
    );
};

export default AdminOrdersManagement;
