import React, { useState, useEffect } from 'react';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import {
    Box,
    Grid,
    Typography,
    Stack,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Event as EventIcon,
    AttachMoney as MoneyIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import StatCard from '@features/organizer/components/StatCard';
import RecentOrdersTable from '@features/organizer/components/RecentOrdersTable';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalRevenue: 0,
        totalTicketsSold: 0,
        recentOrders: []
    });
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    useEffect(() => {
        if (user?.user_id) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.getDashboardStats(user?.user_id || 1);
            if (res.success) {
                setStats({
                    totalEvents: res.data.total_events,
                    totalRevenue: res.data.total_revenue,
                    totalTicketsSold: res.data.total_tickets_sold,
                    recentOrders: res.data.recent_orders
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessCancellation = async (orderId, action) => {
        const confirmMsg = action === 'approve'
            ? "Đồng ý yêu cầu hủy đơn này? Tiền sẽ được hoàn lại (nếu có) và vé sẽ bị hủy."
            : "Từ chối yêu cầu hủy? Đơn hàng sẽ trở lại trạng thái Đã thanh toán.";

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await api.processOrderCancellation(orderId, action);
            if (res.success) {
                setToast({ show: true, message: action === 'approve' ? "Đã duyệt yêu cầu hủy" : "Đã từ chối yêu cầu hủy", variant: 'success' });
                fetchStats();
            }
        } catch (error) {
            setToast({ show: true, message: error.message, variant: 'error' });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" color="text.secondary">
                        Đang tải dữ liệu...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Chào mừng trở lại, {user?.full_name}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Đây là tổng quan về các sự kiện và hoạt động của bạn
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Tổng sự kiện"
                        value={stats.totalEvents}
                        icon={<EventIcon sx={{ fontSize: 28 }} />}
                        color="#2dc275"
                        trend="+12%"
                        link="/organizer/events"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Doanh thu"
                        value={formatCurrency(stats.totalRevenue).slice(0, -2)}
                        icon={<MoneyIcon sx={{ fontSize: 28 }} />}
                        color="#10b981"
                        trend="+23%"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Vé đã bán"
                        value={stats.totalTicketsSold.toLocaleString()}
                        icon={<TicketIcon sx={{ fontSize: 28 }} />}
                        color="#059669"
                        trend="+18%"
                        link="/organizer/events"
                    />
                </Grid>
            </Grid>

            {/* Recent Orders Table */}
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
