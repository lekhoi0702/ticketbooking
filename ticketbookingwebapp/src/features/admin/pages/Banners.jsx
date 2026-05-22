import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Tag, Typography, Upload, message } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminTable from '@features/admin/components/AdminTable';
import AdminToolbar from '@features/admin/components/AdminToolbar';
import { getImageUrl } from '@shared/utils/eventUtils';

const { Text } = Typography;

const DEFAULT_FORM = {
    title: '',
    image: '',
    display_order: 0,
    is_active: true,
};

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [form] = Form.useForm();

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await api.getBanners();
            if (response.success) {
                setBanners(response.data || []);
            } else {
                message.error(response.message || 'Không tải được banner');
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            message.error('Không tải được banner');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const resetModal = () => {
        setEditingBanner(null);
        setImagePreview('');
        form.setFieldsValue(DEFAULT_FORM);
        setShowModal(false);
    };

    const openCreate = () => {
        setEditingBanner(null);
        form.setFieldsValue(DEFAULT_FORM);
        setShowModal(true);
    };

    const openEdit = (record) => {
        setEditingBanner(record);
        setImagePreview(record.image || '');
        form.setFieldsValue({
            title: record.title || '',
            image: record.image || '',
            display_order: Number(record.display_order || 0),
            is_active: !!record.is_active,
        });
        setShowModal(true);
    };

    const handleImageUpload = async (file) => {
        try {
            setUploadingImage(true);
            const res = await api.uploadBannerImage(file);
            if (!res.success || !res.data?.image_url) {
                message.error(res.message || 'Upload ảnh thất bại');
                return false;
            }
            form.setFieldValue('image', res.data.image_url);
            setImagePreview(res.data.image_url);
            message.success('Tải ảnh lên thành công');
        } catch (error) {
            console.error('Upload banner image error:', error);
            message.error('Upload ảnh thất bại');
        } finally {
            setUploadingImage(false);
        }
        return false;
    };

    const submitBanner = async () => {
        try {
            const values = await form.validateFields();
            if (!values.image) {
                message.error('Vui lòng tải ảnh banner');
                return;
            }
            setSaving(true);
            const payload = {
                title: values.title?.trim() || '',
                image: values.image?.trim() || '',
                display_order: Number(values.display_order || 0),
                is_active: !!values.is_active,
            };

            const res = editingBanner
                ? await api.updateBanner(editingBanner.banner_id, payload)
                : await api.createBanner(payload);

            if (!res.success) {
                message.error(res.message || 'Không lưu được banner');
                return;
            }

            message.success(editingBanner ? 'Cập nhật banner thành công' : 'Tạo banner thành công');
            resetModal();
            fetchBanners();
        } catch (err) {
            if (err?.errorFields) return;
            console.error('Submit banner error:', err);
            message.error('Không lưu được banner');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (record) => {
        const res = await api.deleteBanner(record.banner_id);
        if (!res.success) {
            message.error(res.message || 'Xóa banner thất bại');
            return;
        }
        message.success('Đã xóa banner');
        fetchBanners();
    };

    const toggleActive = async (record, checked) => {
        const res = await api.updateBanner(record.banner_id, { is_active: checked });
        if (!res.success) {
            message.error(res.message || 'Không đổi được trạng thái');
            return;
        }
        setBanners((prev) =>
            prev.map((row) =>
                row.banner_id === record.banner_id ? { ...row, is_active: checked } : row
            )
        );
        message.success('Đã cập nhật trạng thái');
    };

    const columns = useMemo(
        () => [
            {
                title: 'Hình ảnh',
                dataIndex: 'image',
                key: 'image',
                width: 180,
                render: (url) => (
                    <img
                        src={getImageUrl(url)}
                        alt="banner"
                        style={{ width: 140, height: 70, objectFit: 'cover', borderRadius: 6 }}
                    />
                ),
            },
            {
                title: 'Tiêu đề',
                dataIndex: 'title',
                key: 'title',
                render: (text) => <Text strong>{text || '-'}</Text>,
            },
            {
                title: 'Thứ tự',
                dataIndex: 'display_order',
                key: 'display_order',
                width: 100,
                align: 'center',
            },
            {
                title: 'Trạng thái',
                dataIndex: 'is_active',
                key: 'is_active',
                width: 140,
                render: (isActive, record) => (
                    <Space>
                        <Tag color={isActive ? 'success' : 'default'}>
                            {isActive ? 'Hiện' : 'Ẩn'}
                        </Tag>
                        <Switch size="small" checked={!!isActive} onChange={(v) => toggleActive(record, v)} />
                    </Space>
                ),
            },
            {
                title: 'Thao tác',
                key: 'actions',
                width: 130,
                render: (_, record) => (
                    <Space>
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(record)}
                            aria-label="Sửa banner"
                        />
                        <Popconfirm
                            title="Xóa banner?"
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleDelete(record)}
                        >
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                aria-label="Xóa banner"
                            />
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        []
    );

    if (loading) return <AdminLoadingScreen tip="Đang tải banner..." />;

    return (
        <div style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    Thêm banner
                </Button>
                <AdminToolbar onRefresh={fetchBanners} refreshLoading={loading} />
            </div>

            <Card className="shadow-sm">
                <AdminTable
                    columns={columns}
                    dataSource={banners}
                    rowKey={(record) => record.banner_id}
                    pagination={{ pageSize: 50 }}
                    emptyText="Không có banner"
                />
            </Card>

            <Modal
                title={editingBanner ? 'Cập nhật banner' : 'Tạo banner'}
                open={showModal}
                onCancel={resetModal}
                onOk={submitBanner}
                confirmLoading={saving}
                okText={editingBanner ? 'Lưu' : 'Tạo'}
                cancelText="Hủy"
                destroyOnHidden
            >
                <Form form={form} layout="vertical" initialValues={DEFAULT_FORM}>
                    <Form.Item label="Tiêu đề" name="title">
                        <Input placeholder="Banner mùa hè..." />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        hidden
                        rules={[{ required: true, message: 'Vui lòng tải ảnh banner' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Ảnh banner"
                        required
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Upload
                                accept="image/*"
                                showUploadList={false}
                                beforeUpload={handleImageUpload}
                                disabled={uploadingImage}
                            >
                                <Button loading={uploadingImage}>Browse ảnh</Button>
                            </Upload>
                            {(imagePreview || form.getFieldValue('image')) && (
                                <img
                                    src={getImageUrl(imagePreview || form.getFieldValue('image'))}
                                    alt="Preview banner"
                                    style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 6 }}
                                />
                            )}
                        </Space>
                    </Form.Item>

                    <Form.Item label="Thứ tự hiển thị" name="display_order">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item label="Kích hoạt" name="is_active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Banners;
