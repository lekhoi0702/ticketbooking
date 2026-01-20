import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Table, 
    Button, 
    Tag, 
    Space, 
    Typography, 
    message, 
    Modal, 
    Descriptions,
    Empty,
    Skeleton,
    Tooltip
} from 'antd';
import { 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    ReloadOutlined,
    EyeOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import { usePendingRefunds } from '@shared/hooks/usePendingRefunds';

const { Title, Text } = Typography;

const RefundRequests = () => {
    const { user } = useAuth();
    const { refresh: refreshPendingCount } = usePendingRefunds();
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (user?.user_id) {
            fetchRefundRequests();
        }
    }, [user?.user_id]);

    const fetchRefundRequests = async () => {
        try {
            setLoading(true);
            const res = await api.getRefundRequests(user.user_id);
            if (res.success) {
                setRequests(res.data);
            }
        } catch (error) {
            console.error('Error fetching refund requests:', error);
            message.error('Không thể tải danh sách yêu cầu hoàn tiền');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (order) => {
        Modal.confirm({
            title: 'Xác nhận duyệt hoàn tiền',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn <strong>DUYỆT</strong> yêu cầu hoàn tiền này?</p>
                    <p><Text type="secondary">Mã đơn: {order.order_code}</Text></p>
                    <p><Text type="secondary">Số tiền: {order.total_amount?.toLocaleString()} ₫</Text></p>
                    <p><Text type="warning">Lưu ý: Vé sẽ bị hủy và ghế sẽ được mở bán lại.</Text></p>
                </div>
            ),
            okText: 'Duyệt hoàn tiền',
            okType: 'primary',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setProcessing(true);
                    const res = await api.approveRefund(order.order_id);
                    if (res.success) {
                        message.success('Đã duyệt hoàn tiền thành công!');
                        fetchRefundRequests();
                        refreshPendingCount();
                    } else {
                        message.error(res.message || 'Không thể duyệt hoàn tiền');
                    }
                } catch (error) {
                    console.error('Error approving refund:', error);
                    message.error('Có lỗi xảy ra khi duyệt hoàn tiền');
                } finally {
                    setProcessing(false);
                }
            }
        });
    };

    const handleReject = (order) => {
        Modal.confirm({
            title: 'Từ chối yêu cầu hoàn tiền',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn <strong>TỪ CHỐI</strong> yêu cầu hoàn tiền này?</p>
                    <p><Text type="secondary">Mã đơn: {order.order_code}</Text></p>
                    <p><Text type="secondary">Đơn hàng sẽ trở về trạng thái "Đã thanh toán".</Text></p>
                </div>
            ),
            okText: 'Từ chối',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setProcessing(true);
                    const res = await api.rejectRefund(order.order_id);
                    if (res.success) {
                        message.success('Đã từ chối yêu cầu hoàn tiền!');
                        fetchRefundRequests();
                        refreshPendingCount();
                    } else {
                        message.error(res.message || 'Không thể từ chối yêu cầu');
                    }
                } catch (error) {
                    console.error('Error rejecting refund:', error);
                    message.error('Có lỗi xảy ra khi từ chối yêu cầu');
                } finally {
                    setProcessing(false);
                }
            }
        });
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_code',
            key: 'order_code',
            render: (text) => <Text strong copyable>{text}</Text>
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <div><Text strong>{record.customer_name || record.user_name || 'N/A'}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: 12 }}>{record.customer_email || record.user_email || 'N/A'}</Text></div>
                </div>
            )
        },
        {
            title: 'Sự kiện',
            dataIndex: 'event_name',
            key: 'event_name',
            render: (text) => <Text ellipsis style={{ maxWidth: 200 }}>{text}</Text>
        },
        {
            title: 'Số vé',
            dataIndex: 'tickets_count',
            key: 'tickets_count',
            align: 'center',
            render: (count) => <Tag color="blue">{count} vé</Tag>
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            align: 'right',
            render: (val) => <Text type="success" strong>{val?.toLocaleString()} ₫</Text>
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'N/A'
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 280,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            icon={<EyeOutlined />} 
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(record)}
                        loading={processing}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Duyệt
                    </Button>
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleReject(record)}
                        loading={processing}
                    >
                        Từ chối
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="refund-requests-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Yêu cầu hoàn tiền</Title>
                <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchRefundRequests}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 12 }}>
                {loading ? (
                    <Skeleton active paragraph={{ rows: 8 }} />
                ) : requests.length === 0 ? (
                    <Empty 
                        description="Không có yêu cầu hoàn tiền nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={requests}
                        rowKey="order_id"
                        pagination={{ 
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} yêu cầu`
                        }}
                    />
                )}
            </Card>

            {/* Detail Modal */}
            <Modal
                title={`Chi tiết yêu cầu hoàn tiền - ${selectedOrder?.order_code}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    <Button
                        key="reject"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => {
                            setDetailModalVisible(false);
                            handleReject(selectedOrder);
                        }}
                    >
                        Từ chối
                    </Button>,
                    <Button
                        key="approve"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => {
                            setDetailModalVisible(false);
                            handleApprove(selectedOrder);
                        }}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Duyệt hoàn tiền
                    </Button>
                ]}
                width={700}
            >
                {selectedOrder && (
                    <>
                        <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="Mã đơn hàng" span={2}>
                                <Text strong copyable>{selectedOrder.order_code}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {selectedOrder.customer_name || selectedOrder.user_name || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedOrder.customer_email || selectedOrder.user_email || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedOrder.customer_phone || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày đặt">
                                {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('vi-VN') : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sự kiện" span={2}>
                                <Text strong>{selectedOrder.event_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sự kiện">
                                {selectedOrder.event_date ? new Date(selectedOrder.event_date).toLocaleDateString('vi-VN') : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text type="success" strong style={{ fontSize: 16 }}>
                                    {selectedOrder.total_amount?.toLocaleString()} ₫
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>

                        <Title level={5}>Danh sách vé ({selectedOrder.tickets?.length || 0} vé)</Title>
                        <Table
                            size="small"
                            dataSource={selectedOrder.tickets || []}
                            rowKey="ticket_id"
                            pagination={false}
                            columns={[
                                {
                                    title: 'Mã vé',
                                    dataIndex: 'ticket_code',
                                    key: 'ticket_code',
                                    render: (code) => <Tag>{code}</Tag>
                                },
                                {
                                    title: 'Loại vé',
                                    dataIndex: 'type_name',
                                    key: 'type_name'
                                },
                                {
                                    title: 'Chỗ ngồi',
                                    dataIndex: 'seat_label',
                                    key: 'seat_label',
                                    render: (seat) => seat || 'Không có'
                                },
                                {
                                    title: 'Người sử dụng',
                                    dataIndex: 'holder_name',
                                    key: 'holder_name',
                                    render: (name) => name || 'N/A'
                                },
                                {
                                    title: 'Giá',
                                    dataIndex: 'price',
                                    key: 'price',
                                    align: 'right',
                                    render: (price) => `${price?.toLocaleString()} ₫`
                                }
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default RefundRequests;
