import React from 'react';
import {
    TextField,
    MenuItem,
    Grid,
    FormControlLabel,
    Switch,
    Box
} from '@mui/material';

const EventBasicInfo = ({ formData, handleInputChange, categories, venues }) => {
    return (
        <Box>
            <TextField
                fullWidth
                label="Tên Sự Kiện"
                name="event_name"
                value={formData.event_name}
                onChange={handleInputChange}
                placeholder="VD: Live Concert Rap Việt 2024"
                required
                sx={{ mb: 3 }}
            />

            <TextField
                fullWidth
                label="Mô Tả Chi Tiết"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Giới thiệu về sự kiện, dàn nghệ sĩ, lịch trình..."
                multiline
                rows={6}
                sx={{ mb: 3 }}
            />

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        select
                        label="Danh Mục"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                    >
                        <MenuItem value="">Chọn danh mục</MenuItem>
                        {categories.map(cat => (
                            <MenuItem key={cat.category_id} value={cat.category_id}>
                                {cat.category_name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        select
                        label="Địa Điểm Tổ Chức"
                        name="venue_id"
                        value={formData.venue_id}
                        onChange={handleInputChange}
                        required
                    >
                        <MenuItem value="">Chọn địa điểm</MenuItem>
                        {venues.map(venue => (
                            <MenuItem key={venue.venue_id} value={venue.venue_id}>
                                {venue.venue_name} - {venue.city}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        select
                        label="Trạng Thái Đăng"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                    >
                        <MenuItem value="DRAFT">Lưu bản nháp</MenuItem>
                        <MenuItem value="PENDING_APPROVAL">Gửi yêu cầu phê duyệt</MenuItem>
                    </TextField>
                </Grid>

            </Grid>
        </Box>
    );
};

export default EventBasicInfo;
