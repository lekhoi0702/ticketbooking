import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Stack,
    IconButton,
    Chip,
    Divider,
    Paper,
    LinearProgress,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    EventSeat as SeatIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    LocalActivity as TicketIcon,
    TrendingUp as ChartIcon,
    Group as GroupIcon,
    NavigateNext as NextIcon,
    AccessTime as TimeIcon,
    Cancel as CancelIcon,
    Chair as ChairIcon
} from '@mui/icons-material';
import { api } from '../../services/api';
import SeatMapTemplateView from '../../components/Organizer/SeatMapTemplateView';

const EventDetails = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Seat Map States
    const [venueTemplate, setVenueTemplate] = useState(null);
    const [eventSeats, setEventSeats] = useState([]);
    const [loadingMap, setLoadingMap] = useState(false);

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eventRes, ttRes] = await Promise.all([
                api.getEvent(eventId),
                api.getTicketTypes(eventId)
            ]);

            if (eventRes.success) {
                setEvent(eventRes.data);
                fetchSeatMapData(eventRes.data.venue_id, eventId);
            } else {
                setError('Không tìm thấy thông tin sự kiện');
            }

            if (ttRes.success) {
                setTicketTypes(ttRes.data);
            }
        } catch (err) {
            console.error('Error fetching event details:', err);
            setError('Lỗi khi tải thông tin sự kiện');
        } finally {
            setLoading(false);
        }
    };

    const fetchSeatMapData = async (venueId, evtId) => {
        try {
            setLoadingMap(true);
            const [venueRes, seatsRes] = await Promise.all([
                api.getVenueById(venueId),
                api.getAllEventSeats(evtId)
            ]);

            if (venueRes.success) {
                setVenueTemplate(venueRes.data.seat_map_template);
            }
            if (seatsRes.success) {
                setEventSeats(seatsRes.data);
            }
        } catch (err) {
            console.error('Error fetching seat map:', err);
        } finally {
            setLoadingMap(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING_APPROVAL': { color: 'warning', label: 'CHỜ DUYỆT' },
            'APPROVED': { color: 'info', label: 'ĐÃ DUYỆT' },
            'REJECTED': { color: 'error', label: 'TỪ CHỐI' },
            'PUBLISHED': { color: 'success', label: 'CÔNG KHAI' },
            'DRAFT': { color: 'default', label: 'NHÁP' },
            'ONGOING': { color: 'secondary', label: 'ĐANG DIỄN RA' },
            'COMPLETED': { color: 'default', label: 'ĐÃ KẾT THÚC' },
            'PENDING_DELETION': { color: 'error', label: 'CHỜ XÓA' }
        };
        return configs[status] || { color: 'default', label: status };
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error || !event) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error || 'Đã xảy ra lỗi'}</Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/organizer/events')}
                    sx={{ mt: 2 }}
                >
                    Quay lại danh sách
                </Button>
            </Box>
        );
    }

    const soldTickets = event.sold_tickets || 0;
    const totalCapacity = event.total_capacity || 0;
    const soldPercentage = totalCapacity > 0 ? (soldTickets / totalCapacity) * 100 : 0;
    const statusConfig = getStatusConfig(event.status);

    const handleCancelApproval = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('status', 'DRAFT');

            const response = await api.updateEvent(eventId, formData);

            if (response.success) {
                setEvent(prev => ({ ...prev, status: 'DRAFT' }));
            } else {
                alert(response.message || 'Không thể hủy yêu cầu duyệt');
            }
        } catch (err) {
            console.error('Error cancelling approval:', err);
            alert(err.message || 'Không thể hủy yêu cầu duyệt');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ pb: 4 }}>
            {/* Breadcrumbs & Header */}
            <Breadcrumbs
                separator={<NextIcon fontSize="small" />}
                sx={{ mb: 3 }}
            >
                <Link color="inherit" component="button" onClick={() => navigate('/organizer/dashboard')}>
                    Dashboard
                </Link>
                <Link color="inherit" component="button" onClick={() => navigate('/organizer/events')}>
                    Sự kiện
                </Link>
                <Typography color="text.primary">Chi tiết</Typography>
            </Breadcrumbs>

            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a1a1a' }}>
                            {event.event_name}
                        </Typography>
                        <Chip
                            label={statusConfig.label}
                            color={statusConfig.color}
                            sx={{ fontWeight: 700, borderRadius: 1 }}
                        />
                    </Stack>
                    <Typography variant="body1" color="text.secondary">
                        Quản lý và xem thống kê chi tiết sự kiện của bạn
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    {event.status === 'PENDING_APPROVAL' && (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={handleCancelApproval}
                            sx={{ borderRadius: 2 }}
                        >
                            Hủy duyệt
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/organizer/edit-event/${eventId}`)}
                        disabled={['PENDING_APPROVAL', 'ONGOING', 'COMPLETED', 'PENDING_DELETION'].includes(event.status)}
                        sx={{ borderRadius: 2 }}
                    >
                        Chỉnh sửa
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>


                {/* Left Column - Main Info */}
                <Grid item xs={12} lg={8}>
                    {/* Event Banner */}
                    <Card sx={{ borderRadius: 4, overflow: 'hidden', mb: 3, border: '1px solid #e5e7eb' }}>
                        <Box sx={{ position: 'relative', pt: '40%', bgcolor: '#f3f4f6' }}>
                            {event.banner_image_url && (
                                <Box
                                    component="img"
                                    src={event.banner_image_url.startsWith('http') ? event.banner_image_url : `http://127.0.0.1:5000${event.banner_image_url}`}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            )}
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Mô tả sự kiện</Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                                {event.description || 'Chưa có mô tả chi tiết cho sự kiện này.'}
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Ticket Types Breakdown */}
                    <Card sx={{ borderRadius: 4, border: '1px solid #e5e7eb', mb: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Các loại vé</Typography>
                            <Stack spacing={2}>
                                {ticketTypes.map((tt, index) => {
                                    const soldInType = (eventSeats || []).filter(s => s.ticket_type_id === tt.ticket_type_id && s.status === 'BOOKED').length;
                                    const percentageInType = tt.quantity > 0 ? (soldInType / tt.quantity) * 100 : 0;

                                    return (
                                        <Paper
                                            key={index}
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                                border: '1px solid #f1f5f9'
                                            }}
                                        >
                                            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                                        {tt.type_name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        {tt.description || 'Vé tham dự sự kiện'}
                                                    </Typography>
                                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                                        {parseFloat(tt.price).toLocaleString()}đ
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ minWidth: 150, textAlign: { md: 'right' } }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                                        Tình trạng vé
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                        {soldInType} / {tt.quantity}
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percentageInType}
                                                        sx={{ height: 6, borderRadius: 3, mt: 1, bgcolor: '#e2e8f0' }}
                                                    />
                                                </Box>
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Seat Map View */}
                    <Card sx={{ borderRadius: 4, border: '1px solid #e5e7eb' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                <ChairIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Sơ đồ chỗ ngồi thực tế</Typography>
                            </Stack>

                            {loadingMap ? (
                                <Box sx={{ py: 10, textAlign: 'center' }}>
                                    <CircularProgress size={40} />
                                    <Typography sx={{ mt: 2 }} color="text.secondary">Đang tải sơ đồ ghế...</Typography>
                                </Box>
                            ) : venueTemplate ? (
                                <Box sx={{
                                    bgcolor: '#1a1a1a',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    border: '1px solid #333'
                                }}>
                                    <SeatMapTemplateView
                                        venueTemplate={venueTemplate}
                                        selectedTemplateSeats={[]}
                                        allOccupiedSeats={eventSeats}
                                        activeTicketType={null}
                                        handleSeatMouseDown={() => { }}
                                        handleSeatMouseEnter={() => { }}
                                    />
                                </Box>
                            ) : (
                                <Alert severity="info" sx={{ borderRadius: 3 }}>
                                    Sự kiện này không sử dụng sơ đồ ghế hoặc sơ đồ không khả dụng.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Timeline & Location */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ borderRadius: 4, mb: 3, border: '1px solid #e5e7eb' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Thời gian & Địa điểm</Typography>

                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f3f4f6', color: '#4b5563', display: 'flex', height: 'fit-content' }}>
                                        <CalendarIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Ngày tổ chức</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Chưa xác định'}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f3f4f6', color: '#4b5563', display: 'flex', height: 'fit-content' }}>
                                        <TimeIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Thời gian</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {event.start_datetime ? new Date(event.start_datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            -
                                            {event.end_datetime ? new Date(event.end_datetime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f3f4f6', color: '#4b5563', display: 'flex', height: 'fit-content' }}>
                                        <LocationIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Địa điểm</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {event.venue?.venue_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {event.venue?.address}, {event.venue?.city}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Divider />

                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Thời gian bán vé</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Bắt đầu: {event.sale_start_datetime ? new Date(event.sale_start_datetime).toLocaleString('vi-VN') : '---'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Kết thúc: {event.sale_end_datetime ? new Date(event.sale_end_datetime).toLocaleString('vi-VN') : '---'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Quick Access Info */}
                    <Card sx={{ borderRadius: 4, bgcolor: '#1a1a1a', color: 'white' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Mã Sự Kiện</Typography>
                            <Box sx={{
                                bgcolor: 'rgba(255,255,255,0.1)',
                                p: 2,
                                borderRadius: 2,
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                mb: 3
                            }}>
                                EVT-{eventId.toString().padStart(5, '0')}
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                                Sử dụng mã này khi liên hệ với hỗ trợ kỹ thuật hoặc báo cáo vấn đề liên quan đến sự kiện.
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    bgcolor: 'white',
                                    color: 'black',
                                    fontWeight: 700,
                                    '&:hover': { bgcolor: '#f3f4f6' }
                                }}
                                onClick={() => navigate('/organizer/events')}
                            >
                                Quay lại danh sách
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

// Workaround for icon import naming
const TrendingUpIcon = ChartIcon;

export default EventDetails;
