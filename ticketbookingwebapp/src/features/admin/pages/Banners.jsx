import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Space, Typography, Tooltip, Switch, App, Upload, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminPortal from '@shared/components/AdminPortal';
import { getImageUrl } from '@shared/utils/eventUtils';

const { Title, Text } = Typography;

const Banners = () => {
    const { message, modal } = App.useApp();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBanner, setCurrentBanner] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await api.getBanners();
            if (response.success) {
                setBanners(response.data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            message.error('Không thể tải danh sách banner');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setIsEditing(false);
        setCurrentBanner(null);
        form.resetFields();
        setFileList([]);
        setModalVisible(true);
    };

    const handleEdit = (banner) => {
        setIsEditing(true);
        setCurrentBanner(banner);
        form.setFieldsValue({
            title: banner.title,
            link: banner.link,
            order: banner.order,
            is_active: banner.is_active
        });

        // Show existing image as file list item if needed, but easier to just show preview
        setFileList([]);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!isEditing && fileList.length === 0) {
                message.error('Vui lòng chọn hình ảnh banner');
                return;
            }

            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', values.title || '');
            formData.append('link', values.link || '');
            formData.append('order', values.order || 0);
            formData.append('is_active', values.is_active !== undefined ? values.is_active : true);

            if (fileList.length > 0) {
                formData.append('image', fileList[0].originFileObj);
            }

            if (isEditing) {
                await api.updateBanner(currentBanner.banner_id, formData);
                message.success('Cập nhật banner thành công');
            } else {
                await api.createBanner(formData);
                message.success('Tạo banner mới thành công');
            }

            setModalVisible(false);
            fetchBanners();
        } catch (error) {
            console.error('Submit error:', error);
            if (error instanceof Error) {
                message.error(error.message || 'Có lỗi xảy ra');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (banner) => {
        modal.confirm({
            title: 'Xác nhận xóa banner',
            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
            content: `Bạn có chắc chắn muốn xóa banner "${banner.title || 'Không tiêu đề'}"?`,
            okText: 'Xóa banner',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await api.deleteBanner(banner.banner_id);
                    message.success('Xóa banner thành công');
                    fetchBanners();
                } catch (error) {
                    message.error('Không thể xóa banner này');
                }
            }
        });
    };

    const handleToggleStatus = async (banner, checked) => {
        // Optimistic UI Update
        const originalStatus = banner.is_active;

        setBanners(prev => prev.map(b =>
            b.banner_id === banner.banner_id
                ? { ...b, is_active: checked }
                : b
        ));

        try {
            const formData = new FormData();
            formData.append('is_active', checked);
            await api.updateBanner(banner.banner_id, formData);
            message.success(`Đã ${checked ? 'hiện' : 'ẩn'} banner`);
        } catch (error) {
            setBanners(prev => prev.map(b =>
                b.banner_id === banner.banner_id
                    ? { ...b, is_active: originalStatus }
                    : b
            ));
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };


    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image_url',
            key: 'image_url',
            width: 150,
            render: (url) => (
                <img
                    src={getImageUrl(url)}
                    alt="banner"
                    style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                />
            )
        },
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <b>{text || '-'}</b>
        },
        {
            title: 'Liên kết',
            dataIndex: 'link',
            key: 'link',
            render: (text) => text ? <a href={text} target="_blank" rel="noreferrer"><LinkOutlined /> Link</a> : '-'
        },
        {
            title: 'Thứ tự',
            dataIndex: 'order',
            key: 'order',
            width: 80,
            align: 'center',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (isActive, record) => (
                <Switch
                    checkedChildren="Hiện"
                    unCheckedChildren="Ẩn"
                    checked={isActive}
                    onChange={(checked) => handleToggleStatus(record, checked)}
                />
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            ghost
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        }
    ];

    const uploadProps = {
        onRemove: (file) => {
            setFileList((prev) => {
                const index = prev.indexOf(file);
                const newFileList = prev.slice();
                newFileList.splice(index, 1);
                return newFileList;
            });
        },
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ được upload file ảnh!');
                return Upload.LIST_IGNORE;
            }
            setFileList([file]); // Only allow 1 file
            return false; // Prevent auto upload
        },
        fileList,
        maxCount: 1,
        listType: 'picture'
    };

    if (loading) return <AdminLoadingScreen tip="Đang tải banner..." />;

    return (
        <div style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="middle">
                    Thêm banner
                </Button>
            </div>

            <Card className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={banners}
                    rowKey="banner_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>


            <Modal
                title={<Text strong style={{ fontSize: 18 }}>{isEditing ? `Chỉnh sửa: ${currentBanner?.title || 'Banner'}` : "Thêm banner mới"}</Text>}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                confirmLoading={submitting}
                okText={isEditing ? "Lưu thay đổi" : "Tạo mới"}
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="banner_form"
                    initialValues={{ order: 0, is_active: true }}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề"
                    >
                        <Input placeholder="Nhập tiêu đề banner (tùy chọn)" />
                    </Form.Item>

                    <Form.Item
                        name="link"
                        label="Liên kết"
                        rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ!' }]}
                    >
                        <Input prefix={<LinkOutlined />} placeholder="https://example.com" />
                    </Form.Item>

                    <Form.Item
                        name="order"
                        label="Thứ tự hiển thị"
                        help="Số nhỏ hơn sẽ hiển thị trước (0 là đầu tiên)"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Hình ảnh"
                        required={!isEditing}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                        {isEditing && currentBanner?.image_url && fileList.length === 0 && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary">Hình ảnh hiện tại:</Text>
                                <br />
                                <img
                                    src={getImageUrl(currentBanner.image_url)}
                                    alt="current"
                                    style={{ width: '100%', maxWidth: '300px', borderRadius: 4, marginTop: 4 }}
                                />
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        valuePropName="checked"
                        label="Trạng thái"
                    >
                        <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
                    </Form.Item>
                </Form>
            </Modal>
        </div >
    );
};

export default Banners;
