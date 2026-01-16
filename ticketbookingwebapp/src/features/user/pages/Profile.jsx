import React, { useState } from 'react';
import { Tabs, Card, Avatar, Space, Typography, Divider, Button } from 'antd';
import { UserOutlined, ShoppingOutlined, HistoryOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MyOrdersTab from '@features/user/components/Account/MyOrdersTab';
import MyTicketsTab from '@features/user/components/Account/MyTicketsTab';
import ChangePasswordTab from '@features/user/components/Account/ChangePasswordTab';
import './Profile.css';

const { Title, Text } = Typography;

const Profile = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');

    React.useEffect(() => {
        if (!isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

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
                                icon={<UserOutlined />}
                                src={user?.avatar}
                                style={{ backgroundColor: '#52c41a' }}
                            />
                            <div>
                                <Title level={3} style={{ margin: 0 }}>
                                    {user?.full_name || 'Người dùng'}
                                </Title>
                                <Text type="secondary">{user?.email}</Text>
                                {user?.phone && (
                                    <>
                                        <Divider type="vertical" />
                                        <Text type="secondary">{user?.phone}</Text>
                                    </>
                                )}
                            </div>
                        </Space>
                        <Button
                            danger
                            type="primary"
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
