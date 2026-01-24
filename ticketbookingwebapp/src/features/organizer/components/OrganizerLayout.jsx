import React, { useState, useEffect } from 'react';
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
    Badge,
    List,
    Empty,
    Spin,
    Divider
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
    TagsOutlined,
    RollbackOutlined,
    RightOutlined
} from '@ant-design/icons';
import { AntdThemeConfig } from '@theme/AntdThemeConfig';
import { usePendingRefunds } from '@shared/hooks/usePendingRefunds';
import { api } from '@services/api';
import ChangePasswordModal from '@features/user/components/Account/ChangePasswordModal';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const OrganizerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const { pendingCount, refresh: refreshPendingCount } = usePendingRefunds();
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const fetchNotifications = async () => {
        if (!user?.user_id) return;
        try {
            setLoadingNotifications(true);
            const res = await api.getRefundRequests(user.user_id);
            if (res.success) {
                setNotifications(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    useEffect(() => {
        if (notificationOpen && user?.user_id) {
            fetchNotifications();
        }
    }, [notificationOpen, user?.user_id]);

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
            key: '/organizer/refund-requests',
            icon: <RollbackOutlined />,
            label: (
                <Space>
                    Yêu cầu hoàn tiền
                    {pendingCount > 0 && <Badge count={pendingCount} size="small" />}
                </Space>
            ),
            onClick: () => navigate('/organizer/refund-requests'),
        },
        {
            key: '/organizer/discounts',
            icon: <TagsOutlined />,
            label: 'Mã giảm giá',
            onClick: () => navigate('/organizer/discounts'),
        },
        {
            key: '/organizer/qr-codes',
            icon: <QrcodeOutlined />,
            label: 'Quản lý QR Code',
            onClick: () => navigate('/organizer/qr-codes'),
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
            'refund-requests': 'Yêu cầu hoàn tiền',
            'discounts': 'Mã giảm giá',
            'qr-codes': 'Quản lý QR Code'
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
                        <Dropdown
                            open={notificationOpen}
                            onOpenChange={setNotificationOpen}
                            trigger={['click']}
                            placement="bottomRight"
                            dropdownRender={() => (
                                <div style={{
                                    width: 380,
                                    background: '#fff',
                                    borderRadius: 8,
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                                    maxHeight: 450,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        padding: '12px 16px', 
                                        borderBottom: '1px solid #f0f0f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Text strong style={{ fontSize: 15 }}>
                                            Thông báo {pendingCount > 0 && <Badge count={pendingCount} style={{ marginLeft: 8 }} />}
                                        </Text>
                                        {pendingCount > 0 && (
                                            <Button 
                                                type="link" 
                                                size="small"
                                                onClick={() => {
                                                    setNotificationOpen(false);
                                                    navigate('/organizer/refund-requests');
                                                }}
                                            >
                                                Xem tất cả <RightOutlined />
                                            </Button>
                                        )}
                                    </div>
                                    <div style={{ maxHeight: 380, overflow: 'auto' }}>
                                        {loadingNotifications ? (
                                            <div style={{ padding: 40, textAlign: 'center' }}>
                                                <Spin />
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <Empty 
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description="Không có thông báo mới"
                                                style={{ padding: '40px 0' }}
                                            />
                                        ) : (
                                            <List
                                                dataSource={notifications.slice(0, 5)}
                                                renderItem={(item) => (
                                                    <List.Item
                                                        style={{ 
                                                            padding: '12px 16px',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s'
                                                        }}
                                                        className="notification-item-hover"
                                                        onClick={() => {
                                                            setNotificationOpen(false);
                                                            navigate('/organizer/refund-requests');
                                                        }}
                                                    >
                                                        <List.Item.Meta
                                                            avatar={
                                                                <Avatar 
                                                                    style={{ backgroundColor: '#fff2e8', color: '#fa8c16' }}
                                                                    icon={<RollbackOutlined />}
                                                                />
                                                            }
                                                            title={
                                                                <Text style={{ fontSize: 13 }}>
                                                                    Yêu cầu hoàn tiền từ <Text strong>{item.customer_name || item.user_name || 'Khách hàng'}</Text>
                                                                </Text>
                                                            }
                                                            description={
                                                                <div>
                                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                                        Mã đơn: {item.order_code}
                                                                    </Text>
                                                                    <br />
                                                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                                                        {item.event_name} • <Text style={{ color: '#52c41a' }}>{item.total_amount?.toLocaleString()} ₫</Text>
                                                                    </Text>
                                                                </div>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        )}
                                    </div>
                                    {notifications.length > 5 && (
                                        <div style={{ 
                                            padding: '10px 16px', 
                                            borderTop: '1px solid #f0f0f0',
                                            textAlign: 'center'
                                        }}>
                                            <Button 
                                                type="link"
                                                onClick={() => {
                                                    setNotificationOpen(false);
                                                    navigate('/organizer/refund-requests');
                                                }}
                                            >
                                                Xem thêm {notifications.length - 5} yêu cầu khác
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        >
                            <Badge count={pendingCount} offset={[-5, 5]}>
                                <Button
                                    type="text"
                                    icon={<BellOutlined />}
                                    style={{ 
                                        fontSize: 18, 
                                        color: pendingCount > 0 ? '#2DC275' : '#606266',
                                        animation: pendingCount > 0 ? 'bell-shake 0.5s ease-in-out' : 'none'
                                    }}
                                    title={pendingCount > 0 ? `${pendingCount} yêu cầu hoàn tiền chờ xử lý` : 'Thông báo'}
                                />
                            </Badge>
                        </Dropdown>

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

            {user?.must_change_password && (
                <ChangePasswordModal
                    show
                    forceChange
                    onSuccess={() => updateUser({ must_change_password: false })}
                />
            )}
            
            {/* Inline styles for hover effects and animations */}
            <style>{`
                .notification-item-hover:hover {
                    background: #f5f5f5 !important;
                }
                @keyframes bell-shake {
                    0% { transform: rotate(0); }
                    15% { transform: rotate(15deg); }
                    30% { transform: rotate(-15deg); }
                    45% { transform: rotate(10deg); }
                    60% { transform: rotate(-10deg); }
                    75% { transform: rotate(5deg); }
                    100% { transform: rotate(0); }
                }
            `}</style>
        </Layout>
    );
};

export default OrganizerLayout;
