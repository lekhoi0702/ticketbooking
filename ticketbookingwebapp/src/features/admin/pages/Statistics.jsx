import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, message, Row, Col, Statistic } from 'antd';
import { TrophyOutlined, DollarCircleOutlined, TeamOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';

const { Title, Text } = Typography;

const AdminStatistics = () => {
    const [loading, setLoading] = useState(true);
    const [organizerStats, setOrganizerStats] = useState([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        topOrganizer: null
    });

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

            if (ordersRes.success && eventsRes.success) {
                processStats(ordersRes.data, eventsRes.data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            message.error("Lỗi khi tải dữ liệu thống kê");
        } finally {
            setLoading(false);
        }
    };

    const processStats = (orders, events) => {
        // Map event_id to organizer info
        const eventMap = {};
        events.forEach(e => {
            eventMap[e.event_id] = {
                organizerName: e.organizer_name || 'N/A',
                eventName: e.event_name
            };
        });

        const statsMap = {};

        // Aggregate revenue by organizer
        orders.forEach(order => {
            if (order.order_status !== 'PAID') return; // Only count paid orders

            const eventInfo = eventMap[order.event_id];
            if (!eventInfo) return;

            const organizerName = eventInfo.organizerName;

            if (!statsMap[organizerName]) {
                statsMap[organizerName] = {
                    organizer: organizerName,
                    revenue: 0,
                    ordersCount: 0,
                    ticketsSold: 0
                };
            }

            statsMap[organizerName].revenue += order.total_amount || 0;
            statsMap[organizerName].ordersCount += 1;
            statsMap[organizerName].ticketsSold += (order.tickets ? order.tickets.length : 0); // Assuming tickets array exists or just count basic
            // Note: If order.tickets is not populated in getAllAdminOrders, we might just count 1 order.
            // But let's assume total_amount is accurate.
        });

        // Convert to array and sort
        const statsArray = Object.values(statsMap).sort((a, b) => b.revenue - a.revenue);

        // Add rank
        const rankedStats = statsArray.map((item, index) => ({
            ...item,
            rank: index + 1
        }));

        setOrganizerStats(rankedStats);

        // Calculate summary
        const totalRev = rankedStats.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrd = rankedStats.reduce((sum, item) => sum + item.ordersCount, 0);

        setSummary({
            totalRevenue: totalRev,
            totalOrders: totalOrd,
            topOrganizer: rankedStats.length > 0 ? rankedStats[0].organizer : 'N/A'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        {
            title: 'Hạng',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (rank) => {
                if (rank === 1) return <TrophyOutlined style={{ color: '#fadb14', fontSize: 24 }} />;
                if (rank === 2) return <TrophyOutlined style={{ color: '#d9d9d9', fontSize: 20 }} />;
                if (rank === 3) return <TrophyOutlined style={{ color: '#cf1322', fontSize: 18 }} />;
                return <Text strong>{rank}</Text>;
            },
            align: 'center'
        },
        {
            title: 'Nhà tổ chức',
            dataIndex: 'organizer',
            key: 'organizer',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'ordersCount',
            key: 'ordersCount',
            align: 'center',
            sorter: (a, b) => a.ordersCount - b.ordersCount,
        },
        {
            title: 'Tổng doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (val) => <Text strong style={{ color: '#389e0d' }}>{formatCurrency(val)}</Text>,
            sorter: (a, b) => a.revenue - b.revenue,
            defaultSortOrder: 'descend'
        }
    ];

    if (loading) return <AdminLoadingScreen tip="Đang tính toán số liệu..." />;

    return (
        <div>
            <Title level={3} style={{ marginBottom: 24 }}>Thống kê doanh thu theo Nhà tổ chức</Title>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu toàn sàn"
                            value={summary.totalRevenue}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarCircleOutlined />}
                            suffix="₫"
                            formatter={(value) => formatCurrency(value).replace('₫', '')}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng thành công"
                            value={summary.totalOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Nhà tổ chức Top 1"
                            value={summary.topOrganizer}
                            prefix={<TrophyOutlined style={{ color: '#fadb14' }} />}
                            valueStyle={{ fontSize: '1.2rem' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={organizerStats}
                    rowKey="organizer"
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default AdminStatistics;
