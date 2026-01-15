import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from '../../pages/admin/Login';
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
    Container
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    EventAvailable as EventIcon,
    Receipt as ReceiptIcon,
    Place as PlaceIcon,
    AccountCircle,
    Logout
} from '@mui/icons-material';
import theme from '../../theme/mantis-theme';

const drawerWidth = 260;

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/admin/login');
    };

    if (loading) return null;

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <AdminLogin />;
    }

    const menuItems = [
        { path: '/admin/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
        { path: '/admin/users', icon: <PeopleIcon />, label: 'Users' },
        { path: '/admin/events', icon: <EventIcon />, label: 'Events' },
        { path: '/admin/orders', icon: <ReceiptIcon />, label: 'Orders' },
        { path: '/admin/venues', icon: <PlaceIcon />, label: 'Venues' }
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ px: 3, py: 3, minHeight: '64px !important' }}>
                <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.5px' }}>
                    ADMIN<span style={{ color: '#303133' }}>PANEL</span>
                </Typography>
            </Toolbar>
            <Divider sx={{ borderColor: '#f0f0f0' }} />
            <List sx={{ px: 1.5, py: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: '4px',
                                py: 1.2,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.light',
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main'
                                    },
                                    '&:hover': {
                                        backgroundColor: 'primary.light'
                                    }
                                },
                                '&:hover': {
                                    backgroundColor: '#f5f7fa'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : '#909399', minWidth: 38 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontSize: '0.875rem',
                                    fontWeight: location.pathname === item.path ? 600 : 500
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', bgcolor: '#f5f7fa', minHeight: '100vh' }}>
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        ml: { sm: `${drawerWidth}px` },
                        backgroundColor: '#ffffff',
                        color: '#303133',
                        borderBottom: '1px solid #dcdfe6',
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 2, display: { sm: 'none' } }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#606266' }}>
                                {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                            </Typography>
                        </Box>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                {user?.full_name?.charAt(0) || 'A'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {user?.full_name}
                                </Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <AccountCircle fontSize="small" />
                                </ListItemIcon>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Logout
                            </MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' }
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    backgroundColor: 'background.default',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', // This Centers children
                    width: '100%'
                }}
            >
                <Toolbar />
                <Box sx={{
                    width: '100%',
                    maxWidth: '1440px',
                    px: { xs: 2, sm: 4, md: 6 },
                    py: 4
                }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
        </ThemeProvider >
    );
};

export default AdminLayout;
