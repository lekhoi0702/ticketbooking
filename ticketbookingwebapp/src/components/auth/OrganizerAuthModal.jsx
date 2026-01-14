import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Alert,
    Box,
    Typography,
    Stack,
    IconButton,
    InputAdornment,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    LockOutlined as LockIcon,
    EmailOutlined as EmailIcon,
    ArrowForward as ArrowForwardIcon,
    CalendarToday as CalendarIcon,
    Visibility,
    VisibilityOff,
    AccountCircle as AccountIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const OrganizerAuthModal = ({ show, onHide }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.login({
                email: formData.email,
                password: formData.password
            });

            if (res.success) {
                if (res.user.role === 'ORGANIZER' || res.user.role === 'ADMIN') {
                    // USE THE LOGIN FUNCTION FROM CONTEXT
                    login(res.user, res.token);

                    // Close modal and redirect
                    onHide();
                    // Small timeout to ensure context updates
                    setTimeout(() => {
                        navigate('/organizer/dashboard');
                    }, 100);
                } else {
                    setError('Tài khoản không có quyền tạo sự kiện. Vui lòng liên hệ admin để được cấp quyền.');
                }
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra trong quá trình đăng nhập.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ email: '', password: '' });
        setError(null);
        onHide();
    };

    return (
        <Dialog
            open={show}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, overflow: 'hidden' }
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Box
                    sx={{
                        py: 3,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                        color: 'white',
                        position: 'relative'
                    }}
                >
                    <IconButton
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1
                        }}
                    >
                        <CalendarIcon fontSize="large" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        TicketBooking Organizer
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: { xs: 3, md: 5 } }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>

                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.8 }}>

                    </Typography>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        variant="filled"
                        sx={{ mb: 3, borderRadius: 2, fontSize: '0.85rem' }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                        <TextField
                            fullWidth
                            label="Tên đăng nhập"
                            variant="outlined"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon sx={{ color: 'primary.main', opacity: 0.7 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: 'grey.50',
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Mật khẩu"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon sx={{ color: 'primary.main', opacity: 0.7 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: 'grey.50',
                                    '&:hover fieldset': { borderColor: 'primary.main' },
                                }
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            endIcon={loading ? null : <ArrowForwardIcon />}
                            sx={{
                                py: 1.8,
                                borderRadius: 3,
                                fontWeight: 800,
                                fontSize: '1rem',
                                letterSpacing: '0.5px',
                                background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                                boxShadow: '0 8px 20px rgba(45, 194, 117, 0.3)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #219d5c 0%, #17834a 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 25px rgba(45, 194, 117, 0.4)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'ĐĂNG NHẬP HỆ THỐNG'}
                        </Button>
                    </Stack>
                </Box>

                <Divider sx={{ my: 4, opacity: 0.6 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', px: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Thông tin thêm
                    </Typography>
                </Divider>

                <Typography variant="body2" color="text.secondary" align="center">
                    Chưa có tài khoản nhà tổ chức?{' '}
                    <Typography
                        component="span"
                        variant="body2"
                        sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            '&:hover': {
                                textDecoration: 'underline',
                                color: 'primary.dark'
                            }
                        }}
                    >
                        Liên hệ Admin
                    </Typography>
                </Typography>
            </DialogContent>
        </Dialog>
    );
};

export default OrganizerAuthModal;
