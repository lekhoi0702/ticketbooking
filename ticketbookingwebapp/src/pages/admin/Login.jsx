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
                <Container maxWidth="sm">
                    <Card sx={{ boxShadow: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    mb: 3
                                }}
                            >
                                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                                    <LockOutlined />
                                </Avatar>
                                <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                    TicketBooking Admin
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Đăng nhập trang quản trị
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit} noValidate>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="identifier"
                                    label="Tài khoản"
                                    name="identifier"
                                    autoFocus
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" />}
                                    label="Remember me"
                                    sx={{ mt: 1 }}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                                <Box sx={{ textAlign: 'center' }}>
                                    <MuiLink href="#" variant="body2" underline="hover">
                                        Forgot password?
                                    </MuiLink>
                                </Box>
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
