import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Button, Space, message, Divider, Table } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, RollbackOutlined, CalendarOutlined, ReloadOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';

const { Title, Text } = Typography;

const OrganizerProfile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/organizer/login');
    };
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_tickets_sold: 0,
        refunded_tickets: 0,
        total_events: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.user_id) {
            fetchStats();
        }
    }, [user?.user_id]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.getOrganizerStats(user.user_id);
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            message.error('Không thể tải thống kê');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const bestSellingColumns = [
        { title: 'Sự kiện', dataIndex: 'event_name', key: 'event_name', ellipsis: true },
        { title: 'Đã bán', dataIndex: 'sold_tickets', key: 'sold_tickets', width: 100, align: 'center' },
        {
            title: 'Tỷ lệ',
            dataIndex: 'fill_rate',
            key: 'fill_rate',
            width: 100,
            align: 'right',
            render: (val) => <span style={{ color: val > 80 ? '#52c41a' : val > 50 ? '#faad14' : '#ff4d4f' }}>{val}%</span>
        },
    ];

    const revenueColumns = [
        { title: 'Sự kiện', dataIndex: 'event_name', key: 'event_name', ellipsis: true },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            width: 150,
            align: 'right',
            render: (val) => <span style={{ fontWeight: 'bold', color: '#3f8600' }}>{Number(val).toLocaleString()} ₫</span>
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2}>Tổng quan & Doanh thu</Title>
                    <Text type="secondary">Báo cáo hoạt động kinh doanh của bạn</Text>
                </div>
                <Button icon={<ReloadOutlined />} onClick={fetchStats} loading={loading}>
                    Làm mới
                </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ height: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Tổng doanh thu"
                            value={stats.total_revenue}
                            precision={0}
                            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ height: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Vé đã bán"
                            value={stats.total_tickets_sold}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ height: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Sự kiện"
                            value={stats.total_events}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ height: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic
                            title="Vé hoàn/Hủy"
                            value={stats.refunded_tickets}
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                            prefix={<RollbackOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} lg={12}>
                    <Card title="Sự kiện bán chạy nhất" bordered={false} style={{ borderRadius: 12 }}>
                        <Table
                            dataSource={stats.best_selling_events}
                            columns={bestSellingColumns}
                            pagination={false}
                            size="small"
                            rowKey="event_id"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Sự kiện doanh thu cao nhất" bordered={false} style={{ borderRadius: 12 }}>
                        <Table
                            dataSource={stats.revenue_events}
                            columns={revenueColumns}
                            pagination={false}
                            size="small"
                            rowKey="event_id"
                        />
                    </Card>
                </Col>
            </Row>

            <Divider orientation="left">Thông tin tài khoản</Divider>
            <Card style={{ borderRadius: 12 }}>
                <Row gutter={[24, 24]}>
                    <Col span={12} md={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Tên nhà tổ chức</Text>
                        <Title level={5} style={{ margin: 0 }}>{user?.full_name}</Title>
                    </Col>
                    <Col span={12} md={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Email</Text>
                        <Title level={5} style={{ margin: 0 }}>{user?.email}</Title>
                    </Col>
                    <Col span={12} md={8}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Vai trò</Text>
                        <div style={{ marginTop: 0 }}>
                            <Button size="small" type="primary" ghost>ORGANIZER</Button>
                        </div>
                    </Col>
                </Row>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" danger icon={<LogoutOutlined />} size="large" onClick={handleLogout}>
                        Đăng xuất hệ thống
                    </Button>
                </div>
            </Card>
        </div >
    );
};

export default OrganizerProfile;
