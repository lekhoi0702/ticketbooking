import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
    Card,
    Typography,
    Form,
    Input,
    Button,
    Alert,
    ConfigProvider,
    Layout,
    message
} from 'antd';
import {
    LockOutlined,
    UserOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { AntdThemeConfig } from '../../theme/AntdThemeConfig';

const { Title, Text } = Typography;
const { Content } = Layout;

const AdminLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.login({ ...values, required_role: 'ADMIN' });
            if (res.success) {
                login(res.user, res.token);
                message.success('Đăng nhập quản trị viên thành công!');
                // Force a small delay
                setTimeout(() => {
                    navigate('/admin/events');
                }, 500);
            } else {
                setError(res.message || 'Tài khoản hoặc mật khẩu không đúng.');
            }
        } catch (err) {
            setError(err.message || 'Lỗi hệ thống khi đăng nhập.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfigProvider theme={AntdThemeConfig}>
            <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
                <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
                    <Card
                        style={{
                            maxWidth: 400,
                            width: '100%',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                            borderRadius: 8,
                            border: 'none'
                        }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 40 }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <SafetyCertificateOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                            </div>
                            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                                ADMIN<span style={{ color: '#52c41a' }}>PANEL</span>
                            </Title>
                            <Text type="secondary" style={{ fontSize: 13 }}>Hệ thống quản trị TicketBooking</Text>
                        </div>

                        {error && (
                            <Alert
                                title={error}
                                type="error"
                                showIcon
                                closable
                                onClose={() => setError(null)}
                                style={{ marginBottom: 24 }}
                            />
                        )}

                        <Form
                            name="admin_login"
                            layout="vertical"
                            onFinish={onFinish}
                            size="large"
                        >
                            <Form.Item
                                name="email"
                                label={<Text strong style={{ fontSize: 12 }}>TÀI KHOẢN</Text>}
                                rules={[{ required: true, message: 'Vui lòng nhập email admin!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={<Text strong style={{ fontSize: 12 }}>MẬT KHẨU</Text>}
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 32 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={loading}
                                    style={{ height: 48, fontWeight: 600 }}
                                >
                                    ĐĂNG NHẬP
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Content>

                <footer style={{ textAlign: 'center', padding: '24px 0', opacity: 0.45 }}>
                    <Text style={{ fontSize: 11 }}>© 2026 TicketBooking Security Engine. All rights reserved.</Text>
                </footer>
            </Layout>
        </ConfigProvider>
    );
};

export default AdminLogin;
