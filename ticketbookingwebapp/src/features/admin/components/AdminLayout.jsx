import React, { useState } from 'react';
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
    Dropdown,
    Modal,
    Form,
    Input,
    message
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
    HomeOutlined,
    HistoryOutlined,
    LockOutlined,
    LogoutOutlined,
    DownOutlined
} from '@ant-design/icons';
import { api } from '@services/api';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const AdminLayout = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const [changingPassword, setChangingPassword] = useState(false);

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
            key: '/admin/audit-logs',
            icon: <HistoryOutlined />,
            label: 'Nhật ký hoạt động',
            onClick: () => navigate('/admin/audit-logs'),
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
            'audit-logs': 'Nhật ký hoạt động'
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

    const handleChangePassword = async (values) => {
        try {
            setChangingPassword(true);
            const res = await api.changePassword({
                old_password: values.oldPassword,
                new_password: values.newPassword
            });

            if (res.success) {
                message.success('Đổi mật khẩu thành công');
                setPasswordModalVisible(false);
                passwordForm.resetFields();
            } else {
                message.error(res.message || 'Có lỗi xảy ra khi đổi mật khẩu');
            }
        } catch (error) {
            console.error('Change password error:', error);
            message.error(error.message || 'Lỗi server, vui lòng thử lại sau');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const dropdownMenuItems = [
        {
            key: 'change-password',
            icon: <LockOutlined />,
            label: 'Đổi mật khẩu',
            onClick: () => setPasswordModalVisible(true),
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
                        <Dropdown
                            menu={{ items: dropdownMenuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Space
                                style={{ cursor: 'pointer', padding: '0 8px', borderLeft: '1px solid #f0f0f0', marginLeft: 8 }}
                            >
                                <Avatar
                                    style={{ backgroundColor: '#1890ff' }}
                                    icon={<UserOutlined />}
                                />
                                <Text strong>
                                    {user?.full_name || user?.email?.split('@')[0] || 'Admin'}
                                </Text>
                                <DownOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                            </Space>
                        </Dropdown>
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

            {/* Change Password Modal */}
            <Modal
                title="Đổi mật khẩu"
                open={passwordModalVisible}
                onCancel={() => {
                    setPasswordModalVisible(false);
                    passwordForm.resetFields();
                }}
                footer={null}
                width={500}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    style={{ marginTop: 24 }}
                >
                    <Form.Item
                        name="oldPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setPasswordModalVisible(false);
                                passwordForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={changingPassword}>
                                Cập nhật mật khẩu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout >
    );
};

export default AdminLayout;
