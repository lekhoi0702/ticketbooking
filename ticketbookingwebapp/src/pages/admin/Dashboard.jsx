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

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                        {value}
                    </Typography>
                    {trend && (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                            <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                +{trend}%
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Avatar
                    sx={{
                        bgcolor: `${color}.lighter`,
                        color: `${color}.main`,
                        width: 56,
                        height: 56
                    }}
                >
                    <Icon />
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

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
                setRecentEvents(eventsRes.data.slice(0, 10));
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

    const getStatusColor = (status) => {
        const colors = {
            'PUBLISHED': 'success',
            'PENDING_APPROVAL': 'warning',
            'APPROVED': 'info',
            'REJECTED': 'error',
            'DRAFT': 'default'
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PUBLISHED': 'Published',
            'PENDING_APPROVAL': 'Pending',
            'APPROVED': 'Approved',
            'REJECTED': 'Rejected',
            'DRAFT': 'Draft'
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Dashboard
                </Typography>
                <IconButton onClick={fetchData} color="primary">
                    <Refresh />
                </IconButton>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats.total_users.toLocaleString()}
                        icon={People}
                        color="primary"
                        trend={12}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Events"
                        value={stats.total_events}
                        icon={Event}
                        color="success"
                        trend={8}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Tickets Sold"
                        value={stats.total_tickets_sold.toLocaleString()}
                        icon={ConfirmationNumber}
                        color="warning"
                        trend={15}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Revenue"
                        value={formatCurrency(stats.total_revenue).replace('₫', 'VNĐ')}
                        icon={AttachMoney}
                        color="error"
                        trend={20}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Recent Events
                                </Typography>
                                <IconButton size="small" onClick={fetchData}>
                                    <Refresh fontSize="small" />
                                </IconButton>
                            </Box>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Event</TableCell>
                                            <TableCell>Organizer</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="center">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentEvents && recentEvents.length > 0 ? (
                                            recentEvents.map((event) => (
                                                <TableRow key={event.event_id} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar
                                                                src={event.banner_image_url?.startsWith('http') ? event.banner_image_url : `http://127.0.0.1:5000${event.banner_image_url}`}
                                                                variant="rounded"
                                                                sx={{ mr: 2, width: 50, height: 50 }}
                                                            />
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {event.event_name}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    ID: {event.event_id}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{event.organizer_name}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={event.category?.category_name || 'N/A'}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {new Date(event.start_datetime).toLocaleDateString('vi-VN')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getStatusLabel(event.status)}
                                                            color={getStatusColor(event.status)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            component={Link}
                                                            to="/admin/events"
                                                            size="small"
                                                            color="primary"
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                                                        No events found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
