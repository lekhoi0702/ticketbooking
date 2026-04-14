import React, { useState, useEffect } from 'react';
import { Tabs, Card, Avatar, Space, Typography, Divider, Button } from 'antd';
import { ShoppingOutlined, HistoryOutlined, LockOutlined, LogoutOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MyOrdersTab from '@features/user/components/Account/MyOrdersTab';
import MyTicketsTab from '@features/user/components/Account/MyTicketsTab';
import ChangePasswordModal from '@features/user/components/Account/ChangePasswordModal';

import './Profile.css';

const { Title, Text } = Typography;
const VALID_TABS = ['orders', 'tickets'];

const getTabFromSearchParams = (params) => {
    const tab = params.get('tab');
    return VALID_TABS.includes(tab) ? tab : 'orders';
};

const Profile = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => getTabFromSearchParams(searchParams));
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        setActiveTab(getTabFromSearchParams(searchParams));
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
                            <Space orientation="vertical" size={0}>
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
                        <Space size="middle">
                            <Button
                                className="change-password-btn"
                                size="large"
                                onClick={() => setShowPasswordModal(true)}
                                icon={<LockOutlined />}
                            >
                                Đổi mật khẩu
                            </Button>
                            <Button
                                className="logout-btn"
                                size="large"
                                onClick={handleLogout}
                                icon={<LogoutOutlined />}
                            >
                                Đăng xuất
                            </Button>
                        </Space>
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

                {/* Change Password Modal */}
                <ChangePasswordModal
                    show={showPasswordModal}
                    onHide={() => setShowPasswordModal(false)}
                />
            </div>
        </div>
    );
};

export default Profile;
