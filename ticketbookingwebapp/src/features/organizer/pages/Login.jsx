import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Card,
    Typography,
    Form,
    Input,
    Button,
    Alert,
    Divider,
    Space,
    ConfigProvider
} from 'antd';
import {
    LockOutlined,
    UserOutlined,
    ArrowRightOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import { AntdThemeConfig } from '@theme/AntdThemeConfig';
import { message } from 'antd';

const { Title, Text } = Typography;

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
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f5',
                padding: '20px'
            }}>
                <Card
                    style={{
                        width: '100%',
                        maxWidth: 450,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderRadius: 8,
                        overflow: 'hidden'
                    }}
                    styles={{ body: { padding: 0 } }}
                    bordered={false}
                >
                    {/* Header */}
                    <div style={{
                        padding: '40px 32px 32px',
                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <CalendarOutlined style={{ fontSize: 28 }} />
                        </div>
                        <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                            TicketBooking Organizer
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                            Hệ thống dành cho nhà tổ chức
                        </Text>
                    </div>

                    {/* Form */}
                    <div style={{ padding: 32 }}>
                        {error && (
                            <Alert
                                message={error}
                                type="error"
                                showIcon
                                closable
                                onClose={() => setError(null)}
                                style={{ marginBottom: 24 }}
                            />
                        )}

                        <Form
                            name="organizer_auth"
                            layout="vertical"
                            onFinish={onFinish}
                            size="large"
                        >
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#52c41a' }} />}
                                    style={{ borderRadius: 8 }}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 8 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={loading}
                                    icon={<ArrowRightOutlined />}
                                    style={{
                                        height: 52,
                                        fontWeight: 700,
                                        borderRadius: 8,
                                        background: '#52c41a',
                                        borderColor: '#52c41a',
                                        boxShadow: '0 4px 12px rgba(82, 196, 26, 0.2)'
                                    }}
                                >
                                    ĐĂNG NHẬP NGAY
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider style={{ margin: '24px 0' }}>
                            <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>
                                THÔNG TIN THÊM
                            </Text>
                        </Divider>

                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                                Chưa có tài khoản đối tác?{' '}
                                <Button
                                    type="link"
                                    size="small"
                                    style={{ color: '#52c41a', padding: 0 }}
                                    onClick={() => navigate('/organizer/home')}
                                >
                                    Liên hệ Admin
                                </Button>
                            </Text>
                        </div>
                    </div>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default OrganizerLogin;
