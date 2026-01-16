import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import {
    Layout,
    Menu,
    Typography,
    Avatar,
    Dropdown,
    Button,
    ConfigProvider,
    Breadcrumb,
    Space,
    Badge
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    LogoutOutlined,
    BellOutlined,
    HomeOutlined,
    AppstoreOutlined,
    EnvironmentOutlined,

    QrcodeOutlined,
    LoadingOutlined,
    ShoppingOutlined,
    TagsOutlined
} from '@ant-design/icons';
import { AntdThemeConfig } from '@theme/AntdThemeConfig';
import { usePendingRefunds } from '@shared/hooks/usePendingRefunds';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const OrganizerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { pendingCount } = usePendingRefunds();

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
        },
        {
            key: '/organizer/venues',
            icon: <EnvironmentOutlined />,
            label: 'Quản lý địa điểm',
            onClick: () => navigate('/organizer/venues'),
        },
        {
            key: '/organizer/tickets',
            icon: <QrcodeOutlined />,
            label: 'Quản lý vé & Check-in',
            onClick: () => navigate('/organizer/tickets'),
        },
        {
            key: '/organizer/orders',
            icon: <ShoppingOutlined />,
            label: 'Quản lý đơn hàng',
            onClick: () => navigate('/organizer/orders'),
        },
        {
            key: '/organizer/discounts',
            icon: <TagsOutlined />,
            label: 'Mã giảm giá',
            onClick: () => navigate('/organizer/discounts'),
        }
    ];



    const currentMenuItem = menuItems.find(item => item.key === location.pathname);

    return (
        <ConfigProvider theme={AntdThemeConfig} spin={{ indicator: <LoadingOutlined style={{ fontSize: 24, color: '#52c41a' }} spin /> }}>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
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
                        <Title level={4} style={{ margin: 0, fontSize: '1.2rem', color: '#303133', fontWeight: 700 }}>
                            Organizer
                        </Title>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        style={{ borderRight: 0, padding: '8px 0' }}
                    />
                </Sider>
                <Layout style={{ marginLeft: 220 }}>
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
                            <Badge count={pendingCount} offset={[-5, 5]}>
                                <Button
                                    type="text"
                                    icon={<BellOutlined />}
                                    style={{ fontSize: 18, color: pendingCount > 0 ? '#52c41a' : '#606266' }}
                                    title={pendingCount > 0 ? `${pendingCount} yêu cầu hoàn tiền chờ xử lý` : 'Thông báo'}
                                />
                            </Badge>

                            <div
                                style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 4, transition: 'background 0.3s', display: 'flex', alignItems: 'center', gap: 8 }}
                                className="user-dropdown-hover"
                                onClick={() => navigate('/organizer/profile')}
                            >
                                <Avatar
                                    src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Organizer'}&background=52c41a&color=fff`}
                                    size="small"
                                />
                                <Text strong style={{ color: '#606266' }}>{user?.full_name || 'Nhà tổ chức'}</Text>
                            </div>
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
                        <Text type="secondary">© 2026 TicketBooking</Text>
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
