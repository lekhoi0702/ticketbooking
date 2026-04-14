import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import {
    Box,
    Grid,
    Typography,
    Snackbar,
    Alert,
    Skeleton,
    Card,
    CardHeader,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
} from '@mui/material';
import {
    Event as EventIcon,
    AttachMoney as MoneyIcon,
    ConfirmationNumber as TicketIcon,
} from '@mui/icons-material';
import StatCard from '@features/organizer/components/StatCard';
import RecentOrdersTable from '@features/organizer/components/RecentOrdersTable';

const Dashboard = () => {
    const { user } = useAuth();
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalRevenue: 0,
        totalTicketsSold: 0,
        recentOrders: [],
        eventRevenueStats: [],
        multiShowEvents: [],
    });
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    const monthOptions = useMemo(
        () => Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` })),
        []
    );

    const yearOptions = useMemo(() => {
        const current = new Date().getFullYear();
        return [current - 2, current - 1, current, current + 1];
    }, []);

    useEffect(() => {
        if (user?.user_id) {
            fetchStats();
        }
    }, [user, selectedMonth, selectedYear]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.getDashboardStats(user?.user_id || 1, {
                month: selectedMonth,
                year: selectedYear,
            });
            if (res.success) {
                setStats({
                    totalEvents: res.data.total_events,
                    totalRevenue: res.data.total_revenue,
                    totalTicketsSold: res.data.total_tickets_sold,
                    recentOrders: res.data.recent_orders || [],
                    eventRevenueStats: res.data.event_revenue_stats || [],
                    multiShowEvents: res.data.multi_show_events || [],
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessCancellation = async (orderId, action) => {
        const confirmMsg =
            action === 'approve'
                ? 'Ð?ng ý yêu c?u h?y don này? Ti?n s? du?c hoàn l?i (n?u có) và vé s? b? h?y.'
                : 'T? ch?i yêu c?u h?y? Ðon hàng s? tr? l?i tr?ng thái Ðã thanh toán.';

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await api.processOrderCancellation(orderId, action);
            if (res.success) {
                setToast({
                    show: true,
                    message: action === 'approve' ? 'Ðã duy?t yêu c?u h?y' : 'Ðã t? ch?i yêu c?u h?y',
                    variant: 'success',
                });
                fetchStats();
            }
        } catch (error) {
            setToast({ show: true, message: error.message, variant: 'error' });
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    if (loading) {
        return (
            <Box>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width={400} height={24} />
                </Box>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {[1, 2, 3].map((item) => (
                        <Grid item xs={12} sm={6} md={4} key={item}>
                            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Chào m?ng tr? l?i, {user?.full_name}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        T?ng quan ho?t d?ng theo th?i gian b?n ch?n
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Tháng</InputLabel>
                        <Select label="Tháng" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                            {monthOptions.map((m) => (
                                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 130 }}>
                        <InputLabel>Nam</InputLabel>
                        <Select label="Nam" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                            {yearOptions.map((y) => (
                                <MenuItem key={y} value={y}>{`Nam ${y}`}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="T?ng s? ki?n"
                        value={stats.totalEvents}
                        icon={<EventIcon sx={{ fontSize: 28 }} />}
                        color="#2dc275"
                        link="/organizer/events"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Doanh thu"
                        value={formatCurrency(stats.totalRevenue).slice(0, -2)}
                        icon={<MoneyIcon sx={{ fontSize: 28 }} />}
                        color="#10b981"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Vé dã bán"
                        value={stats.totalTicketsSold.toLocaleString()}
                        icon={<TicketIcon sx={{ fontSize: 28 }} />}
                        color="#059669"
                        link="/organizer/events"
                    />
                </Grid>
            </Grid>

            <Card sx={{ mb: 3 }}>
                <CardHeader title="Doanh thu theo s? ki?n" />
                <CardContent>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>S? ki?n</TableCell>
                                    <TableCell align="center">Ðon PAID</TableCell>
                                    <TableCell align="right">Doanh thu</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.eventRevenueStats.map((row) => (
                                    <TableRow key={row.event_id}>
                                        <TableCell>{row.event_name}</TableCell>
                                        <TableCell align="center">{row.paid_orders}</TableCell>
                                        <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                                    </TableRow>
                                ))}
                                {stats.eventRevenueStats.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">Không có d? li?u</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardHeader title={`S? ki?n có nhi?u bu?i bi?u di?n (${stats.multiShowEvents.length})`} />
                <CardContent>
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>S? ki?n</TableCell>
                                    <TableCell align="center">S? bu?i</TableCell>
                                    <TableCell>Bu?i g?n nh?t</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.multiShowEvents.map((row) => (
                                    <TableRow key={`${row.event_name}-${row.latest_start_datetime}`}>
                                        <TableCell>{row.event_name}</TableCell>
                                        <TableCell align="center">{row.show_count}</TableCell>
                                        <TableCell>
                                            {row.latest_start_datetime
                                                ? new Date(row.latest_start_datetime).toLocaleString('vi-VN')
                                                : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {stats.multiShowEvents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">Không có d? li?u</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <RecentOrdersTable
                orders={stats.recentOrders}
                onProcessCancellation={handleProcessCancellation}
                onRefresh={fetchStats}
            />

            <Snackbar
                open={toast.show}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, show: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={toast.variant} sx={{ width: '100%', borderRadius: 2 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Dashboard;
