import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Alert,
    CircularProgress,
    Container,
    CssBaseline,
    ThemeProvider,
    Stack
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    LockOutlined as LockIcon,
    EmailOutlined as EmailIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import organizerTheme from '../../theme/organizer-theme';

const OrganizerLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Identifier can be email, phone or username
            const res = await api.login({ ...formData, required_role: 'ORGANIZER' });
            if (res.success) {
                login(res.user, res.token);
                // Force a small delay to ensure state is updated
                setTimeout(() => {
                    navigate('/organizer/dashboard');
                }, 100);
            } else {
                setError(res.message || 'Đăng nhập không thành công.');
            }
        } catch (err) {
            setError(err.message || 'Thông tin đăng nhập không chính xác.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={organizerTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle at 20% 20%, rgba(45, 194, 117, 0.05) 0%, #ffffff 50%, rgba(45, 194, 117, 0.05) 100%)',
                    p: 2
                }}
            >
                <Container maxWidth="sm">
                    <Card sx={{ borderRadius: 4, boxShadow: 6, overflow: 'hidden' }}>
                        <Box
                            sx={{
                                py: 4,
                                px: 3,
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                                color: 'white'
                            }}
                        >
                            <TicketIcon sx={{ fontSize: 48, mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: 1 }}>
                                TICKETBOOKING
                            </Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                                Dành Cho Nhà Tổ Chức
                            </Typography>
                        </Box>

                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                                Đăng Nhập Hệ Thống
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        fullWidth
                                        label="Email hoặc Số điện thoại"
                                        variant="outlined"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Mật khẩu"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        size="large"
                                        variant="contained"
                                        disabled={loading}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 2,
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                                            boxShadow: '0 4px 12px rgba(45, 194, 117, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #219d5c 0%, #17834a 100%)',
                                            }
                                        }}
                                    >
                                        {loading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            'ĐĂNG NHẬP NGAY'
                                        )}
                                    </Button>

                                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Chưa có tài khoản đối tác?{' '}
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                sx={{
                                                    color: 'primary.main',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                Đăng ký ngay
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
                        © 2026 TicketBooking Organizer Panel. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default OrganizerLogin;
