import React, { useState, useEffect, useMemo } from 'react';
import { Card, Table, Typography, App, Row, Col, Statistic, Select, Space } from 'antd';
import { TrophyOutlined, DollarCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminToolbar from '@features/admin/components/AdminToolbar';

const { Text } = Typography;

const AdminStatistics = () => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(true);
    const [organizerStats, setOrganizerStats] = useState([]);
    const [eventRevenueStats, setEventRevenueStats] = useState([]);
    const [multiShowEvents, setMultiShowEvents] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        topOrganizer: 'N/A',
        multiShowEventCount: 0,
    });

    const monthOptions = useMemo(
        () => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` })),
        []
    );

    const yearOptions = useMemo(() => {
        const current = dayjs().year();
        return [current - 2, current - 1, current, current + 1].map((y) => ({ value: y, label: `Nam ${y}` }));
    }, []);

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, eventsRes] = await Promise.all([
                api.getAllAdminOrders(),
                api.getAllAdminEvents(),
            ]);

            if (ordersRes.success && eventsRes.success) {
                processStats(ordersRes.data || [], eventsRes.data || []);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            message.error('L?i khi t?i d? li?u th?ng kê');
        } finally {
            setLoading(false);
        }
    };

    const inSelectedMonthYear = (input) => {
        if (!input) return false;
        const date = dayjs(input);
        if (!date.isValid()) return false;
        return date.month() + 1 === selectedMonth && date.year() === selectedYear;
    };

    const processStats = (orders, events) => {
        const eventMapById = {};
        events.forEach((e) => {
            eventMapById[e.event_id] = {
                organizerName: e.organizer_name || 'N/A',
                eventName: e.event_name || `Event #${e.event_id}`,
                startDate: e.start_datetime || e.start_date || null,
            };
        });

        const filteredOrders = orders.filter((o) => inSelectedMonthYear(o.created_at || o.order_date || o.CreatedAt || o.OrderDate));
        const filteredEvents = events.filter((e) => inSelectedMonthYear(e.start_datetime || e.start_date || e.StartDate));

        const organizerMap = {};
        const eventRevenueMap = {};

        filteredOrders.forEach((order) => {
            if (String(order.order_status || '').toUpperCase() !== 'PAID') return;

            const eventInfo = eventMapById[order.event_id];
            if (!eventInfo) return;

            const organizerName = eventInfo.organizerName;
            if (!organizerMap[organizerName]) {
                organizerMap[organizerName] = {
                    organizer: organizerName,
                    revenue: 0,
                    ordersCount: 0,
                };
            }
            organizerMap[organizerName].revenue += Number(order.total_amount || 0);
            organizerMap[organizerName].ordersCount += 1;

            if (!eventRevenueMap[order.event_id]) {
                eventRevenueMap[order.event_id] = {
                    event_id: order.event_id,
                    event_name: eventInfo.eventName,
                    organizer_name: organizerName,
                    paid_orders: 0,
                    revenue: 0,
                };
            }
            eventRevenueMap[order.event_id].paid_orders += 1;
            eventRevenueMap[order.event_id].revenue += Number(order.total_amount || 0);
        });

        const organizerRows = Object.values(organizerMap)
            .sort((a, b) => b.revenue - a.revenue)
            .map((row, idx) => ({ ...row, rank: idx + 1 }));

        const eventRows = Object.values(eventRevenueMap).sort((a, b) => b.revenue - a.revenue);

        const byEventName = {};
        filteredEvents.forEach((event) => {
            const key = String(event.event_name || '').trim().toLowerCase();
            if (!key) return;
            if (!byEventName[key]) {
                byEventName[key] = {
                    event_name: event.event_name,
                    show_count: 0,
                    latest_start_datetime: event.start_datetime || event.start_date || event.StartDate || null,
                };
            }
            byEventName[key].show_count += 1;
            const candidate = dayjs(event.start_datetime || event.start_date || event.StartDate);
            const currentLatest = dayjs(byEventName[key].latest_start_datetime);
            if (candidate.isValid() && (!currentLatest.isValid() || candidate.isAfter(currentLatest))) {
                byEventName[key].latest_start_datetime = event.start_datetime || event.start_date || event.StartDate;
            }
        });
        const multiShowRows = Object.values(byEventName)
            .filter((x) => x.show_count > 1)
            .sort((a, b) => b.show_count - a.show_count);

        setOrganizerStats(organizerRows);
        setEventRevenueStats(eventRows);
        setMultiShowEvents(multiShowRows);

        setSummary({
            totalRevenue: organizerRows.reduce((sum, r) => sum + Number(r.revenue || 0), 0),
            totalOrders: organizerRows.reduce((sum, r) => sum + Number(r.ordersCount || 0), 0),
            topOrganizer: organizerRows[0]?.organizer || 'N/A',
            multiShowEventCount: multiShowRows.length,
        });
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    const organizerColumns = [
        {
            title: 'H?ng',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            align: 'center',
            render: (rank) => {
                if (rank === 1) return <TrophyOutlined style={{ color: '#fadb14', fontSize: 16 }} />;
                if (rank === 2) return <TrophyOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />;
                if (rank === 3) return <TrophyOutlined style={{ color: '#cf1322', fontSize: 16 }} />;
                return <Text strong>{rank}</Text>;
            },
        },
        { title: 'Nhà t? ch?c', dataIndex: 'organizer', key: 'organizer', render: (text) => <Text strong>{text}</Text> },
        { title: 'S? don hàng', dataIndex: 'ordersCount', key: 'ordersCount', align: 'center' },
        {
            title: 'T?ng doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (val) => <Text strong style={{ color: '#389e0d' }}>{formatCurrency(val)}</Text>,
        },
    ];

    const eventRevenueColumns = [
        { title: 'S? ki?n', dataIndex: 'event_name', key: 'event_name', render: (text) => <Text strong>{text}</Text> },
        { title: 'Nhà t? ch?c', dataIndex: 'organizer_name', key: 'organizer_name' },
        { title: 'Ðon PAID', dataIndex: 'paid_orders', key: 'paid_orders', align: 'center' },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (val) => <Text strong style={{ color: '#389e0d' }}>{formatCurrency(val)}</Text>,
        },
    ];

    const multiShowColumns = [
        { title: 'S? ki?n', dataIndex: 'event_name', key: 'event_name' },
        { title: 'S? bu?i', dataIndex: 'show_count', key: 'show_count', align: 'center' },
        {
            title: 'Bu?i g?n nh?t',
            dataIndex: 'latest_start_datetime',
            key: 'latest_start_datetime',
            render: (value) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'N/A'),
        },
    ];

    if (loading) return <AdminLoadingScreen tip="Ðang tính toán s? li?u..." />;

    return (
        <div style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Space>
                    <Select value={selectedMonth} onChange={setSelectedMonth} options={monthOptions} style={{ width: 140 }} />
                    <Select value={selectedYear} onChange={setSelectedYear} options={yearOptions} style={{ width: 140 }} />
                </Space>
                <AdminToolbar onRefresh={fetchData} refreshLoading={loading} />
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="T?ng doanh thu toàn sàn"
                            value={summary.totalRevenue}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarCircleOutlined />}
                            suffix="?"
                            formatter={(value) => formatCurrency(value).replace('?', '')}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="T?ng don hàng thành công"
                            value={summary.totalOrders}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Nhà t? ch?c Top 1"
                            value={summary.topOrganizer}
                            prefix={<TrophyOutlined style={{ color: '#fadb14' }} />}
                            valueStyle={{ fontSize: 16 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className="shadow-sm" title="X?p h?ng nhà t? ch?c">
                <Table columns={organizerColumns} dataSource={organizerStats} rowKey="organizer" pagination={{ pageSize: 20 }} />
            </Card>

            <Card className="shadow-sm" style={{ marginTop: 24 }} title="Doanh thu theo s? ki?n">
                <Table
                    columns={eventRevenueColumns}
                    dataSource={eventRevenueStats}
                    rowKey={(row) => String(row.event_id)}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Card
                className="shadow-sm"
                style={{ marginTop: 24 }}
                title={`S? ki?n có nhi?u bu?i bi?u di?n (${summary.multiShowEventCount})`}
            >
                <Table
                    columns={multiShowColumns}
                    dataSource={multiShowEvents}
                    rowKey={(row) => `${row.event_name}-${row.latest_start_datetime}`}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default AdminStatistics;
