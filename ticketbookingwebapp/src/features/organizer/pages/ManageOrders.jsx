import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, Tag, Space, Typography, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';

const { Title, Text } = Typography;

const ManageOrders = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (user?.user_id) {
            fetchOrders(1, 10);
        }
    }, [user?.user_id]);

    const fetchOrders = async (page = 1, pageSize = 10, search = '') => {
        try {
            setLoading(true);
            const res = await api.getOrders(user.user_id, { page, limit: pageSize, search });
            if (res.success) {
                setOrders(res.data);
                setPagination({
                    current: res.pagination.page,
                    pageSize: res.pagination.limit,
                    total: res.pagination.total
                });
            }
        } catch (error) {
            console.error(error);
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pag) => {
        fetchOrders(pag.current, pag.pageSize, searchText);
    };

    const handleSearch = (val) => {
        setSearchText(val);
        fetchOrders(1, pagination.pageSize, val);
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
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.customer_email}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.customer_phone}</Text>
                </Space>
            )
        },
        {
            title: 'Ngày mua',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleString('vi-VN')
        },
        {
            title: 'Số vé',
            dataIndex: 'ticket_count',
            key: 'ticket_count',
            align: 'center',
            render: (count) => <Tag color="blue">{count} vé</Tag>
        },
        {
            title: 'Tổng thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (val) => <Text type="success" strong>{val.toLocaleString()} ₫</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = status === 'PAID' || status === 'COMPLETED' ? 'success' : 'default';
                if (status === 'PENDING') color = 'warning';
                if (status === 'CANCELLED' || status === 'REFUNDED') color = 'error';
                return <Tag color={color}>{status}</Tag>;
            }
        }
    ];

    const expandedRowRender = (record) => {
        const ticketColumns = [
            { title: 'Mã vé', dataIndex: 'code', key: 'code', render: t => <Tag>{t}</Tag> },
            { title: 'Sự kiện', dataIndex: 'event', key: 'event' },
            { title: 'Loại vé', dataIndex: 'type', key: 'type' },
            { title: 'Giá vé', dataIndex: 'price', key: 'price', render: p => `${p.toLocaleString()} ₫` },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: s => {
                    let color = 'default';
                    if (s === 'ACTIVE') color = 'green';
                    if (s === 'USED') color = 'gold';
                    if (s === 'EXPIRED') color = 'default';
                    if (s === 'CANCELLED' || s === 'REFUNDED') color = 'red';
                    return <Tag color={color}>{s === 'EXPIRED' ? 'HẾT HẠN' : s}</Tag>;
                }
            }
        ];
        return <Table columns={ticketColumns} dataSource={record.tickets} pagination={false} size="small" rowKey="code" />;
    };

    return (
        <div className="manage-orders-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2}>Quản lý Đơn hàng</Title>
                    <Text type="secondary">Danh sách đơn hàng và vé đã bán</Text>
                </div>
                <Button icon={<ReloadOutlined />} onClick={() => fetchOrders(pagination.current, pagination.pageSize, searchText)}>Làm mới</Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 12 }}>
                <div style={{ marginBottom: 16 }}>
                    <Input.Search
                        placeholder="Tìm theo mã đơn, khách hàng, email..."
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 400 }}
                        enterButton={<Button icon={<SearchOutlined />}>Tìm kiếm</Button>}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="order_id"
                    pagination={pagination}
                    onChange={handleTableChange}
                    loading={loading}
                    expandable={{ expandedRowRender, rowExpandable: record => record.tickets && record.tickets.length > 0 }}
                />
            </Card>
        </div>
    );
};

export default ManageOrders;
