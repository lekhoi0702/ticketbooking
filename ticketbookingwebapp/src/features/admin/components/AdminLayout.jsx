import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import AdminLogin from '../pages/Login';
import {
    Layout,
    Menu,
    Typography,
    Avatar,
    Button,
    Space,
    Breadcrumb,
    theme as antdTheme
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    FileTextOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    ExclamationCircleOutlined,
    BarChartOutlined,
    TagsOutlined,
    HomeOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const AdminLayout = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/admin/users',
            icon: <TeamOutlined />,
            label: 'Người dùng',
            onClick: () => navigate('/admin/users'),
        },
        {
            key: '/admin/categories',
            icon: <TagsOutlined />,
            label: 'Quản lý thể loại',
            onClick: () => navigate('/admin/categories'),
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
            key: '/admin/statistics',
            icon: <BarChartOutlined />,
            label: 'Thống kê',
            onClick: () => navigate('/admin/statistics'),
        },
        {
            key: '/admin/banners',
            icon: <FileTextOutlined />,
            label: 'Quản lý Banner',
            onClick: () => navigate('/admin/banners'),
        },
        {
            key: '/admin/event-deletion-requests',
            icon: <ExclamationCircleOutlined />,
            label: 'Yêu cầu xóa sự kiện',
            onClick: () => navigate('/admin/event-deletion-requests'),
        },
    ];



    const getBreadcrumbs = () => {
        const pathSnippets = location.pathname.split('/').filter(i => i);
        const breadcrumbs = [];

        // Initial Home icon dẫn về trang Thống kê
        breadcrumbs.push({
            title: <HomeOutlined />,
            onClick: (e) => { e.preventDefault(); navigate('/admin/statistics'); }
        });

        const pathMap = {
            'users': 'Quản lý người dùng',
            'categories': 'Quản lý thể loại',
            'events': 'Quản lý sự kiện',
            'orders': 'Quản lý đơn hàng',
            'statistics': 'Thống kê hệ thống',
            'banners': 'Quản lý Banner',
            'event-deletion-requests': 'Yêu cầu xóa sự kiện',
            'profile': 'Trang cá nhân admin'
        };

        let currentPath = '/admin';

        pathSnippets.forEach((snippet) => {
            if (snippet === 'admin') return;

            currentPath += `/${snippet}`;
            const title = pathMap[snippet];

            if (title) {
                breadcrumbs.push({
                    title: title,
                    onClick: (e) => { e.preventDefault(); navigate(currentPath); }
                });
            }
        });

        return breadcrumbs;
    };

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <AdminLogin />;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                width={260}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1001,
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 16,
                }}>
                    <Title level={4} style={{ color: 'white', margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
                        TICKETBOOKING
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', marginTop: 4, letterSpacing: '1px' }}>
                        ADMIN DASHBOARD
                    </Text>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                />
            </Sider>
            <Layout
                style={{
                    marginLeft: 260,
                    background: '#f0f2f5'
                }}
            >
                <Header
                    style={{
                        padding: '0 24px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                    }}
                >
                    <Breadcrumb items={getBreadcrumbs()} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Space
                            style={{ cursor: 'pointer', padding: '0 8px', borderLeft: '1px solid #f0f0f0', marginLeft: 8 }}
                            onClick={() => navigate('/admin/profile')}
                        >
                            <Avatar
                                style={{ backgroundColor: '#1890ff' }}
                                icon={<UserOutlined />}
                            />
                            <Text strong>
                                Chào, {user?.full_name || user?.email?.split('@')[0] || 'Admin'}
                            </Text>
                        </Space>
                    </div>
                </Header>
                <Content style={{ margin: '24px 24px 0', minHeight: 280 }}>
                    <div style={{
                        padding: 0,
                        minHeight: 'calc(100vh - 112px)',
                        background: 'transparent'
                    }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout >
    );
};

export default AdminLayout;
