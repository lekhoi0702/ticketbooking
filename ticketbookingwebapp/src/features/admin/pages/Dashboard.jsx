import React, { useState, useEffect } from 'react';
import { api } from '@services/api';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@shared/utils/eventUtils';
import { formatLocaleDate } from '@shared/utils/dateUtils';
import {
    Grid,
    Card,
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
    CircularProgress
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import AdminToolbar from '@features/admin/components/AdminToolbar';



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
            'PUBLISHED': { color: 'success', label: 'Công khai', bg: '#ecfdf5', text: '#065f46' },
            'PENDING_APPROVAL': { color: 'warning', label: 'Chờ duyệt', bg: '#fffbeb', text: '#92400e' },
            'REJECTED': { color: 'error', label: 'Từ chối duyệt', bg: '#fef2f2', text: '#991b1b' },
            'CANCELLED': { color: 'default', label: 'Hủy', bg: '#f1f5f9', text: '#475569' },
            'DRAFT': { color: 'default', label: 'Nháp', bg: '#f8fafc', text: '#475569' }
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
                <AdminToolbar onRefresh={fetchData} refreshLoading={loading} />
            </Box>



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
                                                                src={getImageUrl(event.banner_image_url)}
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
                                                            {formatLocaleDate(event.start_datetime)}
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
                                                                fontSize: 16
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
