import React, { useState, useEffect } from 'react';
import { Tabs, Card, Avatar, Space, Typography, Divider, Button } from 'antd';
import { UserOutlined, ShoppingOutlined, HistoryOutlined, LockOutlined, LogoutOutlined, PhoneOutlined, MailOutlined, StarOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MyOrdersTab from '@features/user/components/Account/MyOrdersTab';
import MyTicketsTab from '@features/user/components/Account/MyTicketsTab';
import ChangePasswordTab from '@features/user/components/Account/ChangePasswordTab';
import MyFavoritesTab from '@features/user/components/Account/MyFavoritesTab';
import './Profile.css';

const { Title, Text } = Typography;

const Profile = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['orders', 'tickets', 'password', 'favorites'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const tabItems = [
        {
            key: 'orders',
            label: (
                <span>
                    <HistoryOutlined />
                    Lịch sử đặt vé
                </span>
            ),
            children: <MyOrdersTab />,
        },
        {
            key: 'tickets',
            label: (
                <span>
                    <ShoppingOutlined />
                    Vé của tôi
                </span>
            ),
            children: <MyTicketsTab />,
        },
        {
            key: 'favorites',
            label: (
                <span>
                    <StarOutlined />
                    Yêu thích
                </span>
            ),
            children: <MyFavoritesTab />,
        },
        {
            key: 'password',
            label: (
                <span>
                    <LockOutlined />
                    Đổi mật khẩu
                </span>
            ),
            children: <ChangePasswordTab />,
        },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                {/* Profile Header */}
                <Card className="profile-header-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size="large" align="center">
                            <Avatar
                                size={80}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    overflow: 'hidden'
                                }}
                            >
                                <img
                                    src={user?.avatar || "/mascot.svg"}
                                    alt="Avatar"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        objectPosition: 'top',
                                        transform: 'scale(2.0) translateY(12%)'
                                    }}
                                />
                            </Avatar>
                            <Space direction="vertical" size={0}>
                                <Title level={3} style={{ margin: 0, color: '#ffffff' }}>
                                    {user?.full_name || 'Người dùng'}
                                </Title>
                                <Space split={<Divider type="vertical" style={{ borderColor: '#434343', height: '14px' }} />}>
                                    <Text type="secondary" style={{ color: '#b0b3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MailOutlined /> {user?.email}
                                    </Text>
                                    <Text type="secondary" style={{ color: '#b0b3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <PhoneOutlined /> {user?.phone || 'Chưa cập nhật SĐT'}
                                    </Text>
                                </Space>
                            </Space>
                        </Space>
                        <Button
                            className="logout-btn"
                            size="large"
                            onClick={handleLogout}
                            icon={<LogoutOutlined />}
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </Card>

                {/* Profile Tabs */}
                <Card className="profile-tabs-card">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={tabItems}
                        size="large"
                    />
                </Card>
            </div>
        </div>
    );
};

export default Profile;
