import React, { useState } from 'react';
import { Tabs, Card, Avatar, Space, Typography, Divider, Button } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordTab from '@features/user/components/Account/ChangePasswordTab';
import './Profile.css';

const { Title, Text } = Typography;

const Profile = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('password');

    const tabItems = [
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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
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
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <div>
                                <Title level={3} style={{ margin: 0 }}>
                                    {user?.full_name || 'Admin'}
                                </Title>
                                <Text type="secondary">{user?.email}</Text>
                                <div style={{ marginTop: 4 }}>
                                    <Text type="success" strong>ADMINISTRATOR</Text>
                                </div>
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
