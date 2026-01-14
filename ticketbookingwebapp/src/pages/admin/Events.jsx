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
    Tooltip,
    Snackbar,
    Alert,
    Divider,
    DialogTitle
} from '@mui/material';
import {
    Refresh,
    Visibility,
    CheckCircle,
    Cancel as CancelIcon,
    LocationOn,
    CalendarMonth,
    Shield,
    Star,
    StarBorder,
    Warning
} from '@mui/icons-material';
import { api } from '../../services/api';
import SeatMapTemplateView from '../../components/Organizer/SeatMapTemplateView';
import { Chair as ChairIcon } from '@mui/icons-material';

const AdminEventsManagement = () => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // Seat Map States
    const [venueTemplate, setVenueTemplate] = useState(null);
    const [eventSeats, setEventSeats] = useState([]);
    const [loadingMap, setLoadingMap] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    // Fetch Seat Map Data when an event is selected
    useEffect(() => {
        if (selectedEvent && showModal) {
            fetchEventSeatMap();
        } else {
            setVenueTemplate(null);
            setEventSeats([]);
        }
    }, [selectedEvent, showModal]);

    const fetchEventSeatMap = async () => {
        try {
            setLoadingMap(true);
            // 1. Fetch Venue Template
            const venueRes = await api.getVenueById(selectedEvent.venue_id);
            if (venueRes.success) {
                setVenueTemplate(venueRes.data.seat_map_template);
            }

            // 2. Fetch all seats for this event
            const seatsRes = await api.getAllEventSeats(selectedEvent.event_id);
            if (seatsRes.success) {
                // Map API seats to the format expected by SeatMapTemplateView
                const mappedSeats = seatsRes.data.map(s => ({
                    row_name: s.row_name,
                    seat_number: s.seat_number,
                    area: s.area_name,
                    ticket_type_id: s.ticket_type_id,
                    status: s.status
                }));
                setEventSeats(mappedSeats);
            }
        } catch (error) {
            console.error("Error fetching seat map info:", error);
            showToast("Không thể tải sơ đồ ghế", "error");
        } finally {
            setLoadingMap(false);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.getAllAdminEvents();
            if (res.success) setEvents(res.data);
        } catch (error) {
            console.error("Error fetching admin events:", error);
            showToast("Lỗi khi tải danh sách sự kiện", "error");
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
            const data = { status: newStatus };
            const res = await api.adminUpdateEventStatus(eventId, data);
            if (res.success) {
                const statusMsg = {
                    'PUBLISHED': 'đã được xuất bản',
                    'APPROVED': 'đã được phê duyệt',
                    'REJECTED': 'đã bị từ chối',
                    'CANCELLED': 'đã bị hủy'
                }[newStatus] || newStatus;

                showToast(`Sự kiện ${statusMsg}`);
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
            const data = { is_featured: !event.is_featured };
            const res = await api.adminUpdateEventStatus(event.event_id, data);
            if (res.success) {
                showToast(event.is_featured ? "Đã bỏ đánh dấu nổi bật" : "Đã đánh dấu sự kiện nổi bật");
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
            'DRAFT': 'default',
            'CANCELLED': 'error',
            'COMPLETED': 'secondary',
            'ONGOING': 'success'
        };
        return colors[status] || 'default';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PUBLISHED': 'Đã xuất bản',
            'PENDING_APPROVAL': 'Chờ duyệt',
            'APPROVED': 'Đã duyệt',
            'REJECTED': 'Từ chối',
            'DRAFT': 'Nháp',
            'CANCELLED': 'Đã hủy',
            'COMPLETED': 'Hoàn thành',
            'ONGOING': 'Đang diễn ra'
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
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        Quản Lý Phê Duyệt
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Xem xét và cấp phép xuất bản các sự kiện trên hệ thống
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={fetchEvents}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        '&:hover': { bgcolor: 'grey.100' }
                    }}
                >
                    Làm mới
                </Button>
            </Stack>

            {pendingCount > 0 && (
                <Alert
                    severity="warning"
                    icon={<Warning fontSize="inherit" />}
                    sx={{ mb: 4, borderRadius: 3, border: 1, borderColor: 'warning.light' }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            Đang có {pendingCount} sự kiện cần được bạn phê duyệt để lên sàn.
                        </Typography>
                    </Stack>
                </Alert>
            )}

            <Card sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, px: 3, py: 2 }}>ẢNH BÌA</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>THÔNG TIN SỰ KIỆN</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>NHÀ TỔ CHỨC</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>TRẠNG THÁI</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>NỔI BẬT</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, pr: 3 }}>THAO TÁC</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.event_id} hover sx={{
                                    transition: '0.2s',
                                    bgcolor: event.status === 'PENDING_APPROVAL' ? 'warning.lighter' : 'inherit',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}>
                                    <TableCell sx={{ px: 3 }}>
                                        <Avatar
                                            src={event.banner_image_url?.startsWith('http') ? event.banner_image_url : `http://127.0.0.1:5000${event.banner_image_url}`}
                                            variant="rounded"
                                            sx={{ width: 100, height: 56, borderRadius: 2, boxShadow: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                                            {event.event_name}
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="textSecondary">
                                                    {event.venue?.name || event.venue_name}
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="caption" color="textSecondary">
                                                    {new Date(event.start_datetime).toLocaleDateString('vi-VN')}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
                                                {event.organizer_name?.charAt(0)}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{event.organizer_name}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={getStatusLabel(event.status)}
                                            color={getStatusColor(event.status)}
                                            size="small"
                                            sx={{ borderRadius: 1.5, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            color={event.is_featured ? "warning" : "default"}
                                            onClick={() => toggleFeatured(event)}
                                            sx={{
                                                bgcolor: event.is_featured ? 'warning.lighter' : 'transparent',
                                                '&:hover': { bgcolor: 'warning.light' }
                                            }}
                                        >
                                            {event.is_featured ? <Star /> : <StarBorder />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }}>
                                        <Button
                                            variant={event.status === 'PENDING_APPROVAL' ? "contained" : "outlined"}
                                            size="small"
                                            startIcon={<Visibility />}
                                            onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 700,
                                                boxShadow: event.status === 'PENDING_APPROVAL' ? '0 4px 12px rgba(45, 194, 117, 0.3)' : 'none'
                                            }}
                                        >
                                            {event.status === 'PENDING_APPROVAL' ? 'XEM & DUYỆT' : 'CHI TIẾT'}
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
                PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
            >
                {selectedEvent && (
                    <>
                        <Box sx={{ position: 'relative', height: 300 }}>
                            <img
                                src={selectedEvent.banner_image_url?.startsWith('http') ? selectedEvent.banner_image_url : `http://127.0.0.1:5000${selectedEvent.banner_image_url}`}
                                alt="Banner"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                p: 4,
                                color: 'white'
                            }}>
                                <Chip
                                    label={selectedEvent.category?.category_name || 'SỰ KIỆN'}
                                    size="small"
                                    sx={{ bgcolor: 'primary.main', color: 'white', mb: 2, width: 'fit-content', fontWeight: 700 }}
                                />
                                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>{selectedEvent.event_name}</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.8 }}>Do {selectedEvent.organizer_name} tổ chức</Typography>
                            </Box>
                        </Box>

                        <DialogContent sx={{ p: 4 }}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={7}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>Mô tả sự kiện</Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                        {selectedEvent.description || 'Không có mô tả chi tiết.'}
                                    </Typography>

                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 800, mt: 4 }}>Phân loại vé</Typography>
                                    <Stack spacing={1.5}>
                                        {selectedEvent.ticket_types?.map((tt, i) => (
                                            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{tt.type_name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{tt.description || 'Không có mô tả'}</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tt.price)}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">SL: {tt.quantity}</Typography>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>Thông tin tóm tắt</Typography>
                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                        <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'grey.50' }}>
                                            <Stack spacing={2.5}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                                        <LocationOn />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>ĐỊA ĐIỂM</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedEvent.venue?.name || selectedEvent.venue_name}</Typography>
                                                    </Box>
                                                </Stack>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                                                        <CalendarMonth />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>THỜI GIAN</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                            {new Date(selectedEvent.start_datetime).toLocaleString('vi-VN')}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                                                        <Shield />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>TRẠNG THÁI HIỆN TẠI</Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{getStatusLabel(selectedEvent.status)}</Typography>
                                                    </Box>
                                                </Stack>
                                            </Stack>
                                        </Card>

                                        <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.light' }}>
                                            <Typography variant="caption" color="warning.dark" sx={{ fontStyle: 'italic' }}>
                                                * Vui lòng kiểm tra kỹ nội dung và hình ảnh trước khi phê duyệt. Nhà tổ chức sẽ nhận được thông báo ngay khi trạng thái thay đổi.
                                            </Typography>
                                        </Paper>
                                    </Stack>
                                </Grid>
                            </Grid>

                            {/* SEAT MAP REVIEW SECTION */}
                            <Box sx={{ mt: 5 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <ChairIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Sơ đồ chỗ ngồi</Typography>
                                </Stack>

                                {loadingMap ? (
                                    <Box sx={{ py: 5, textAlign: 'center' }}>
                                        <CircularProgress size={40} />
                                        <Typography sx={{ mt: 2 }} color="text.secondary">Đang tải sơ đồ ghế...</Typography>
                                    </Box>
                                ) : venueTemplate ? (
                                    <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 4, border: 1, borderColor: 'divider' }}>
                                        {/* Legend */}
                                        <Stack direction="row" spacing={3} sx={{ mb: 3 }} justifyContent="center">
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Box sx={{ width: 16, height: 16, bgcolor: '#2196f3', borderRadius: 0.5 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Ghế đã gán vé</Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Box sx={{ width: 16, height: 16, bgcolor: '#ff5252', borderRadius: 0.5 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Ghế bị khóa/hỏng</Typography>
                                            </Stack>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Box sx={{ width: 16, height: 16, bgcolor: '#e0e0e0', borderRadius: 0.5, border: 1, borderColor: 'divider' }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>Ghế trống (Chưa gán)</Typography>
                                            </Stack>
                                        </Stack>

                                        <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, overflowX: 'auto', border: 1, borderColor: 'divider' }}>
                                            <SeatMapTemplateView
                                                venueTemplate={venueTemplate}
                                                selectedTemplateSeats={[]} // Not selecting
                                                allOccupiedSeats={eventSeats.map(s => ({ ...s, ticket_type_id: 'other' }))} // Show as "Occupied/Other" to get the blue color
                                                activeTicketType={null}
                                                handleSeatMouseDown={() => { }} // Read only
                                                handleSeatMouseEnter={() => { }} // Read only
                                            />
                                        </Box>
                                    </Box>
                                ) : (
                                    <Alert severity="info">Địa điểm này không sử dụng sơ đồ ghế định sẵn hoặc thông tin sơ đồ không khả dụng.</Alert>
                                )}
                            </Box>
                        </DialogContent>
                        <Divider />
                        <DialogActions sx={{ p: 3, bgcolor: 'grey.50', justifyContent: 'space-between' }}>
                            <Button onClick={() => setShowModal(false)} color="inherit" sx={{ fontWeight: 700 }}>Đóng</Button>

                            <Stack direction="row" spacing={2}>
                                {selectedEvent.status === 'PENDING_APPROVAL' && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<CancelIcon />}
                                            sx={{ px: 3, borderRadius: 2, fontWeight: 700 }}
                                            onClick={() => handleUpdateStatus(selectedEvent.event_id, 'REJECTED')}
                                            disabled={actionLoading}
                                        >
                                            TỪ CHỐI
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircle />}
                                            sx={{ px: 4, borderRadius: 2, fontWeight: 700, bgcolor: '#2dc275', '&:hover': { bgcolor: '#219d5c' } }}
                                            onClick={() => handleUpdateStatus(selectedEvent.event_id, 'PUBLISHED')}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? <CircularProgress size={24} /> : 'XÁC NHẬN XUẤT BẢN'}
                                        </Button>
                                    </>
                                )}

                                {selectedEvent.status === 'PUBLISHED' && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<CancelIcon />}
                                        sx={{ borderRadius: 2, fontWeight: 700 }}
                                        onClick={() => {
                                            if (window.confirm("Bạn có chắc chắn muốn HỦY sự kiện này không? Hành động này sẽ thông báo tới toàn bộ người mua.")) {
                                                handleUpdateStatus(selectedEvent.event_id, 'CANCELLED');
                                            }
                                        }}
                                        disabled={actionLoading}
                                    >
                                        HỦY SỰ KIỆN
                                    </Button>
                                )}

                                {(selectedEvent.status === 'REJECTED' || selectedEvent.status === 'CANCELLED') && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleUpdateStatus(selectedEvent.event_id, 'PENDING_APPROVAL')}
                                        disabled={actionLoading}
                                        sx={{ borderRadius: 2, fontWeight: 700 }}
                                    >
                                        KHÔI PHỤC VỀ CHỜ DUYỆT
                                    </Button>
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
                <Alert severity={toast.variant} variant="filled" sx={{ width: '100%', borderRadius: 3, boxShadow: 6 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminEventsManagement;

