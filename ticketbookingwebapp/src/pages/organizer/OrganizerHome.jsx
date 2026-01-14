import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    Stack,
    Grid,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    useScrollTrigger,
    Fade,
    Paper,
    ThemeProvider,
    CssBaseline
} from '@mui/material';
import {
    ConfirmationNumber as TicketIcon,
    RocketLaunch as RocketIcon,
    ShowChart as ChartIcon,
    Groups as GroupsIcon,
    SupportAgent as SupportIcon,
    AddCircleOutline as PlusIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import OrganizerAuthModal from '../../components/auth/OrganizerAuthModal';
import organizerTheme from '../../theme/organizer-theme';

// Scroll to top button or elevation trigger
function ElevationScroll(props) {
    const { children, window } = props;
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
        target: window ? window() : undefined,
    });

    return React.cloneElement(children, {
        elevation: trigger ? 4 : 0,
        sx: {
            bgcolor: trigger ? 'background.paper' : 'transparent',
            color: trigger ? 'text.primary' : 'white',
            transition: 'all 0.3s'
        }
    });
}

const OrganizerHome = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';
        if (isAuthenticated && isOrganizer) {
            navigate('/organizer/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const features = [
        {
            title: 'Tạo Sự Kiện Dễ Dàng',
            desc: 'Quy trình tạo sự kiện chuyên nghiệp với đầy đủ cấu hình loại vé và sơ đồ ghế.',
            icon: <PlusIcon fontSize="large" color="primary" />,
        },
        {
            title: 'Phân Tích Doanh Thu',
            desc: 'Theo dõi báo cáo doanh thu và lượng vé bán ra theo thời gian thực.',
            icon: <ChartIcon fontSize="large" color="primary" />,
        },
        {
            title: 'Quản Lý Khách Hàng',
            desc: 'Dễ dàng quản lý thông tin người mua vé và các yêu cầu hỗ trợ.',
            icon: <GroupsIcon fontSize="large" color="primary" />,
        },
        {
            title: 'Hỗ Trợ 24/7',
            desc: 'Đội ngũ kỹ thuật luôn sẵn sàng hỗ trợ bạn trong mọi khâu tổ chức.',
            icon: <SupportIcon fontSize="large" color="primary" />,
        }
    ];

    return (
        <ThemeProvider theme={organizerTheme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                {/* Navbar */}
                <ElevationScroll>
                    <AppBar position="fixed">
                        <Container maxWidth="lg">
                            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
                                    <TicketIcon sx={{ fontSize: 32, color: '#2dc275' }} />
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'inherit' }}>
                                        TicketBooking
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button
                                        color="inherit"
                                        onClick={() => navigate('/')}
                                        sx={{
                                            fontWeight: 600,
                                            px: 2,
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: 'rgba(45, 194, 117, 0.08)',
                                                color: 'primary.main',
                                                transform: 'translateY(-1px)'
                                            }
                                        }}
                                    >
                                        Trang chủ TicketBooking
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => setShowAuthModal(true)}
                                        sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                                    >
                                        Đăng nhập
                                    </Button>
                                </Stack>
                            </Toolbar>
                        </Container>
                    </AppBar>
                </ElevationScroll>

                {/* Hero Section */}
                <Box
                    sx={{
                        height: '70vh',
                        minHeight: 500,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'white',
                        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mb: 8
                    }}
                >
                    <Container maxWidth="lg">
                        <Grid container spacing={4} justifyContent="center">
                            <Grid item xs={12} md={10} lg={8}>
                                <Fade in timeout={1000}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                            Nền Tảng Quản Lý Sự Kiện Số 1 Việt Nam
                                        </Typography>
                                        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                                            Giải pháp toàn diện giúp bạn tổ chức, quảng bá và bán vé sự kiện hiệu quả nhất.
                                        </Typography>
                                        <Stack direction="row" spacing={2} justifyContent="center">
                                            <Button
                                                variant="contained"
                                                size="large"
                                                startIcon={<RocketIcon />}
                                                onClick={() => setShowAuthModal(true)}
                                                sx={{
                                                    py: 1.5,
                                                    px: 4,
                                                    borderRadius: 2,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 700,
                                                    bgcolor: '#2dc275',
                                                    '&:hover': { bgcolor: '#219d5c' }
                                                }}
                                            >
                                                BẮT ĐẦU NGAY
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                sx={{
                                                    py: 1.5,
                                                    px: 4,
                                                    borderRadius: 2,
                                                    fontSize: '1.1rem',
                                                    fontWeight: 700,
                                                    color: 'white',
                                                    borderColor: 'white',
                                                    '&:hover': { borderColor: '#2dc275', bgcolor: 'rgba(45, 194, 117, 0.1)' }
                                                }}
                                            >
                                                TÌM HIỂU THÊM
                                            </Button>
                                        </Stack>
                                    </Box>
                                </Fade>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* Features Section */}
                <Container maxWidth="lg" sx={{ mb: 12 }}>
                    <Box sx={{ textAlign: 'center', mb: 8 }}>
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                            Tại sao chọn <Box component="span" sx={{ color: 'primary.main' }}>TicketBooking</Box>?
                        </Typography>
                        <Box sx={{ width: 80, height: 4, bgcolor: 'primary.main', mx: 'auto', borderRadius: 2 }} />
                    </Box>

                    <Grid container spacing={4} justifyContent="center">
                        {features.map((f, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        textAlign: 'center',
                                        borderRadius: 4,
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: 4,
                                            borderColor: 'primary.light'
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ mb: 3 }}>{f.icon}</Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                                            {f.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {f.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>

                {/* CTA Section */}
                <Box sx={{ bgcolor: 'action.hover', py: 12 }}>
                    <Container maxWidth="md">
                        <Paper
                            sx={{
                                p: 6,
                                textAlign: 'center',
                                borderRadius: 6,
                                background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                                color: 'white',
                                boxShadow: '0 20px 40px rgba(45, 194, 117, 0.2)'
                            }}
                        >
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                                Sẵn sàng bắt đầu sự kiện của bạn?
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                                Tham gia cùng hơn 1.000 nhà tổ chức sự kiện chuyên nghiệp khác ngay hôm nay.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => setShowAuthModal(true)}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    fontWeight: 800,
                                    px: 5,
                                    py: 2,
                                    borderRadius: 3,
                                    '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.05)' },
                                    transition: 'all 0.2s'
                                }}
                            >
                                ĐĂNG KÝ NGAY
                            </Button>
                        </Paper>
                    </Container>
                </Box>

                {/* Footer */}
                <Box sx={{ py: 6, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">
                        © 2026 TicketBooking Organizer Portal. Một sản phẩm chất lượng dành cho nhà tổ chức.
                    </Typography>
                </Box>

                {/* Auth Modal */}
                <OrganizerAuthModal
                    show={showAuthModal}
                    onHide={() => setShowAuthModal(false)}
                />
            </Box>
        </ThemeProvider>
    );
};

export default OrganizerHome;
