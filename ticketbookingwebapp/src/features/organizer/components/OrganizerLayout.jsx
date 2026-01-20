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



    const getBreadcrumbs = () => {
        const pathSnippets = location.pathname.split('/').filter(i => i);
        const breadcrumbs = [];

        // Initial Home item
        breadcrumbs.push({
            title: <HomeOutlined />,
            onClick: (e) => { e.preventDefault(); navigate('/organizer/events'); }
        });

        const pathMap = {
            'events': 'Quản lý sự kiện',
            'create-event': 'Tạo sự kiện',
            'edit-event': 'Chỉnh sửa sự kiện',
            'event': 'Chi tiết sự kiện',
            'manage-seats': 'Quản lý sơ đồ ghế',
            'venues': 'Quản lý địa điểm',
            'tickets': 'Quản lý vé & Check-in',
            'profile': 'Trang cá nhân',
            'edit': 'Chỉnh sửa cá nhân',
            'orders': 'Quản lý đơn hàng',
            'discounts': 'Mã giảm giá'
        };

        let currentPath = '/organizer';

        // Custom logic for event-related subpages to show "Quản lý sự kiện" parent
        const eventSubpages = ['create-event', 'edit-event', 'event', 'manage-seats'];
        const isEventSubpage = pathSnippets.some(snippet => eventSubpages.includes(snippet)) && !pathSnippets.includes('events');

        if (isEventSubpage) {
            breadcrumbs.push({
                title: 'Quản lý sự kiện',
                onClick: (e) => { e.preventDefault(); navigate('/organizer/events'); }
            });
        }

        pathSnippets.forEach((snippet, index) => {
            if (snippet === 'organizer') return;

            currentPath += `/${snippet}`;
            const title = pathMap[snippet];

            if (title) {
                // For 'event' followed by ID, or 'orders' after 'event'
                let displayTitle = title;
                if (snippet === 'orders' && pathSnippets[index - 2] === 'event') {
                    displayTitle = 'Đơn hàng sự kiện';
                }

                if (!breadcrumbs.some(b => b.title === displayTitle)) {
                    breadcrumbs.push({
                        title: displayTitle,
                        onClick: (e) => { e.preventDefault(); navigate(currentPath); }
                    });
                }
            }
        });

        return breadcrumbs;
    };

    return (
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
                <div style={{ height: 64, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 24px', justifyContent: 'center' }}>
                    <Title level={4} style={{ margin: 0, fontSize: '1.2rem', color: '#303133', fontFamily: "'Outfit', sans-serif", fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
                        TICKETBOOKING
                    </Title>
                    <Text style={{ color: '#909399', fontSize: '11px', marginTop: 4, letterSpacing: '0.5px' }}>
                        ORGANIZER DASHBOARD
                    </Text>
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
                        <Breadcrumb items={getBreadcrumbs()} />
                    </Space>

                    <Space size={20}>
                        <Badge count={pendingCount} offset={[-5, 5]}>
                            <Button
                                type="text"
                                icon={<BellOutlined />}
                                style={{ fontSize: 18, color: pendingCount > 0 ? '#2DC275' : '#606266' }}
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
    );
};

export default OrganizerLayout;
