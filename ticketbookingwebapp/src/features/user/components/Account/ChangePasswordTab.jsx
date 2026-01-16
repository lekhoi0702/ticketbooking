import React, { useState } from 'react';
import { Form, Input, Button, message, Space, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { api } from '@services/api';

const { Title, Text } = Typography;

const ChangePasswordTab = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const res = await api.changePassword({
                old_password: values.oldPassword,
                new_password: values.newPassword
            });

            if (res.success) {
                message.success('Đổi mật khẩu thành công');
                form.resetFields();
            } else {
                message.error(res.message || 'Có lỗi xảy ra khi đổi mật khẩu');
            }
        } catch (error) {
            console.error('Change password error:', error);
            message.error(error.message || 'Lỗi server, vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={4}>Đổi mật khẩu</Title>
                <Text type="secondary">Vui lòng nhập mật khẩu hiện tại và mật khẩu mới của bạn</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
            >
                <Form.Item
                    name="oldPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
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
                    <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
                </Form.Item>

                <Form.Item style={{ marginTop: 32 }}>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Cập nhật mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ChangePasswordTab;
