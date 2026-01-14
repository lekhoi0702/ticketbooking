import React from 'react';
import {
    TextField,
    Grid,
    Typography,
    Box
} from '@mui/material';

const EventDateTime = ({ formData, handleInputChange }) => {
    return (
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                Thời gian thực hiện sự kiện
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Ngày & Giờ Bắt Đầu"
                        type="datetime-local"
                        name="start_datetime"
                        value={formData.start_datetime}
                        onChange={handleInputChange}
                        required
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Ngày & Giờ Kết Thúc"
                        type="datetime-local"
                        name="end_datetime"
                        value={formData.end_datetime}
                        onChange={handleInputChange}
                        required
                        InputLabelProps={{
                            shrink: true
                        }}
                    />
                </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                Thời gian mở bán gói vé
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Ngày Mở Bán"
                        type="datetime-local"
                        name="sale_start_datetime"
                        value={formData.sale_start_datetime}
                        onChange={handleInputChange}
                        InputLabelProps={{
                            shrink: true
                        }}
                        helperText="Mặc định là thời điểm đăng sự kiện"
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Ngày Kết Thúc Bán"
                        type="datetime-local"
                        name="sale_end_datetime"
                        value={formData.sale_end_datetime}
                        onChange={handleInputChange}
                        InputLabelProps={{
                            shrink: true
                        }}
                        helperText="Mặc định là thời điểm kết thúc sự kiện"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default EventDateTime;
