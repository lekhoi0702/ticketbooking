import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    IconButton,
    CircularProgress,
    Stack,
    Divider,
    Paper,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    Tooltip,
    Chip,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Refresh,
    LocationOn,
    Chair,
    Edit,
    Save,
    Close,
    EventSeat,
    Groups,
    Add,
    Delete,
    GridView,
    Block
} from '@mui/icons-material';
import { api } from '../../services/api';

const VenuesManagement = () => {
    const [loading, setLoading] = useState(true);
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [areas, setAreas] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
    const [activeAreaIndex, setActiveAreaIndex] = useState(0);

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const res = await api.getAllVenues();
            if (res.success) setVenues(res.data);
        } catch (error) {
            console.error("Error fetching venues:", error);
            showToast("Error loading venues information", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, variant = 'success') => {
        setToast({ show: true, message, variant });
    };

    const handleEditLayout = (venue) => {
        setSelectedVenue(venue);
        // Parse template or init empty
        const template = venue.seat_map_template || { areas: [] };
        setAreas(template.areas || []);
        setActiveAreaIndex(0);
        setShowEditModal(true);
    };

    const addNewArea = () => {
        const newArea = {
            name: `Khu vực ${areas.length + 1}`,
            rows: 5,
            cols: 10,
            locked_seats: [] // list of "row-col" strings
        };
        setAreas([...areas, newArea]);
        setActiveAreaIndex(areas.length);
    };

    const removeArea = (index) => {
        const newAreas = areas.filter((_, i) => i !== index);
        setAreas(newAreas);
        if (activeAreaIndex >= newAreas.length) {
            setActiveAreaIndex(Math.max(0, newAreas.length - 1));
        }
    };

    const updateAreaProperty = (index, prop, value) => {
        const newAreas = [...areas];
        newAreas[index][prop] = value;
        // If shrinking rows/cols, we might want to clean up locked_seats that fall out of bounds
        setAreas(newAreas);
    };

    const toggleSeatLock = (areaIndex, row, col) => {
        const seatId = `${row}-${col}`;
        const newAreas = [...areas];
        const area = newAreas[areaIndex];
        if (area.locked_seats.includes(seatId)) {
            area.locked_seats = area.locked_seats.filter(id => id !== seatId);
        } else {
            area.locked_seats.push(seatId);
        }
        setAreas(newAreas);
    };

    const handleSaveLayout = async () => {
        try {
            setSaving(true);
            // Calculate total capacity
            const totalCapacity = areas.reduce((sum, area) => sum + (area.rows * area.cols), 0);

            const payload = {
                capacity: totalCapacity,
                seat_map_template: { areas }
            };

            const res = await api.updateVenueSeats(selectedVenue.venue_id, payload);
            if (res.success) {
                showToast("Venue layout and seat map updated successfully!");
                setShowEditModal(false);
                fetchVenues();
            }
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const renderSeatMap = (area, areaIndex) => {
        const rows = [];
        for (let r = 1; r <= area.rows; r++) {
            const cols = [];
            for (let c = 1; c <= area.cols; c++) {
                const isLocked = area.locked_seats.includes(`${r}-${c}`);
                cols.push(
                    <Tooltip title={`Hàng ${r}, Ghế ${c} ${isLocked ? '(Hỏng/Khóa)' : ''}`} key={`${r}-${c}`}>
                        <Box
                            onClick={() => toggleSeatLock(areaIndex, r, c)}
                            sx={{
                                width: 28,
                                height: 28,
                                m: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1,
                                cursor: 'pointer',
                                bgcolor: isLocked ? 'error.main' : 'grey.200',
                                color: isLocked ? 'white' : 'text.secondary',
                                fontSize: 10,
                                fontWeight: 'bold',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: isLocked ? 'error.dark' : 'primary.light',
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            {isLocked ? <Block sx={{ fontSize: 14 }} /> : `${String.fromCharCode(64 + r)}${c}`}
                        </Box>
                    </Tooltip>
                );
            }
            rows.push(
                <Box key={r} sx={{ display: 'flex', justifyContent: 'center' }}>
                    {cols}
                </Box>
            );
        }
        return (
            <Box sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                overflowX: 'auto',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Box sx={{ mb: 2, width: '100%', textAlign: 'center' }}>
                    <Chip label="Sân khấu / Màn hình" sx={{ width: '60%', mb: 4, borderRadius: '0 0 20px 20px' }} />
                </Box>
                {rows}
            </Box>
        );
    };

    if (loading && venues.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                        Thiết Kế Sơ Đồ Địa Điểm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Xây dựng bố cục khu vực, hàng ghế và quản lý trang thiết bị.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchVenues}
                    size="small"
                    sx={{ color: 'text.secondary', borderColor: 'divider' }}
                >
                    Làm mới
                </Button>
            </Stack>

            <Grid container spacing={3}>
                {venues.map((venue) => {
                    const template = venue.seat_map_template || { areas: [] };
                    const areaCount = template.areas?.length || 0;
                    const totalSeats = template.areas?.reduce((sum, a) => sum + (a.rows * a.cols), 0) || 0;
                    const lockedCount = template.areas?.reduce((sum, a) => sum + (a.locked_seats?.length || 0), 0) || 0;

                    return (
                        <Grid item xs={12} md={6} lg={4} key={venue.venue_id}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.2 }}>
                                                {venue.venue_name}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <LocationOn sx={{ fontSize: 14, mr: 0.3 }} /> {venue.city || 'Chưa cập nhật'}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={venue.is_active ? "Sẵn sàng" : "Bản nháp"}
                                            size="small"
                                            variant="outlined"
                                            color={venue.is_active ? "success" : "default"}
                                            sx={{ borderRadius: 1, fontWeight: 600 }}
                                        />
                                    </Stack>

                                    <Divider sx={{ my: 1.5, borderColor: '#f0f0f0' }} />

                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color="textSecondary" display="block">KHU VỰC</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{areaCount}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color="textSecondary" display="block">TỔNG GHẾ</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{totalSeats}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color="textSecondary" display="block">GHẾ HỎNG</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>{lockedCount}</Typography>
                                        </Grid>
                                    </Grid>

                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<GridView />}
                                        onClick={() => handleEditLayout(venue)}
                                        size="small"
                                    >
                                        Cài đặt sơ đồ
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Editor Dialog */}
            <Dialog
                open={showEditModal}
                onClose={() => !saving && setShowEditModal(false)}
                maxWidth="lg"
                fullWidth
            >
                <Box sx={{ p: 2.5, borderBottom: '1px solid #EBEEF5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Thiết Kế Sơ Đồ: {selectedVenue?.venue_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Cấu trúc khu vực và trạng thái ghế ngồi
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setShowEditModal(false)} disabled={saving}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 0, display: 'flex' }}>
                    {/* Sidebar - Area Management */}
                    <Box sx={{ width: 300, borderRight: '1px solid #eee', p: 3, bgcolor: '#fafafa', overflowY: 'auto' }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={addNewArea}
                            sx={{ mb: 3, borderRadius: 2 }}
                        >
                            Thêm khu vực mới
                        </Button>

                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11 }}>
                            Danh sách khu vực ({areas.length})
                        </Typography>

                        <Stack spacing={1}>
                            {areas.map((area, idx) => (
                                <Paper
                                    key={idx}
                                    onClick={() => setActiveAreaIndex(idx)}
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        cursor: 'pointer',
                                        borderRadius: 2,
                                        border: '1px solid',
                                        borderColor: activeAreaIndex === idx ? 'primary.main' : 'divider',
                                        bgcolor: activeAreaIndex === idx ? 'primary.lighter' : 'white',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: activeAreaIndex === idx ? 700 : 500, color: activeAreaIndex === idx ? 'primary.main' : 'text.primary' }}>
                                        {area.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {area.rows} hàng x {area.cols} cột ({area.rows * area.cols} ghế)
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        sx={{ position: 'absolute', top: 5, right: 5, color: 'error.light' }}
                                        onClick={(e) => { e.stopPropagation(); removeArea(idx); }}
                                    >
                                        <Delete fontSize="inherit" />
                                    </IconButton>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>

                    {/* Main - Layout Editor */}
                    <Box sx={{ flexGrow: 1, p: 4, overflowY: 'auto' }}>
                        {areas.length > 0 ? (
                            <Box>
                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Tên khu vực"
                                            size="small"
                                            value={areas[activeAreaIndex].name}
                                            onChange={(e) => updateAreaProperty(activeAreaIndex, 'name', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Số hàng"
                                            size="small"
                                            value={areas[activeAreaIndex].rows}
                                            onChange={(e) => updateAreaProperty(activeAreaIndex, 'rows', parseInt(e.target.value) || 1)}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Số cột"
                                            size="small"
                                            value={areas[activeAreaIndex].cols}
                                            onChange={(e) => updateAreaProperty(activeAreaIndex, 'cols', parseInt(e.target.value) || 1)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                                            <Block sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                            {areas[activeAreaIndex].locked_seats.length} ghế hỏng/khóa
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Trình xem trước sơ đồ</Typography>

                                {renderSeatMap(areas[activeAreaIndex], activeAreaIndex)}

                                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                                    <Alert severity="info" variant="standard" sx={{ bgcolor: 'transparent', p: 0 }}>
                                        Hướng dẫn: Click vào từng ghế để chuyển trạng thái giữa <b>Bình thường</b> và <b>Hỏng (Không thể bán)</b>.
                                    </Alert>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                                <GridView sx={{ fontSize: 64, mb: 2, opacity: 0.1 }} />
                                <Typography>Hãy thêm ít nhất một khu vực để bắt đầu thiết kế</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee', bgcolor: '#fafafa' }}>
                    <Button onClick={() => setShowEditModal(false)} disabled={saving} color="inherit">
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                        onClick={handleSaveLayout}
                        disabled={saving || areas.length === 0}
                        sx={{ px: 4, borderRadius: 2 }}
                    >
                        Lưu sơ đồ địa điểm
                    </Button>
                </DialogActions>
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

export default VenuesManagement;
