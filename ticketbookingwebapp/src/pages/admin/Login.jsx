import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ThemeProvider } from '@mui/material/styles';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    CssBaseline,
    Avatar,
    FormControlLabel,
    Checkbox,
    Link as MuiLink
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import theme from '../../theme/mantis-theme';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.login({ ...formData, required_role: 'ADMIN' });
            if (res.success) {
                login(res.user, res.token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Tài khoản hoặc mật khẩu không đúng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.default'
                }}
            >
                <Container maxWidth="xs">
                    <Card sx={{ border: '1px solid #dcdfe6', boxShadow: '0 2px 12px 0 rgba(0,0,0,.1)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mb: 4
                                }}
                            >
                                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                                    ADMIN<span style={{ color: '#303133' }}>PANEL</span>
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Hệ thống quản trị TicketBooking
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#606266' }}>Tài khoản</Typography>
                                <TextField
                                    fullWidth
                                    id="identifier"
                                    name="identifier"
                                    autoFocus
                                    placeholder="Email admin"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                />

                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#606266' }}>Mật khẩu</Typography>
                                <TextField
                                    fullWidth
                                    name="password"
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 2, mb: 2, py: 1.2, fontWeight: 600 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                    <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 3 }}>
                        © 2026 TicketBooking. All rights reserved.
                    </Typography>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default AdminLogin;
