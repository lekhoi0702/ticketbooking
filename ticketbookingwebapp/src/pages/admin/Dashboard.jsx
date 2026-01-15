import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Paper,
    CircularProgress
} from '@mui/material';
import {
    TrendingUp,
    People,
    Event,
    ConfirmationNumber,
    AttachMoney,
    Visibility,
    Refresh
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color, trend }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        sx={{
                            bgcolor: `${color}.light`,
                            color: `${color}.main`,
                            width: 48,
                            height: 48,
                            borderRadius: 1.5
                        }}
                    >
                        <Icon />
                    </Avatar>
                    <Box sx={{ ml: 'auto' }}>
                        {trend && (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'success.main',
                                    fontWeight: 600,
                                    bgcolor: 'success.light',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1
                                }}
                            >
                                +{trend}%
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_users: 0,
        total_events: 0,
        total_revenue: 0,
        total_tickets_sold: 0
    });
    const [recentEvents, setRecentEvents] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, eventsRes] = await Promise.all([
                api.getAdminStats(),
                api.getAllAdminEvents()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (eventsRes.success) {
                setRecentEvents(eventsRes.data.slice(0, 8));
            }
        } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PUBLISHED': { color: 'success', label: 'Published', bg: '#ecfdf5', text: '#065f46' },
            'PENDING_APPROVAL': { color: 'warning', label: 'Pending', bg: '#fffbeb', text: '#92400e' },
            'APPROVED': { color: 'info', label: 'Approved', bg: '#eff6ff', text: '#1e40af' },
            'REJECTED': { color: 'error', label: 'Rejected', bg: '#fef2f2', text: '#991b1b' },
            'DRAFT': { color: 'default', label: 'Draft', bg: '#f8fafc', text: '#475569' }
        };
        return configs[status] || { color: 'default', label: status, bg: '#f1f5f9', text: '#475569' };
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={40} thickness={4} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', pb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Dashboard Tổng Quan
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Thống kê hoạt động và dữ liệu mới nhất trên toàn hệ thống.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchData}
                    size="small"
                    sx={{ color: 'text.secondary', borderColor: 'divider' }}
                >
                    Làm mới
                </Button>
            </Box>

            {/* Stats Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Người dùng hệ thống"
                        value={stats.total_users.toLocaleString()}
                        icon={People}
                        color="primary"
                        trend={12}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Sự kiện tổ chức"
                        value={stats.total_events}
                        icon={Event}
                        color="success"
                        trend={8}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Vé đã bán ra"
                        value={stats.total_tickets_sold.toLocaleString()}
                        icon={ConfirmationNumber}
                        color="warning"
                        trend={15}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Tổng doanh thu"
                        value={formatCurrency(stats.total_revenue).replace('₫', 'đ')}
                        icon={AttachMoney}
                        color="error"
                        trend={20}
                    />
                </Grid>
            </Grid>

            {/* Main Content Sections */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <Box sx={{ p: 2, borderBottom: '1px solid #EBEEF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                Sự kiện mới cập nhật
                            </Typography>
                        </Box>
                        <TableContainer>
                            <Table sx={{ minWidth: 800 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>SỰ KIỆN</TableCell>
                                        <TableCell>NGƯỜI TỔ CHỨC</TableCell>
                                        <TableCell>PHÂN LOẠI</TableCell>
                                        <TableCell>NGÀY DIỄN RA</TableCell>
                                        <TableCell>TRẠNG THÁI</TableCell>
                                        <TableCell align="center">THAO TÁC</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentEvents && recentEvents.length > 0 ? (
                                        recentEvents.map((event) => {
                                            const status = getStatusConfig(event.status);
                                            return (
                                                <TableRow key={event.event_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ py: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar
                                                                src={event.banner_image_url?.startsWith('http') ? event.banner_image_url : `http://127.0.0.1:5000${event.banner_image_url}`}
                                                                variant="rounded"
                                                                sx={{ mr: 2, width: 44, height: 44, borderRadius: 2 }}
                                                            />
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                                                    {event.event_name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    ID: #{event.event_id}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.organizer_name}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={event.category?.category_name || 'N/A'}
                                                            size="small"
                                                            sx={{ borderRadius: 1.5, fontWeight: 500, bgcolor: '#f1f5f9' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {new Date(event.start_datetime).toLocaleDateString('vi-VN')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={status.label}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: status.bg,
                                                                color: status.text,
                                                                fontWeight: 700,
                                                                borderRadius: 1.5,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            component={Link}
                                                            to="/admin/events"
                                                            size="small"
                                                            sx={{ bgcolor: '#eff6ff', color: '#2563eb', '&:hover': { bgcolor: '#dbeafe' } }}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    Không tìm thấy dữ liệu sự kiện
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                            <Button
                                component={Link}
                                to="/admin/events"
                                size="small"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Xem tất cả sự kiện
                            </Button>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
