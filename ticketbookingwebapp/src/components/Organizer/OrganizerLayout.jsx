import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Layout,
    Menu,
    Typography,
    Avatar,
    Dropdown,
    Button,
    ConfigProvider,
    Breadcrumb,
    Space
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    LogoutOutlined,
    BellOutlined,
    HomeOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { AntdThemeConfig } from '../../theme/AntdThemeConfig';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const OrganizerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        {
            key: '/organizer/events',
            icon: <CalendarOutlined />,
            label: 'Quản lý sự kiện',
            onClick: () => navigate('/organizer/events'),
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ cá nhân',
            onClick: () => navigate('/organizer/profile'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: handleLogout,
        },
    ];

    const currentMenuItem = menuItems.find(item => item.key === location.pathname);

    return (
        <ConfigProvider theme={AntdThemeConfig}>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    theme="light"
                    width={220}
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
                    <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
                        <AppstoreOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                        {!collapsed && (
                            <Title level={4} style={{ margin: 0, fontSize: '1.2rem', color: '#303133', fontWeight: 700 }}>
                                Organizer
                            </Title>
                        )}
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        style={{ borderRight: 0, padding: '8px 0' }}
                    />
                </Sider>
                <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
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
                        <Space size={16}>
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{ fontSize: 16, width: 40, height: 40 }}
                            />
                            <Breadcrumb
                                items={[
                                    {
                                        title: <HomeOutlined />,
                                        href: '/organizer/events',
                                        onClick: (e) => { e.preventDefault(); navigate('/organizer/events'); }
                                    },
                                    ...(currentMenuItem ? [{ title: currentMenuItem.label }] : [])
                                ]}
                            />
                        </Space>

                        <Space size={20}>
                            <Button type="text" icon={<BellOutlined />} style={{ fontSize: 18, color: '#606266' }} />

                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow><Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 4, transition: 'background 0.3s' }} className="user-dropdown-hover">
                                <Avatar
                                    src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Organizer'}&background=52c41a&color=fff`}
                                    size="small"
                                />
                                <Text strong style={{ color: '#606266' }}>{user?.full_name || 'Nhà tổ chức'}</Text>
                            </Space></Dropdown>
                        </Space>
                    </Header>
                    <Content
                        style={{
                            margin: '24px',
                            minHeight: 280,
                            padding: 0
                        }}
                    >
                        <Outlet />
                    </Content>
                    <div style={{ textAlign: 'center', paddingBottom: 24, color: '#909399' }}>
                        <Text type="secondary">© 2026 TicketBooking - Ant Design Redesign</Text>
                    </div>
                </Layout>
            </Layout>
            <style dangerouslySetInnerHTML={{
                __html: `
                .user-dropdown-hover:hover {
                    background: #f5f5f5;
                }
            `}} />
        </ConfigProvider>
    );
};

export default OrganizerLayout;
