import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, Tag, Space, Typography, message, Skeleton, DatePicker, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ManageOrders = () => {
    const { user, organizer } = useAuth();
    const actor = organizer || user;
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        if (actor?.user_id) {
            fetchOrders(1, 10);
        }
    }, [actor?.user_id]);

    useEffect(() => {
        applyFilters();
    }, [orders, searchText, dateRange]);

    const fetchOrders = async (page = 1, pageSize = 10, search = '') => {
        if (!actor?.user_id) return;
        try {
            setLoading(true);
            const res = await api.getOrders(actor.user_id, { page, limit: pageSize, search });
            if (res.success) {
                setOrders(Array.isArray(res.data) ? res.data : []);
                setPagination({
                    current: res.pagination?.page || page,
                    pageSize: res.pagination?.limit || pageSize,
                    total: res.pagination?.total || 0
                });
            }
        } catch (error) {
            console.error(error);
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...orders];

    // Filter by search text
        if (searchText) {
       filtered = filtered.filter(order => 
   order.order_code?.toLowerCase().includes(searchText.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchText.toLowerCase()) ||
       order.customer_email?.toLowerCase().includes(searchText.toLowerCase()) ||
       order.customer_phone?.includes(searchText)
            );
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {
 filtered = filtered.filter(order => {
    const orderDate = dayjs(order.created_at);
      return orderDate.isAfter(dateRange[0].startOf('day').subtract(1, 'ms')) &&
        orderDate.isBefore(dateRange[1].endOf('day').add(1, 'ms'));
            });
}

        setFilteredOrders(filtered);
        setPagination(prev => ({ ...prev, total: filtered.length }));
    };

    const handleTableChange = (pag) => {
      setPagination(pag);
    };

    const handleSearch = (val) => {
        setSearchText(val);
        setPagination(prev => ({ ...prev, current: 1 }));
};

    const handleDateRangeChange = (dates) => {
  setDateRange(dates);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleRefresh = () => {
 setSearchText('');
  setDateRange(null);
     fetchOrders(1, pagination.pageSize);
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
                <div>
                    <div><Text strong>{record.customer_name || 'N/A'}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: 12 }}>Email: {record.customer_email || 'N/A'}</Text></div>
                    <div><Text type="secondary" style={{ fontSize: 12 }}>SĐT: {record.customer_phone || 'N/A'}</Text></div>
                </div>
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
        return <Table columns={ticketColumns} dataSource={record.Ticket} pagination={false} size="small" rowKey="code" />;
    };

    return (
        <div className="manage-orders-page">
   <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
       <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Làm mới</Button>
          </div>

        <Card bordered={false} style={{ borderRadius: 12 }}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={10}>
       <div style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c' }}>TÌM KIẾM</div>
             <Input.Search
         placeholder="Tìm theo mã đơn, khách hàng, email..."
                   allowClear
      onSearch={handleSearch}
  onChange={(e) => !e.target.value && setSearchText('')}
     value={searchText}
   enterButton={<Button icon={<SearchOutlined />}>Tìm kiếm</Button>}
         />
            </Col>
          <Col xs={24} sm={12} md={10}>
     <div style={{ marginBottom: 8, fontWeight: 600, color: '#8c8c8c' }}>LỌC THEO NGÀY MUA</div>
             <RangePicker
       style={{ width: '100%' }}
        format="DD/MM/YYYY"
         placeholder={['Từ ngày', 'Đến ngày']}
         onChange={handleDateRangeChange}
        value={dateRange}
    allowClear
  />
 </Col>
   </Row>

                {loading ? (
    <div style={{ padding: 20 }}>
       <Skeleton active paragraph={{ rows: 10 }} />
         </div>
         ) : (
        <Table
   columns={columns}
   dataSource={filteredOrders}
         rowKey="order_id"
     pagination={pagination}
        onChange={handleTableChange}
       loading={false}
           expandable={{
            expandedRowRender,
             rowExpandable: record => record.Ticket && record.Ticket.length > 0,
    expandRowByClick: true
               }}
       />
       )}
 </Card>
    </div>
    );
};

export default ManageOrders;
