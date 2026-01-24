import React, { useState, useMemo } from 'react';
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
    message,
    Grid,
} from 'antd';
import {
    UserOutlined,
    HomeOutlined,
    LockOutlined,
    LogoutOutlined,
    DownOutlined,
} from '@ant-design/icons';
import { api } from '@services/api';
import { ADMIN_MENU_ITEMS, SIDER_WIDTH, BREADCRUMB_MAP, ADMIN_HOME_PATH } from '../config';
import AdminErrorBoundary from './AdminErrorBoundary';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const AdminLayout = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const screens = useBreakpoint();
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordForm] = Form.useForm();
    const [changingPassword, setChangingPassword] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const isDesktop = screens.lg === true;

    const menuItems = useMemo(
        () =>
            ADMIN_MENU_ITEMS.map(({ key, icon: Icon, label }) => ({
                key,
                icon: Icon ? <Icon /> : null,
                label,
                onClick: () => navigate(key),
            })),
        [navigate]
    );

    const breadcrumbItems = useMemo(() => {
        const pathSnippets = location.pathname.split('/').filter(Boolean);
        const items = [
            {
                title: <HomeOutlined />,
                onClick: (e) => {
                    e.preventDefault();
                    navigate(ADMIN_HOME_PATH);
                },
            },
        ];
        const isEventDetail = pathSnippets[0] === 'admin' && pathSnippets[1] === 'events' && pathSnippets[2] != null && /^\d+$/.test(pathSnippets[2]);
        if (isEventDetail) {
            items.push({
                title: BREADCRUMB_MAP.events || 'Quản lý sự kiện',
                onClick: (e) => {
                    e.preventDefault();
                    navigate('/admin/events');
                },
            });
            items.push({ title: 'Chi tiết sự kiện' });
            return items;
        }
        let currentPath = '/admin';
        for (const snippet of pathSnippets) {
            if (snippet === 'admin') continue;
            currentPath += `/${snippet}`;
            const title = BREADCRUMB_MAP[snippet];
            if (title) {
                items.push({
                    title,
                    onClick: (e) => {
                        e.preventDefault();
                        navigate(currentPath);
                    },
                });
            }
        }
        return items;
    }, [location.pathname, navigate]);

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

    const siderWidth = collapsed ? 80 : SIDER_WIDTH;
    const contentMarginLeft = isDesktop ? siderWidth : 0;

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <AdminLogin />;
    }

    return (
        <Layout className="admin-layout-pure">
            <Sider
                width={SIDER_WIDTH}
                collapsedWidth={80}
                collapsed={collapsed}
                collapsible={isDesktop}
                trigger={null}
                breakpoint="lg"
                onBreakpoint={(broken) => {
                    if (broken) setCollapsed(true);
                }}
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 1001,
                    borderRight: 'none',
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
                    <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, marginTop: 4, letterSpacing: '1px' }}>
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
                    marginLeft: contentMarginLeft,
                    background: '#f5f5f5',
                }}
            >
                <Header
                    className="admin-layout-header"
                    style={{
                        padding: '0 24px',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        border: 'none',
                        borderBottom: 'none',
                    }}
                >
                    <Breadcrumb items={breadcrumbItems} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Dropdown
                            menu={{ items: dropdownMenuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Space
                                className="admin-user-trigger"
                                style={{ cursor: 'pointer', padding: '0 8px', marginLeft: 8 }}
                            >
                                <Avatar
                                    style={{ backgroundColor: '#1890ff' }}
                                    icon={<UserOutlined />}
                                />
                                <Text strong>
                                    {user?.full_name || user?.email?.split('@')[0] || 'Admin'}
                                </Text>
                                <DownOutlined style={{ fontSize: 16, color: '#8c8c8c' }} />
                            </Space>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ margin: '24px 24px 0', minHeight: 280 }}>
                    <AdminErrorBoundary>
                        <div className="admin-content-inner" style={{
                            padding: 0,
                            minHeight: 'calc(100vh - 112px)',
                            background: 'transparent',
                        }}>
                            <Outlet />
                        </div>
                    </AdminErrorBoundary>
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
