import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    IconButton,
    Grid,
    Typography,
    Stack,
    Divider,
    Paper,
    Collapse
} from '@mui/material';
import Alert from '@mui/material/Alert';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ConfirmationNumber as TicketIcon,
    Chair as ChairIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import SeatMapTemplateView from './SeatMapTemplateView';

const TicketConfig = ({
    ticketTypes,
    handleTicketTypeChange,
    addTicketType,
    removeTicketType,
    venueTemplate,
    toggleSeatSelection
}) => {
    const [expandedIndex, setExpandedIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragMode, setDragMode] = useState(null);

    // Stop dragging globally
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            setDragMode(null);
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const handleSeatMouseDown = (e, t, index) => {
        e.preventDefault();
        const selected = ticketTypes[index].selectedSeats || [];
        const isSelected = selected.some(s =>
            s.row_name === t.row_name &&
            String(s.seat_number) === String(t.seat_number) &&
            s.area === t.area
        );
        const mode = isSelected ? 'deselect' : 'select';
        setDragMode(mode);
        setIsDragging(true);
        toggleSeatSelection(index, t, mode);
    };

    const handleSeatMouseEnter = (t, index) => {
        if (isDragging && dragMode) {
            toggleSeatSelection(index, t, dragMode);
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <TicketIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Thiết lập các loại vé & Chọn chỗ
                    </Typography>
                </Stack>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addTicketType}
                    sx={{ borderRadius: 2 }}
                >
                    Thêm loại vé mới
                </Button>
            </Stack>

            <Stack spacing={3}>
                {ticketTypes.map((tt, index) => (
                    <Card key={index} sx={{ borderRadius: 3, border: 1, borderColor: expandedIndex === index ? 'primary.main' : 'divider', boxShadow: expandedIndex === index ? 3 : 1 }}>
                        <CardContent sx={{ p: 0 }}>
                            <Box
                                onClick={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                                sx={{
                                    p: 2,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    bgcolor: expandedIndex === index ? 'primary.lighter' : 'transparent'
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                                        {tt.type_name || `Loại vé ${index + 1}`}
                                    </Typography>
                                    <Paper sx={{ px: 1.5, py: 0.2, bgcolor: 'primary.main', color: 'white', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}>
                                        {tt.selectedSeats?.length || 0} Ghế
                                    </Paper>
                                </Stack>
                                <Stack direction="row" spacing={1}>
                                    {ticketTypes.length > 1 && (
                                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); removeTicketType(index); }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    <IconButton size="small">
                                        {expandedIndex === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                </Stack>
                            </Box>

                            <Collapse in={expandedIndex === index}>
                                <Divider />
                                <Box sx={{ p: 3 }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Tên Loại Vé"
                                                size="small"
                                                value={tt.type_name}
                                                onChange={(e) => handleTicketTypeChange(index, 'type_name', e.target.value)}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Giá Vé (VND)"
                                                type="number"
                                                size="small"
                                                value={tt.price}
                                                onChange={(e) => handleTicketTypeChange(index, 'price', e.target.value)}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Số Lượng (Tự động)"
                                                type="number"
                                                size="small"
                                                disabled
                                                value={tt.quantity}
                                                helperText="Dựa trên số ghế đã chọn"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f1f3f4', borderRadius: 2 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                                    <ChairIcon fontSize="small" color="primary" /> Sơ đồ chọn chỗ cho hạng "{tt.type_name || 'này'}"
                                                </Typography>

                                                {venueTemplate ? (
                                                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                                                        <SeatMapTemplateView
                                                            venueTemplate={venueTemplate}
                                                            selectedTemplateSeats={tt.selectedSeats || []}
                                                            allOccupiedSeats={ticketTypes.filter((_, i) => i !== index).flatMap(t => t.selectedSeats || []).map(s => ({ ...s, ticket_type_id: 'other' }))}
                                                            activeTicketType={{ ticket_type_id: 'current' }}
                                                            handleSeatMouseDown={(e, t) => handleSeatMouseDown(e, t, index)}
                                                            handleSeatMouseEnter={(t) => handleSeatMouseEnter(t, index)}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Alert severity="warning">Vui lòng chọn địa điểm tổ chức để hiển thị sơ đồ ghế.</Alert>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Collapse>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default TicketConfig;
