import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Stack,
    IconButton,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import EventTable from '../../components/Organizer/EventTable';
import { useEventList } from '../../hooks/useEventList';

const EventList = () => {
    const { events, loading, error, handlePublishEvent, fetchEvents } = useEventList();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = events.filter(event =>
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={60} thickness={4} />
                    <Typography variant="h6" color="text.secondary">
                        Đang tải danh sách sự kiện...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header Section */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Sự kiện của tôi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Quản lý và theo dõi tất cả sự kiện của bạn
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchEvents}
                        sx={{ borderRadius: 2 }}
                    >
                        Làm mới
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/organizer/create-event"
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #219d5c 0%, #17834a 100%)'
                            }
                        }}
                    >
                        Tạo sự kiện mới
                    </Button>
                </Stack>
            </Stack>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    <strong>Lỗi:</strong> {error}
                </Alert>
            )}

            {/* Main Card */}
            <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                    {/* Search and Stats */}
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        spacing={2}
                        sx={{ mb: 3 }}
                    >
                        <TextField
                            placeholder="Tìm kiếm tên sự kiện..."
                            variant="outlined"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                maxWidth: { md: 400 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                Tổng cộng:
                            </Typography>
                            <Chip
                                label={`${filteredEvents.length} sự kiện`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 600 }}
                            />
                        </Stack>
                    </Stack>

                    {/* Event Table */}
                    <EventTable
                        events={filteredEvents}
                        handlePublishEvent={handlePublishEvent}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};

export default EventList;
