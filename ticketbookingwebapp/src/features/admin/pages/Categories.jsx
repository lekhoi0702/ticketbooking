import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Space, Typography, Tooltip, Switch, Tag, App } from 'antd';
import { PlusOutlined, EditOutlined, TagsOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';

const { Title, Text } = Typography;

const Categories = () => {
    // Use App hooks for static methods to avoid warnings and ensure theme context
    const { message, modal } = App.useApp();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.getCategories();
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setIsEditing(false);
        setCurrentCategory(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (category) => {
        setIsEditing(true);
        setCurrentCategory(category);
        form.setFieldsValue({
            category_name: category.category_name
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            if (isEditing) {
                await api.updateCategory(currentCategory.category_id, values);
                message.success('Cập nhật danh mục thành công');
            } else {
                await api.createCategory(values);
                message.success('Tạo danh mục mới thành công');
            }

            setModalVisible(false);
            fetchCategories();
        } catch (error) {
            console.error('Submit error:', error);
            if (error instanceof Error) {
                message.error(error.message || 'Có lỗi xảy ra');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (category) => {
        modal.confirm({
            title: 'Xác nhận xóa danh mục',
            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
            content: `Bạn có chắc chắn muốn xóa danh mục "${category.category_name}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa danh mục',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await api.deleteCategory(category.category_id);
                    message.success('Xóa danh mục thành công');
                    fetchCategories();
                } catch (error) {
                    message.error('Không thể xóa danh mục này');
                }
            }
        });
    };

    const handleToggleStatus = async (category, checked) => {
        // Optimistic UI Update
        const originalStatus = category.is_active;
        const newStatusKey = checked ? 'ACTIVE' : 'HIDDEN';

        // Update local state immediately
        setCategories(prev => prev.map(c =>
            c.category_id === category.category_id
                ? { ...c, is_active: checked }
                : c
        ));

        try {
            await api.updateCategory(category.category_id, { status: newStatusKey });
            message.success(`Đã ${checked ? 'hiện' : 'ẩn'} danh mục`);
        } catch (error) {
            // Revert on error
            setCategories(prev => prev.map(c =>
                c.category_id === category.category_id
                    ? { ...c, is_active: originalStatus }
                    : c
            ));
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (text) => <Space><TagsOutlined style={{ color: '#52c41a' }} /> <b>{text}</b></Space>
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
            width: 150,
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

    if (loading) return <AdminLoadingScreen tip="Đang tải danh mục..." />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Quản lý Thể loại</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
                    Thêm thể loại
                </Button>
            </div>

            <Card className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={categories}
                    rowKey="category_id"
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={<Text strong style={{ fontSize: 18 }}>{isEditing ? `Chỉnh sửa: ${currentCategory?.category_name}` : "Thêm thể loại mới"}</Text>}
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
                    name="category_form"
                >
                    <Form.Item
                        name="category_name"
                        label="Tên thể loại"
                        rules={[{ required: true, message: 'Vui lòng nhập tên thể loại!' }]}
                    >
                        <Input placeholder="Ví dụ: Nhạc kịch" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Categories;