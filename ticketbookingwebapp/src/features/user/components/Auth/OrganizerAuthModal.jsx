import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Alert,
    Typography,
    Divider,
    message
} from 'antd';
import {
    LockOutlined,
    UserOutlined,
    LoginOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';

const { Title, Text } = Typography;

const OrganizerAuthModal = ({ show, onHide }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.login({
                email: values.email,
                password: values.password
            });

            if (res.success) {
                if (res.user.role === 'ORGANIZER' || res.user.role === 'ADMIN') {
                    login(res.user, res.token);
                    message.success('Đăng nhập thành công!');
                    onHide();
                    setTimeout(() => {
                        navigate('/organizer/events');
                    }, 100);
                } else {
                    setError('Tài khoản không có quyền tạo sự kiện. Vui lòng liên hệ admin.');
                }
            } else {
                setError(res.message || 'Đăng nhập không thành công.');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra trong quá trình đăng nhập.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setError(null);
        onHide();
    };

    return (
        <Modal
            open={show}
            onCancel={handleCancel}
            footer={null}
            closable={true}
            centered
            width={440}
            styles={{ body: { padding: 0 } }}
            maskStyle={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            {/* Header */}
            <div style={{
                padding: '32px 32px 24px',
                borderBottom: '1px solid #f0f0f0',
                textAlign: 'center'
            }}>
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2DC275 0%, #26a65b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                }}>
                    <LoginOutlined style={{ fontSize: 28, color: 'white' }} />
                </div>
                <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 600 }}>
                    Đăng nhập Organizer
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                    Dành cho nhà tổ chức sự kiện
                </Text>
            </div>

            {/* Form */}
            <div style={{ padding: '24px 32px 32px' }}>
                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 20 }}
                    />
                )}

                <Form
                    name="organizer_auth"
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="email@example.com"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Nhập mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                            style={{
                                height: 48,
                                fontWeight: 600,
                                fontSize: 16
                            }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>

                <Divider style={{ margin: '24px 0' }} />

                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Chưa có tài khoản?{' '}
                        <Button
                            type="link"
                            size="small"
                            style={{ padding: 0, height: 'auto' }}
                            onClick={() => {
                                onHide();
                                navigate('/organizer/home');
                            }}
                        >
                            Liên hệ Admin
                        </Button>
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default OrganizerAuthModal;
