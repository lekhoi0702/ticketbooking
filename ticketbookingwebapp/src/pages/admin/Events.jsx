import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Chip,
    Avatar,
    Stack,
    Dialog,
    DialogContent,
    DialogActions,
    Grid,
    CircularProgress,
    Switch,
    Tooltip,
    Snackbar,
    Alert,
    Divider
} from '@mui/material';
import {
    Refresh,
    Visibility,
    CheckCircle,
    Cancel,
    LocationOn,
    CalendarMonth,
    Shield,
    Star,
    StarBorder
} from '@mui/icons-material';
import { api } from '../../services/api';

const AdminEventsManagement = () => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.getAllAdminEvents();
            if (res.success) setEvents(res.data);
        } catch (error) {
            console.error("Error fetching admin events:", error);
            showToast("Error fetching events", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    const handleUpdateStatus = async (eventId, newStatus) => {
        try {
            setActionLoading(true);
            const formData = new FormData();
            formData.append('status', newStatus);
            const res = await api.adminUpdateEventStatus(eventId, formData);
            if (res.success) {
                showToast(`Event status updated to ${newStatus}`);
                setShowModal(false);
                fetchEvents();
            }
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleFeatured = async (event) => {
        try {
            const formData = new FormData();
            formData.append('is_featured', !event.is_featured);
            const res = await api.adminUpdateEventStatus(event.event_id, formData);
            if (res.success) {
                showToast("Featured status updated");
                fetchEvents();
            }
        } catch (error) {
            showToast(error.message, "error");
        }
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
            'PENDING_APPROVAL': 'Pending Approval',
            'APPROVED': 'Approved',
            'REJECTED': 'Rejected',
            'DRAFT': 'Draft'
        };
        return labels[status] || status;
    };

    if (loading && events.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    const pendingCount = events.filter(e => e.status === 'PENDING_APPROVAL').length;

    return (
        <Box>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Events Approval
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Review and manage event publication across the platform
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchEvents}
                    sx={{ borderRadius: 1.5 }}
                >
                    Refresh
                </Button>
            </Stack>

            {pendingCount > 0 && (
                <Alert
                    severity="info"
                    icon={<Shield fontSize="inherit" />}
                    sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        There are {pendingCount} events waiting for your approval.
                    </Typography>
                    <Button size="small" variant="contained" color="info" sx={{ ml: 2, borderRadius: 1 }}>
                        Review Now
                    </Button>
                </Alert>
            )}

            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                <TableContainer>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, px: 3 }}>Banner</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Event Details</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Organizer</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Featured</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.event_id} hover sx={{ bgcolor: event.status === 'PENDING_APPROVAL' ? 'warning.lighter' : 'inherit' }}>
                                    <TableCell sx={{ px: 3 }}>
                                        <Avatar
                                            src={event.banner_image_url?.startsWith('http') ? event.banner_image_url : `http://127.0.0.1:5000${event.banner_image_url}`}
                                            variant="rounded"
                                            sx={{ width: 80, height: 45, boxShadow: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                            {event.event_name}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: 200 }}>
                                                {event.venue_name}
                                            </Typography>
                                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 12 }} />
                                            <CalendarMonth sx={{ fontSize: 14, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="textSecondary">
                                                {new Date(event.start_datetime).toLocaleDateString('vi-VN')}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{event.organizer_name?.charAt(0)}</Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.organizer_name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={getStatusLabel(event.status)}
                                            color={getStatusColor(event.status)}
                                            size="small"
                                            sx={{ borderRadius: 1, fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={event.is_featured ? "Featured" : "Mark as Featured"}>
                                            <IconButton
                                                size="small"
                                                color={event.is_featured ? "warning" : "default"}
                                                onClick={() => toggleFeatured(event)}
                                            >
                                                {event.is_featured ? <Star /> : <StarBorder />}
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }}>
                                        <Button
                                            variant={event.status === 'PENDING_APPROVAL' ? "contained" : "outlined"}
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                                            sx={{ borderRadius: 1.5 }}
                                        >
                                            {event.status === 'PENDING_APPROVAL' ? 'Review' : 'Details'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Event Details and Approval Dialog */}
            <Dialog
                open={showModal}
                onClose={() => setShowModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
            >
                {selectedEvent && (
                    <>
                        <Box sx={{ position: 'relative', height: 250 }}>
                            <img
                                src={selectedEvent.banner_image_url?.startsWith('http') ? selectedEvent.banner_image_url : `http://127.0.0.1:5000${selectedEvent.banner_image_url}`}
                                alt="Banner"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 3,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                color: 'white'
                            }}>
                                <Chip
                                    label={selectedEvent.category?.category_name || 'Event'}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1, backdropFilter: 'blur(4px)' }}
                                />
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{selectedEvent.event_name}</Typography>
                            </Box>
                        </Box>
                        <DialogContent sx={{ p: 4 }}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={7}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Description</Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8 }}>
                                        {selectedEvent.description || 'No detailed description provided.'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Summary Information</Typography>
                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main' }}>
                                                    <Shield />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="textSecondary">ORGANIZER</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEvent.organizer_name}</Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'success.lighter', color: 'success.main' }}>
                                                    <LocationOn />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="textSecondary">VENUE</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedEvent.venue_name}</Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'warning.lighter', color: 'warning.main' }}>
                                                    <CalendarMonth />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="caption" color="textSecondary">DATE & TIME</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {new Date(selectedEvent.start_datetime).toLocaleString('vi-VN')}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, bgcolor: 'grey.50', justifyContent: 'space-between' }}>
                            <Button onClick={() => setShowModal(false)} color="inherit">Close</Button>
                            <Stack direction="row" spacing={2}>
                                {selectedEvent.status === 'PENDING_APPROVAL' && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            sx={{ px: 4, borderRadius: 1.5 }}
                                            onClick={() => handleUpdateStatus(selectedEvent.event_id, 'REJECTED')}
                                            disabled={actionLoading}
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ px: 4, borderRadius: 1.5 }}
                                            onClick={() => handleUpdateStatus(selectedEvent.event_id, 'APPROVED')}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? <CircularProgress size={24} /> : 'Approve Now'}
                                        </Button>
                                    </>
                                )}
                                {(selectedEvent.status === 'APPROVED' || selectedEvent.status === 'PUBLISHED') && (
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="outlined"
                                            color="warning"
                                            onClick={() => handleUpdateStatus(selectedEvent.event_id, 'PENDING_APPROVAL')}
                                            disabled={actionLoading}
                                        >
                                            Revoke Approval
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to CANCEL this event? This action is serious.")) {
                                                    handleUpdateStatus(selectedEvent.event_id, 'REJECTED'); // Using REJECTED as Cancelled for now
                                                }
                                            }}
                                            disabled={actionLoading}
                                        >
                                            Cancel Event
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <Snackbar
                open={toast.show}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, show: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={toast.variant} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminEventsManagement;
