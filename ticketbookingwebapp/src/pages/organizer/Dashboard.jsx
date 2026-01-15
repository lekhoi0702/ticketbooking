import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Stack,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Paper,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    Event as EventIcon,
    AttachMoney as MoneyIcon,
    ConfirmationNumber as TicketIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { Snackbar, Alert, Button } from '@mui/material';

const StatCard = ({ title, value, icon, color, trend, link }) => (
    <Card
        sx={{
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s ease'
            },
            transition: 'all 0.3s ease'
        }}
    >
        <CardContent>
            <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: color }}>
                            {value}
                        </Typography>
                    </Box>
                    <Avatar
                        sx={{
                            bgcolor: `${color}15`,
                            color: color,
                            width: 56,
                            height: 56
                        }}
                    >
                        {icon}
                    </Avatar>
                </Stack>

                {trend && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            {trend}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            so với tháng trước
                        </Typography>
                    </Stack>
                )}

                {link && (
                    <Box
                        component={RouterLink}
                        to={link}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: color,
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            '&:hover': {
                                gap: 1,
                                transition: 'all 0.2s'
                            }
                        }}
                    >
                        Xem chi tiết
                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Box>
                )}
            </Stack>
        </CardContent>

        {/* Decorative background */}
        <Box
            sx={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: `${color}08`,
                zIndex: 0
            }}
        />
    </Card>
);

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
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                                Giao dịch gần đây
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Danh sách các đơn hàng mới nhất
                            </Typography>
                        </Box>
                        <Tooltip title="Làm mới">
                            <IconButton onClick={fetchStats} color="primary">
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Mã Đơn</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Khách Hàng</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Sự Kiện</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }} align="right">Tổng Tiền</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Thanh Toán</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Ngày</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }} align="center">Hành Động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.recentOrders.length > 0 ? (
                                    stats.recentOrders.map((order) => (
                                        <TableRow
                                            key={order.order_id}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontFamily: "'Roboto Mono', monospace",
                                                        fontWeight: 700,
                                                        color: 'primary.main',
                                                        bgcolor: 'rgba(45, 194, 117, 0.1)',
                                                        padding: '4px 12px',
                                                        borderRadius: '8px',
                                                        display: 'inline-block',
                                                        letterSpacing: '0.5px',
                                                        border: '1px solid rgba(45, 194, 117, 0.2)',
                                                        fontSize: '0.8rem'
                                                    }}
                                                >
                                                    {order.order_code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {order.customer_name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {order.customer_email}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        maxWidth: 250,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {order.event_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                                                    {formatCurrency(order.total_amount)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.payment_method || (order.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán')}
                                                    size="small"
                                                    color={order.payment_method === 'VNPAY' ? 'info' : (order.status === 'PAID' ? 'success' : 'default')}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {order.order_status === 'CANCELLATION_PENDING' || order.status === 'CANCELLATION_PENDING' ? (
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <Tooltip title="Duyệt Hủy">
                                                            <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleProcessCancellation(order.order_id, 'approve'); }}>
                                                                <CheckCircleIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Từ Chối">
                                                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleProcessCancellation(order.order_id, 'reject'); }}>
                                                                <CancelIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">---</Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                                <TicketIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                                                <Typography variant="h6" color="text.secondary">
                                                    Chưa có giao dịch nào
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Các đơn hàng mới sẽ hiển thị tại đây
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

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
