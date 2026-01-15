import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from '../../pages/admin/Login';
import {
    Layout,
    Menu,
    Typography,
    Avatar,
    Dropdown,
    Button,
    ConfigProvider,
    theme as antdTheme
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    FileTextOutlined,
    EnvironmentOutlined,
    LogoutOutlined,
    TeamOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { AntdThemeConfig } from '../../theme/AntdThemeConfig';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    if (loading) return null;

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <AdminLogin />;
    }

    const menuItems = [
        {
            key: '/admin/users',
            icon: <TeamOutlined />,
            label: 'Người dùng',
            onClick: () => navigate('/admin/users'),
        },
        {
            key: '/admin/events',
            icon: <CalendarOutlined />,
            label: 'Sự kiện',
            onClick: () => navigate('/admin/events'),
        },
        {
            key: '/admin/orders',
            icon: <FileTextOutlined />,
            label: 'Đơn hàng',
            onClick: () => navigate('/admin/orders'),
        },
        {
            key: '/admin/venues',
            icon: <EnvironmentOutlined />,
            label: 'Địa điểm',
            onClick: () => navigate('/admin/venues'),
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: () => {
                logout();
                navigate('/admin/login');
            },
        },
    ];

    return (
        <ConfigProvider theme={AntdThemeConfig}>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    theme="light"
                    width={260}
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        borderRight: '1px solid #f0f0f0',
                        zIndex: 100,
                    }}
                >
                    <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                        <Title level={4} style={{ margin: 0, color: '#52c41a', fontWeight: 800 }}>
                            {!collapsed ? (
                                <>ADMIN<span style={{ color: '#303133' }}>PANEL</span></>
                            ) : (
                                'A'
                            )}
                        </Title>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        style={{ borderRight: 0, padding: '8px 0' }}
                    />
                </Sider>
                <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'margin-left 0.2s' }}>
                    <Header
                        style={{
                            padding: '0 24px',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #f0f0f0',
                            position: 'sticky',
                            top: 0,
                            zIndex: 99,
                            height: 64,
                        }}
                    >
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: 16, width: 40, height: 40 }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Text strong style={{ color: '#52c41a' }}>Chào, {user?.full_name}</Text>
                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow><Avatar
                                size="large"
                                icon={<UserOutlined />}
                                style={{ cursor: 'pointer', backgroundColor: '#52c41a' }}
                            /></Dropdown>
                        </div>
                    </Header>
                    <Content
                        style={{
                            margin: '24px',
                            minHeight: 280,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ width: '100%', maxWidth: 1400 }}>
                            <Outlet />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default AdminLayout;
