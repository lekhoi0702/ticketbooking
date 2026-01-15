import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    Grid,
    CircularProgress,
    Stack,
    IconButton,
    Dialog,
    DialogContent,
    DialogActions,
    Snackbar,
    DialogTitle,
    DialogContentText
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Event as EventIcon,
    Schedule as ScheduleIcon,
    ConfirmationNumber as TicketIcon,
    Image as ImageIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

// Hooks
import { useCreateEvent } from '../../hooks/useCreateEvent';
import { api } from '../../services/api';

// Sub-components
import EventBasicInfo from '../../components/Organizer/EventBasicInfo';
import EventDateTime from '../../components/Organizer/EventDateTime';
import EventBannerUpload from '../../components/Organizer/EventBannerUpload';
import TicketConfig from '../../components/Organizer/TicketConfig';

const EditEvent = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const {
        loading,
        loadingData,
        error,
        success,
        categories,
        venues,
        venueTemplate,
        formData,
        bannerPreview,
        ticketTypes,
        setError,
        setSuccess,
        handleInputChange,
        handleImageChange,
        removeBanner,
        handleTicketTypeChange,
        toggleSeatSelection,
        addTicketType,
        removeTicketType,
        toggleAreaSelection,
        handleSubmit,
        // Helper to populate data for editing
        setFormData,
        setTicketTypes,
        setBannerPreview,
        setIsLoadingData
    } = useCreateEvent();

    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    // Fetch existing event data
    useEffect(() => {
        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setIsLoadingData(true);
            const res = await api.getEvent(eventId);
            if (res.success) {
                const event = res.data;

                // Format dates for input type="datetime-local"
                const formatDate = (dateStr) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    return d.toISOString().slice(0, 16);
                };

                setFormData({
                    event_name: event.event_name,
                    description: event.description || '',
                    category_id: event.category_id,
                    venue_id: event.venue_id,
                    start_datetime: formatDate(event.start_datetime),
                    end_datetime: formatDate(event.end_datetime),
                    sale_start_datetime: formatDate(event.sale_start_datetime),
                    sale_end_datetime: formatDate(event.sale_end_datetime),
                    total_capacity: event.total_capacity,
                    status: event.status,
                    is_featured: event.is_featured,
                    manager_id: event.manager_id
                });

                if (event.banner_image_url) {
                    setBannerPreview(event.banner_image_url.startsWith('http')
                        ? event.banner_image_url
                        : `http://127.0.0.1:5000${event.banner_image_url}`);
                }

                // Fetch ticket types
                const ttRes = await api.getTicketTypes(eventId);
                if (ttRes.success) {
                    // Enrich ticket types with their actual seats
                    const enrichedTT = await Promise.all(ttRes.data.map(async (tt) => {
                        const seatsRes = await api.getSeatsByTicketType(tt.ticket_type_id);
                        return {
                            ...tt,
                            price: String(tt.price),
                            quantity: String(tt.quantity),
                            selectedSeats: seatsRes.success ? seatsRes.data.map(s => ({
                                ...s,
                                area: s.area_name // Map backend key to frontend key
                            })) : []
                        };
                    }));
                    setTicketTypes(enrichedTT);
                }
            } else {
                setError('Không tìm thấy thông tin sự kiện');
            }
        } catch (err) {
            console.error('Error fetching event details:', err);
            setError('Lỗi khi tải thông tin sự kiện');
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleUpdate = async (e) => {
        await handleSubmit(e, eventId);
    };

    const confirmDeleteRequest = async () => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('status', 'PENDING_DELETION');
            const res = await api.updateEvent(eventId, formDataToSend);
            if (res.success) {
                setShowDeleteModal(false);
                setSuccess(true);
                // The success dialog will show, and navigation will happen then
            } else {
                setError(res.message || 'Không thể gửi yêu cầu xóa');
            }
        } catch (err) {
            setError('Lỗi khi gửi yêu cầu xóa');
        }
    };

    if (loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" color="text.secondary">
                        Đang tải thông tin sự kiện...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Success Dialog */}
            <Dialog
                open={success}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
            >
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                        Cập Nhật Thành Công!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        Thông tin sự kiện của bạn đã được cập nhật thành công.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => navigate('/organizer/events')}
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                            fontWeight: 700
                        }}
                    >
                        XEM DANH SÁCH SỰ KIỆN
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                    {error}
                </Alert>
            </Snackbar>

            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Chỉnh Sửa Sự Kiện
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        ID: #{eventId} - Cập nhật thông tin cho sự kiện của bạn
                    </Typography>
                </Box>
            </Stack>

            {['REJECTED', 'ONGOING', 'COMPLETED', 'PENDING_DELETION'].includes(formData.status) && (
                <Alert severity={formData.status === 'PENDING_DELETION' ? "info" : "warning"} sx={{ mb: 4, borderRadius: 3, py: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {formData.status === 'PENDING_DELETION' ? "Yêu cầu xóa đang được xử lý" : "Chế độ xem chi tiết (Chỉ đọc)"}
                    </Typography>
                    {formData.status === 'PENDING_DELETION' ? (
                        "Yêu cầu xóa sự kiện này đã được gửi tới Admin. Bạn không thể chỉnh sửa trong thời gian này."
                    ) : (
                        <>Sự kiện này đang ở trạng thái <strong>{
                            formData.status === 'REJECTED' ? 'BỊ TỪ CHỐI' :
                                formData.status === 'ONGOING' ? 'ĐANG DIỄN RA' :
                                    'ĐÃ KẾT THÚC'
                        }</strong> nên không thể chỉnh sửa thông tin.</>
                    )}
                </Alert>
            )}

            <form onSubmit={handleUpdate}>
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={8}>
                        <Card sx={{ mb: 3, borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                    <EventIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        1. Thông tin cơ bản
                                    </Typography>
                                </Stack>
                                <EventBasicInfo
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    categories={categories}
                                    venues={venues}
                                />
                            </CardContent>
                        </Card>

                        <Card sx={{ mb: 3, borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                    <ScheduleIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        2. Thời gian tổ chức
                                    </Typography>
                                </Stack>
                                <EventDateTime
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                />
                            </CardContent>
                        </Card>

                        <Card sx={{ mb: 3, borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                    <TicketIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        3. Thiết lập loại vé
                                    </Typography>
                                </Stack>
                                <TicketConfig
                                    ticketTypes={ticketTypes}
                                    handleTicketTypeChange={handleTicketTypeChange}
                                    addTicketType={addTicketType}
                                    removeTicketType={removeTicketType}
                                    venueTemplate={venueTemplate}
                                    toggleSeatSelection={toggleSeatSelection}
                                    toggleAreaSelection={toggleAreaSelection}
                                    isEdit={true}
                                />
                                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                                    Lưu ý: Bạn có thể thêm loại vé mới hoặc chỉnh sửa giá. Việc thay đổi số lượng ghế của loại vé đã có người mua có thể gây lỗi.
                                </Alert>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                        <ImageIcon color="primary" />
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            Ảnh bìa sự kiện
                                        </Typography>
                                    </Stack>

                                    <EventBannerUpload
                                        bannerPreview={bannerPreview}
                                        handleImageChange={handleImageChange}
                                        removeBanner={removeBanner}
                                    />

                                    <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            disabled={loading || ['REJECTED', 'ONGOING', 'COMPLETED'].includes(formData.status)}
                                            sx={{
                                                mb: 2,
                                                py: 1.5,
                                                borderRadius: 2,
                                                background: ['REJECTED', 'ONGOING', 'COMPLETED'].includes(formData.status)
                                                    ? 'action.disabledBackground'
                                                    : 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                                                boxShadow: ['REJECTED', 'ONGOING', 'COMPLETED'].includes(formData.status)
                                                    ? 'none'
                                                    : '0 4px 12px rgba(45, 194, 117, 0.2)',
                                                fontWeight: 700
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={24} color="inherit" />
                                            ) : (
                                                'LƯU THAY ĐỔI'
                                            )}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            onClick={() => navigate('/organizer/events')}
                                            disabled={loading}
                                            sx={{ mb: 2, borderRadius: 2 }}
                                        >
                                            Hủy bỏ
                                        </Button>

                                        {!['REJECTED', 'ONGOING', 'COMPLETED', 'PENDING_DELETION'].includes(formData.status) && (
                                            <Button
                                                variant="text"
                                                color="error"
                                                fullWidth
                                                startIcon={<DeleteIcon />}
                                                onClick={() => setShowDeleteModal(true)}
                                                disabled={loading}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                Yêu cầu xóa sự kiện
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </form>

            <Dialog
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    Xác nhận yêu cầu xóa
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn gửi yêu cầu xóa sự kiện <strong>{formData.event_name}</strong>?
                    </DialogContentText>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Yêu cầu của bạn sẽ được gửi tới Admin để xem xét và phê duyệt. Bạn sẽ không thể chỉnh sửa sự kiện trong khi chờ duyệt.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setShowDeleteModal(false)} variant="outlined" sx={{ borderRadius: 2 }}>
                        Bỏ qua
                    </Button>
                    <Button onClick={confirmDeleteRequest} variant="contained" color="error" sx={{ borderRadius: 2 }}>
                        Gửi yêu cầu
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EditEvent;
