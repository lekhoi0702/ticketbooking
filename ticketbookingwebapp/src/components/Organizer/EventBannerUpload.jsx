import React from 'react';
import {
    Box,
    Button,
    Typography,
    Stack,
    Paper
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Image as ImageIcon
} from '@mui/icons-material';

const EventBannerUpload = ({ bannerPreview, handleImageChange, removeBanner }) => {
    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    minHeight: 280,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    border: 2,
                    borderStyle: bannerPreview ? 'solid' : 'dashed',
                    borderColor: bannerPreview ? 'success.main' : 'divider',
                    borderRadius: 3,
                    bgcolor: 'background.default',
                    transition: 'all 0.3s'
                }}
            >
                {bannerPreview ? (
                    <Box sx={{ width: '100%' }}>
                        <Box
                            component="img"
                            src={bannerPreview}
                            alt="Banner Preview"
                            sx={{
                                width: '100%',
                                height: 240,
                                objectFit: 'cover',
                                borderRadius: 2,
                                mb: 2
                            }}
                        />
                        <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={removeBanner}
                            >
                                Xóa ảnh
                            </Button>
                            <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<ImageIcon />}
                                component="label"
                            >
                                Thay đổi
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Stack>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'success.lighter',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}
                        >
                            <CloudUploadIcon sx={{ fontSize: 40, color: 'success.main' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Tải lên ảnh bìa (Banner)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Định dạng JPG, PNG, WEBP.<br />
                            Kích thước gợi ý: 1200x480px (Tỉ lệ 2.5:1)
                        </Typography>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)'
                            }}
                        >
                            Chọn Ảnh Từ Máy Tính
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default EventBannerUpload;
