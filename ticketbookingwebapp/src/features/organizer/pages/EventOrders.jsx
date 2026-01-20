import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Modal,
    message,
    Typography,
    Input,
    Select,
    Alert
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
    BellOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { api } from '@services/api';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import OrderDetailModal from '@features/organizer/components/OrderDetailModal';

// Configure dayjs for Vietnam timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const EventOrders = () => {
    const { eventId } = useParams();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [event, setEvent] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, [eventId]);

    useEffect(() => {
        filterOrders();
    }, [orders, searchText, statusFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, eventRes] = await Promise.all([
                api.getEventOrders(eventId),
                api.getEvent(eventId)
            ]);

            if (ordersRes.success) {
                setOrders(ordersRes.data);
            }
            if (eventRes.success) {
                setEvent(eventRes.data);
            }
        } catch (error) {
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        if (searchText) {
            filtered = filtered.filter(
                (order) =>
                    order.order_code?.toLowerCase().includes(searchText.toLowerCase()) ||
                    order.customer_email?.toLowerCase().includes(searchText.toLowerCase()) ||
                    order.customer_phone?.includes(searchText)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((order) => order.order_status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

    const handleApproveRefund = (order) => {
        confirm({
            title: 'Xác nhận duyệt hoàn tiền',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn duyệt yêu cầu hoàn tiền cho đơn hàng ${order.order_code}? Vé sẽ bị hủy và không thể khôi phục.`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const res = await api.approveRefund(order.order_id);
                    if (res.success) {
                        message.success('Đã duyệt hoàn tiền thành công!');
                        fetchData();
                    }
                } catch (error) {
                    message.error(error.message || 'Có lỗi xảy ra');
                }
            },
        });
    };

    const handleRejectRefund = (order) => {
        confirm({
            title: 'Xác nhận từ chối hoàn tiền',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn từ chối yêu cầu hoàn tiền cho đơn hàng ${order.order_code}?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await api.rejectRefund(order.order_id);
                    if (res.success) {
                        message.success('Đã từ chối yêu cầu hoàn tiền!');
                        fetchData();
                    }
                } catch (error) {
                    message.error(error.message || 'Có lỗi xảy ra');
                }
            },
        });
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            PAID: { color: 'success', text: 'Đã thanh toán' },
            PENDING: { color: 'warning', text: 'Chờ thanh toán' },
            CANCELLED: { color: 'error', text: 'Đã hủy' },
            COMPLETED: { color: 'blue', text: 'Hoàn thành' },
            CANCELLATION_PENDING: { color: 'processing', text: 'Chờ duyệt hoàn tiền' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_code',
            key: 'order_code',
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <div><Text strong>{record.customer_name || 'N/A'}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: 12 }}>Email: {record.customer_email}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: 12 }}>SĐT: {record.customer_phone || 'N/A'}</Text></div>
                </div>
            ),
        },
        {
            title: 'Số vé',
            dataIndex: 'tickets_count',
            key: 'tickets_count',
            width: 80,
            align: 'center',
            render: (count) => <Tag>{count} vé</Tag>,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            width: 130,
            render: (amount) => (
                <Text strong style={{ color: '#2DC275' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
                </Text>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date) => dayjs.utc(date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'order_status',
            key: 'order_status',
            width: 180,
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedOrder(record);
                            setShowDetailModal(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.order_status === 'CANCELLATION_PENDING' && (
                        <>
                            <Button
                                type="text"
                                icon={<CheckCircleOutlined />}
                                style={{ color: '#2DC275' }}
                                onClick={() => handleApproveRefund(record)}
                            >
                                Duyệt
                            </Button>
                            <Button
                                type="text"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleRejectRefund(record)}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    if (loading) {
        return <LoadingSpinner tip="Đang tải danh sách đơn hàng..." />;
    }

    return (
        <div style={{ paddingTop: 0 }}>
            {
                filteredOrders.filter(o => o.order_status === 'CANCELLATION_PENDING').length > 0 && (
                    <Alert
                        message={`Có ${filteredOrders.filter(o => o.order_status === 'CANCELLATION_PENDING').length} yêu cầu hoàn tiền chờ xử lý`}
                        description="Vui lòng xem xét và phê duyệt/từ chối các yêu cầu hoàn tiền từ khách hàng."
                        type="warning"
                        showIcon
                        icon={<BellOutlined />}
                        style={{ marginBottom: 16 }}
                        closable
                    />
                )
            }

            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>

                <Space>
                    <Input
                        placeholder="Tìm theo mã đơn, email, SĐT"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 200 }}
                    >
                        <Option value="all">Tất cả trạng thái</Option>
                        <Option value="PAID">Đã thanh toán</Option>
                        <Option value="PENDING">Chờ thanh toán</Option>
                        <Option value="CANCELLATION_PENDING">Chờ duyệt hoàn tiền</Option>
                        <Option value="CANCELLED">Đã hủy</Option>
                        <Option value="COMPLETED">Hoàn thành</Option>
                    </Select>
                </Space>
                <Button icon={<ReloadOutlined />} onClick={fetchData}>
                    Làm mới
                </Button>
            </Space >

            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="order_id"
                    pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} đơn hàng` }}
                    locale={{ emptyText: 'Chưa có đơn hàng nào' }}
                />
            </Card>

            {/* Order Detail Modal */}
            <OrderDetailModal
                open={showDetailModal}
                order={selectedOrder}
                onCancel={() => setShowDetailModal(false)}
                getStatusTag={getStatusTag}
            />
        </div >
    );
};

export default EventOrders;
