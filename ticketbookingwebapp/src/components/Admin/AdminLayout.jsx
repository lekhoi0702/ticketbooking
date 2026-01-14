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
        <div>
            <Toolbar sx={{ px: 2, py: 3 }}>
                <Typography variant="h5" noWrap component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    TicketBooking
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ px: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.lighter',
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.lighter'
                                    }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <AppBar
                    position="fixed"
                    sx={{
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        ml: { sm: `${drawerWidth}px` },
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 1
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Admin Panel'}
                        </Typography>
                        <div>
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
                        p: 3,
                        width: { sm: `calc(100% - ${drawerWidth}px)` },
                        backgroundColor: 'background.default',
                        minHeight: '100vh'
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="xl" sx={{ mt: 2 }}>
                        <Outlet />
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default AdminLayout;
