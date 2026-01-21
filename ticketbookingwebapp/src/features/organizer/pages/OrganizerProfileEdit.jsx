import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Upload, message, Typography, Row, Col, Divider } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import { getImageUrl } from '@shared/utils/eventUtils';

const { Title, Text } = Typography;
const { TextArea } = Input;

const OrganizerProfileEdit = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoFileList, setLogoFileList] = useState([]);
    const [currentLogo, setCurrentLogo] = useState(null);

    useEffect(() => {
        if (user?.user_id) {
            fetchProfile();
        }
    }, [user?.user_id]);

    const fetchProfile = async () => {
        try {
            // Ensure the method exists
            if (!api.getOrganizerProfile) {
                console.error('api.getOrganizerProfile is not available');
                message.error('API method not available. Please refresh the page.');
                return;
            }
            const res = await api.getOrganizerProfile(user.user_id);
            if (res.success) {
                form.setFieldsValue(res.data);
                setCurrentLogo(res.data.logo_url);
            }
        } catch (error) {
            message.error('Không thể tải thông tin profile');
            console.error(error);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const formData = new FormData();

            // Add text fields
            Object.keys(values).forEach(key => {
                if (values[key] !== undefined && values[key] !== null) {
                    formData.append(key, values[key]);
                }
            });

            // Add logo file if selected
            if (logoFileList.length > 0) {
                formData.append('logo', logoFileList[0].originFileObj);
            }

            // Ensure the method exists
            if (!api.updateOrganizerProfile) {
                console.error('api.updateOrganizerProfile is not available');
                message.error('API method not available. Please refresh the page.');
                return;
            }
            const res = await api.updateOrganizerProfile(user.user_id, formData);

            if (res.success) {
                message.success('Cập nhật thông tin thành công');
                navigate('/organizer/profile');
            } else {
                message.error(res.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            message.error('Không thể cập nhật thông tin');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const logoUploadProps = {
        onRemove: () => setLogoFileList([]),
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ được upload file ảnh!');
                return Upload.LIST_IGNORE;
            }
            setLogoFileList([file]);
            return false;
        },
        fileList: logoFileList,
        maxCount: 1,
        listType: 'picture'
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div />

                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/organizer/profile')}>
                    Quay lại
                </Button>
            </div>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Divider orientation="left">Thông tin cơ bản</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="organization_name"
                                label="Tên tổ chức"
                                rules={[{ required: true, message: 'Vui lòng nhập tên tổ chức' }]}
                            >
                                <Input placeholder="Nhập tên tổ chức" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="contact_phone"
                                label="Số điện thoại"
                            >
                                <Input placeholder="Nhập số điện thoại" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <TextArea rows={4} placeholder="Mô tả về tổ chức của bạn" />
                    </Form.Item>

                    <Divider orientation="left">Logo tổ chức</Divider>

                    <Form.Item label="Logo">
                        <Upload {...logoUploadProps}>
                            <Button icon={<UploadOutlined />}>Chọn logo</Button>
                        </Upload>
                        {currentLogo && logoFileList.length === 0 && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">Logo hiện tại:</Text>
                                <br />
                                <img
                                    src={getImageUrl(currentLogo)}
                                    alt="current logo"
                                    style={{ width: 120, height: 120, objectFit: 'contain', marginTop: 4, border: '1px solid #d9d9d9', borderRadius: 4, padding: 8 }}
                                />
                            </div>
                        )}
                    </Form.Item>

                    <Divider />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button size="large" onClick={() => navigate('/organizer/profile')}>
                            Hủy
                        </Button>
                        <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit" loading={loading}>
                            Lưu thay đổi
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default OrganizerProfileEdit;
