import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    CssBaseline,
    useMediaQuery,
    useTheme as useMuiTheme,
    Chip,
    Stack
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Event as EventIcon,
    AddCircleOutline as AddIcon,
    AccountCircle as AccountIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon,
    ConfirmationNumber as TicketIcon
} from '@mui/icons-material';
import organizerTheme from '../../theme/organizer-theme';

const drawerWidth = 260;

const OrganizerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleProfileMenuClose();
        logout();
        navigate('/');
    };

    const menuItems = [
        {
            path: '/organizer/dashboard',
            icon: <DashboardIcon />,
            label: 'Bảng điều khiển',
            color: '#2dc275'
        },
        {
            path: '/organizer/events',
            icon: <EventIcon />,
            label: 'Quản lý sự kiện',
            color: '#ff6f00'
        }
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo Section */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    background: 'linear-gradient(135deg, #2dc275 0%, #219d5c 100%)',
                    color: 'white'
                }}
            >
                <TicketIcon sx={{ fontSize: 32 }} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                        TicketBooking
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Organizer Panel
                    </Typography>
                </Box>
            </Box>

            {/* User Info Card */}
            {/* <Box
                sx={{
                    p: 2,
                    m: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Organizer'}&background=2dc275&color=fff`}
                        sx={{ width: 48, height: 48 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                            {user?.full_name || 'Nhà tổ chức'}
                        </Typography>
                        <Chip
                            label="Organizer"
                            size="small"
                            sx={{
                                mt: 0.5,
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: 'primary.main',
                                color: 'white'
                            }}
                        />
                    </Box>
                </Stack>
            </Box> */}

            <Divider />

            {/* Menu Items */}
            <List sx={{ px: 2, py: 1, flex: 1 }}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            px: 2,
                            py: 1,
                            color: 'text.secondary',
                            fontWeight: 600,
                            letterSpacing: 0.5
                        }}
                    >
                        MENU CHÍNH
                    </Typography>
                </ListItem>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.5,
                                    bgcolor: isActive ? 'primary.main' : 'transparent',
                                    color: isActive ? 'white' : 'text.primary',
                                    '&:hover': {
                                        bgcolor: isActive ? 'primary.dark' : 'action.hover'
                                    },
                                    transition: 'all 0.2s'
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'white' : item.color,
                                        minWidth: 40
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: isActive ? 600 : 500
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider />

            {/* Footer */}
            {/* <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    © 2026 TicketBooking
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Version 2.0
                </Typography>
            </Box> */}
        </Box>
    );

    return (
        <ThemeProvider theme={organizerTheme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                {/* AppBar */}
                <AppBar
                    position="fixed"
                    sx={{
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        ml: { md: `${drawerWidth}px` },
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 1
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                            <IconButton color="inherit">
                                <NotificationsIcon />
                            </IconButton>

                            <IconButton
                                onClick={handleProfileMenuOpen}
                                sx={{ p: 0.5 }}
                            >
                                <Avatar
                                    src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Organizer'}&background=2dc275&color=fff`}
                                    sx={{ width: 36, height: 36 }}
                                />
                            </IconButton>
                        </Stack>

                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleProfileMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                                sx: {
                                    mt: 1.5,
                                    minWidth: 200,
                                    borderRadius: 2,
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {user?.full_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {user?.email}
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={() => { navigate('/organizer/profile'); handleProfileMenuClose(); }}>
                                <ListItemIcon>
                                    <AccountIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Hồ sơ</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" color="error" />
                                </ListItemIcon>
                                <ListItemText>Đăng xuất</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                {/* Drawer */}
                <Box
                    component="nav"
                    sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                >
                    {/* Mobile drawer */}
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth
                            }
                        }}
                    >
                        {drawer}
                    </Drawer>

                    {/* Desktop drawer */}
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth
                            }
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        mt: 8
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default OrganizerLayout;
