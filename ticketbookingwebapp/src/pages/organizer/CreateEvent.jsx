import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    Stepper,
    Step,
    StepLabel,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Event as EventIcon,
    Schedule as ScheduleIcon,
    ConfirmationNumber as TicketIcon,
    Image as ImageIcon,
    Chair as ChairIcon,
    NavigateNext as NextIcon
} from '@mui/icons-material';

// Hooks
import { useCreateEvent } from '../../hooks/useCreateEvent';

// Sub-components
import EventBasicInfo from '../../components/Organizer/EventBasicInfo';
import EventDateTime from '../../components/Organizer/EventDateTime';
import EventBannerUpload from '../../components/Organizer/EventBannerUpload';
import TicketConfig from '../../components/Organizer/TicketConfig';

const steps = [
    { label: 'Thông tin cơ bản', icon: <InfoIcon /> },
    { label: 'Thời gian', icon: <ScheduleIcon /> },
    { label: 'Loại vé & Sơ đồ', icon: <TicketIcon /> },
    { label: 'Ảnh bìa & Hoàn tất', icon: <ImageIcon /> }
];

const CreateEvent = () => {
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
        currentStep,
        createdEventId,
        setError,
        setCurrentStep,
        handleInputChange,
        handleImageChange,
        removeBanner,
        handleTicketTypeChange,
        toggleSeatSelection,
        addTicketType,
        removeTicketType,
        toggleAreaSelection,
        handleSubmit
    } = useCreateEvent();

    if (loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" color="text.secondary">
                        Đang tải cấu hình...
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
                        Sơ Đồ Ghế Đã Lưu!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        Sự kiện của bạn và toàn bộ cấu hình sơ đồ ghế đã được khởi tạo thành công.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sự kiện sẽ hiển thị sau khi được Quản trị viên phê duyệt.
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

            {/* Error Snackbar */}
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
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.secondary' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Tạo Sự Kiện Mới
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Bắt đầu hành trình tổ chức sự kiện của bạn
                    </Typography>
                </Box>
            </Stack>

            {/* Progress Stepper */}
            <Card sx={{ mb: 4, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stepper activeStep={currentStep} alternativeLabel>
                        {steps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel
                                    StepIconComponent={() => (
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: index <= currentStep ? 'primary.main' : 'primary.light',
                                                color: index <= currentStep ? 'white' : 'primary.main',
                                                boxShadow: index === currentStep ? '0 0 10px rgba(45, 194, 117, 0.4)' : 'none',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {step.icon}
                                        </Box>
                                    )}
                                >
                                    {step.label}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    {error}
                </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} lg={8}>
                        {/* Basic Info */}
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

                        {/* Date Time */}
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

                        {/* Ticket Config */}
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
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column - Sticky Sidebar */}
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
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            Hoàn tất đăng tin
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Vui lòng kiểm tra kỹ tất cả thông tin. Sự kiện sau khi tạo sẽ được gửi tới Admin để phê duyệt.
                                        </Typography>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            disabled={loading}
                                            sx={{
                                                mb: 2,
                                                py: 1.5,
                                                borderRadius: 2,
                                                background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                                                boxShadow: '0 4px 12px rgba(45, 194, 117, 0.2)',
                                                fontWeight: 700,
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #219d5c 0%, #17834a 100%)'
                                                }
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                'XÁC NHẬN'
                                            )}
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            onClick={() => navigate('/organizer/dashboard')}
                                            disabled={loading}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Hủy bỏ
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default CreateEvent;
