import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Alert,
    Typography,
    Space,
    Divider,
    message
} from 'antd';
import {
    LockOutlined,
    UserOutlined,
    RocketOutlined,
    CalendarOutlined,
    ArrowRightOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

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
                    message.success('Đăng nhập hệ thống thành công!');
                    onHide();
                    setTimeout(() => {
                        navigate('/organizer/events');
                    }, 100);
                } else {
                    setError('Tài khoản không có quyền tạo sự kiện. Vui lòng liên hệ admin để được cấp quyền.');
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
            width={400}
            styles={{ body: { padding: 0 } }}
            maskStyle={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
            <div style={{
                padding: '40px 32px 32px',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                color: 'white',
                textAlign: 'center',
                borderRadius: '8px 8px 0 0'
            }}>
                <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px'
                }}>
                    <CalendarOutlined style={{ fontSize: 28 }} />
                </div>
                <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 700 }}>TicketBooking Organizer</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Hệ thống dành cho nhà tổ chức</Text>
            </div>

            <div style={{ padding: '32px' }}>
                {error && (
                    <Alert
                        title={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 24, borderRadius: 8 }}
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
                            prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
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
                    <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>THÔNG TIN THÊM</Text>
                </Divider>

                <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Chưa có tài khoản đối tác? <Button type="link" size="small" style={{ color: '#52c41a', padding: 0 }}>Liên hệ Admin</Button>
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default OrganizerAuthModal;
