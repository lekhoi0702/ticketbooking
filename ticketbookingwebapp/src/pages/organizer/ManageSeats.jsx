import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Alert,
    IconButton,
    Stack,
    Paper,
    Divider,
    Tooltip,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Chair as ChairIcon,
    Info as InfoIcon,
    NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

// Components
import SeatMap from '../../components/event/SeatMap';
import TicketTypeSidebar from '../../components/Organizer/TicketTypeSidebar';
import SeatMapTemplateView from '../../components/Organizer/SeatMapTemplateView';
import SeatGridInitializer from '../../components/Organizer/SeatGridInitializer';

// Hooks
import { useManageSeats } from '../../hooks/useManageSeats';

const ManageSeats = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const {
        loading,
        error,
        event,
        ticketTypes,
        activeTicketType,
        initializing,
        allOccupiedSeats,
        hasSeats,
        selectedTemplateSeats,
        initData,
        venueTemplate,
        setActiveTicketType,
        setInitData,
        handleSeatMouseDown,
        handleSeatMouseEnter,
        handleInitializeSeats,
        handleSaveTemplateAssignment,
        setHasSeats
    } = useManageSeats(eventId);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" color="text.secondary">
                        Đang tải cấu hình sơ đồ ghế...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header / Breadcrumbs */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
                <Box>
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        sx={{ mb: 1 }}
                    >
                        <Link
                            underline="hover"
                            color="inherit"
                            href="#"
                            onClick={(e) => { e.preventDefault(); navigate('/organizer/events'); }}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            Sự kiện
                        </Link>
                        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
                            Thiết lập ghế
                        </Typography>
                    </Breadcrumbs>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton
                            onClick={() => navigate(-1)}
                            sx={{
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Thiết Lập Sơ Đồ Ghế
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {event?.event_name} • {event?.venue?.venue_name}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {venueTemplate && (
                    <Stack direction="row" alignItems="center" spacing={2}>
                        {activeTicketType && (
                            <Typography variant="body2" sx={{
                                color: selectedTemplateSeats.length === activeTicketType.quantity ? 'success.main' : 'error.main',
                                fontWeight: 700
                            }}>
                                {selectedTemplateSeats.length === activeTicketType.quantity
                                    ? '✓ Đủ số lượng ghế'
                                    : `Cần chọn: ${activeTicketType.quantity} ghế (Đang: ${selectedTemplateSeats.length})`}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => {
                                if (selectedTemplateSeats.length !== activeTicketType.quantity) {
                                    alert(`Vui lòng chọn đúng ${activeTicketType.quantity} ghế cho hạng vé ${activeTicketType.type_name}. Bạn đang chọn ${selectedTemplateSeats.length} ghế.`);
                                    return;
                                }
                                handleSaveTemplateAssignment();
                            }}
                            disabled={initializing || !activeTicketType}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                                boxShadow: '0 4px 12px rgba(45, 194, 117, 0.2)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #219d5c 0%, #17834a 100%)'
                                }
                            }}
                        >
                            LƯU CẤU HÌNH GHẾ
                        </Button>
                    </Stack>
                )}
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Sidebar */}
                <Grid item xs={12} lg={3}>
                    <TicketTypeSidebar
                        ticketTypes={ticketTypes}
                        activeTicketType={activeTicketType}
                        setActiveTicketType={setActiveTicketType}
                        allOccupiedSeats={allOccupiedSeats}
                        venueTemplate={venueTemplate}
                        venueName={event?.venue?.venue_name}
                    />
                </Grid>

                {/* Main View Area */}
                <Grid item xs={12} lg={9}>
                    <Card sx={{ borderRadius: 3, overflow: 'hidden', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
                        <CardHeader
                            title={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <ChairIcon color="primary" />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Ghế {activeTicketType?.type_name}
                                    </Typography>
                                </Stack>
                            }
                            subheader={
                                <Typography variant="caption" color="text.secondary">
                                    {selectedTemplateSeats.length} ghế đã chọn / {activeTicketType?.quantity} tổng số vé
                                </Typography>
                            }
                            action={
                                !venueTemplate && (
                                    <Paper
                                        sx={{
                                            bgcolor: 'warning.lighter',
                                            color: 'warning.dark',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            border: 1,
                                            borderColor: 'warning.light',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <InfoIcon fontSize="small" />
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            CHẾ ĐỘ LƯỚI TỰ DO
                                        </Typography>
                                    </Paper>
                                )
                            }
                            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
                        />

                        <CardContent sx={{ p: 0, flex: 1, position: 'relative', bgcolor: '#f8f9fa' }}>
                            {venueTemplate ? (
                                <SeatMapTemplateView
                                    venueTemplate={venueTemplate}
                                    selectedTemplateSeats={selectedTemplateSeats}
                                    allOccupiedSeats={allOccupiedSeats}
                                    activeTicketType={activeTicketType}
                                    handleSeatMouseDown={handleSeatMouseDown}
                                    handleSeatMouseEnter={handleSeatMouseEnter}
                                />
                            ) : (
                                <Box sx={{ p: 5, textAlign: 'center' }}>
                                    {!hasSeats && !initializing ? (
                                        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                                            <SeatGridInitializer
                                                initData={initData}
                                                setInitData={setInitData}
                                                handleInitializeSeats={handleInitializeSeats}
                                            />
                                        </Box>
                                    ) : (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 4,
                                                borderRadius: 4,
                                                bgcolor: 'background.default',
                                                border: 1,
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <SeatMap
                                                key={activeTicketType?.ticket_type_id}
                                                ticketType={activeTicketType}
                                                onSeatsLoaded={setHasSeats}
                                                onSelectionChange={() => { }}
                                            />
                                        </Paper>
                                    )}
                                </Box>
                            )}

                            {initializing && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                                        backdropFilter: 'blur(4px)',
                                        zIndex: 10
                                    }}
                                >
                                    <CircularProgress color="success" />
                                    <Typography variant="body1" sx={{ mt: 2, fontWeight: 700 }}>
                                        Đang thực hiện gán ghế...
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Footer Legend / Info */}
                    <Paper
                        variant="outlined"
                        sx={{
                            mt: 3,
                            p: 3,
                            borderRadius: 3,
                            bgcolor: 'primary.lighter',
                            borderColor: 'primary.light',
                            display: 'flex',
                            gap: 2
                        }}
                    >
                        <InfoIcon color="primary" />
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                                Ghi chú từ hệ thống
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sơ đồ ghế được hiển thị dựa trên thiết kế của quản trị viên (Admin) cho khu vực <strong>{event?.venue?.venue_name}</strong>.
                                Bạn chỉ cần chọn/hủy tập hợp ghế tương ứng với từng hạng vé để khách hàng có thể chọn chỗ khi mua vé.
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ManageSeats;
