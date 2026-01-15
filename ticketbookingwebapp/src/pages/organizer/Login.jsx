import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Card,
    Typography,
    Form,
    Input,
    Button,
    Space,
    Alert,
    ConfigProvider,
    Layout,
    theme
} from 'antd';
import {
    LockOutlined,
    UserOutlined,
    CoffeeOutlined,
    RocketOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AntdThemeConfig } from '../../theme/AntdThemeConfig';

const { Title, Text } = Typography;
const { Content } = Layout;

const OrganizerLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.login({ ...values, required_role: 'ORGANIZER' });
            if (res.success) {
                login(res.user, res.token);
                message.success('Đăng nhập thành công!');
                setTimeout(() => {
                    navigate('/organizer/events');
                }, 500);
            } else {
                setError(res.message || 'Đăng nhập không thành công.');
            }
        } catch (err) {
            setError(err.message || 'Thông tin đăng nhập không chính xác.');
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
                            maxWidth: 420,
                            width: '100%',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                            borderRadius: 12,
                            overflow: 'hidden'
                        }}
                        styles={{ body: { padding: 0 } }}
                    >
                        <div style={{
                            padding: '40px 32px',
                            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                            color: 'white',
                            textAlign: 'center'
                        }}>
                            <CoffeeOutlined style={{ fontSize: 40, marginBottom: 16 }} />
                            <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800, letterSpacing: 1 }}>TICKETBOOKING</Title>
                            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Organizer Platform</Text>
                        </div>

                        <div style={{ padding: '40px 32px' }}>
                            <Title level={4} style={{ textAlign: 'center', marginBottom: 32 }}>Đối Tác Đăng Nhập</Title>

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
                                name="organizer_login"
                                layout="vertical"
                                initialValues={{ remember: true }}
                                onFinish={onFinish}
                                size="large"
                            >
                                <Form.Item
                                    name="email"
                                    label="Email hoặc Số điện thoại"
                                    rules={[{ required: true, message: 'Vui lòng nhập email hoặc SĐT!' }]}
                                >
                                    <Input
                                        prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label="Mật khẩu"
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        block
                                        loading={loading}
                                        style={{ height: 48, fontWeight: 700 }}
                                    >
                                        ĐĂNG NHẬP
                                    </Button>
                                </Form.Item>

                                <div style={{ textAlign: 'center', marginTop: 24 }}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Chưa có tài khoản đối tác? <Link to="/organizer/home" style={{ color: '#52c41a', fontWeight: 600 }}>Liên hệ hợp tác</Link>
                                    </Text>
                                </div>
                            </Form>
                        </div>
                    </Card>
                </Content>

                <footer style={{ textAlign: 'center', padding: '24px 0', opacity: 0.5 }}>
                    <Text style={{ fontSize: 12 }}>© 2026 TicketBooking Organizer. All rights reserved.</Text>
                </footer>
            </Layout>
        </ConfigProvider>
    );
};

// Import message from antd
import { message } from 'antd';

export default OrganizerLogin;
