import React, { useEffect, useState } from 'react';
import {
    Button,
    Modal,
    Form,
    Input,
    Card,
    Space,
    Typography,
    Tooltip,
    Switch,
    App,
} from 'antd';
import { EditOutlined, TagsOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminTable from '@features/admin/components/AdminTable';
import AdminToolbar from '@features/admin/components/AdminToolbar';
import useAdminUndo from '@features/admin/hooks/useAdminUndo';

const { Text } = Typography;

const normalizeCategories = (items = []) =>
    [...items].sort((a, b) => {
        return (a.category_id || 0) - (b.category_id || 0);
    });

const Categories = () => {
    const { message, modal } = App.useApp();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setSelectedRowKeys([]);
            const response = await api.getAdminCategories();
            if (response.success) {
                const normalized = normalizeCategories(response.data || []);
                setCategories(normalized);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Khong the tai danh sach the loai');
        } finally {
            setLoading(false);
        }
    };

    const { canUndo, undo, recordCreate, clear: clearUndo, undoing } = useAdminUndo({
        onDelete: (id) => api.deleteCategory(id),
        onRefetch: fetchCategories,
        onSuccess: () => message.success('Da hoan tac'),
        onError: () => message.error('Khong the hoan tac'),
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = () => {
        setIsEditing(false);
        setCurrentCategory(null);
        setSelectedRowKeys([]);
        clearUndo();
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (category = null) => {
        const categoryToEdit = category || categories.find((c) => c.category_id === selectedRowKeys[0]);
        if (!categoryToEdit) return;

        setIsEditing(true);
        setCurrentCategory(categoryToEdit);
        clearUndo();
        form.setFieldsValue({
            category_name: categoryToEdit.category_name,
        });
        setModalVisible(true);
    };

    const handleEditFromSelection = () => {
        if (selectedRowKeys.length === 0) return;
        handleEdit();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = { ...values };

            setSubmitting(true);

            if (isEditing) {
                await api.updateCategory(currentCategory.category_id, payload);
                message.success('Cap nhat the loai thanh cong');
                clearUndo();
                setSelectedRowKeys([]);
            } else {
                const res = await api.createCategory(payload);
                message.success('Tao the loai moi thanh cong');
                if (res?.data?.category_id) recordCreate(res.data.category_id);
            }

            setModalVisible(false);
            fetchCategories();
        } catch (error) {
            console.error('Submit error:', error);
            if (error instanceof Error) {
                message.error(error.message || 'Co loi xay ra');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (category = null) => {
        const categoryToDelete = category || categories.find((c) => c.category_id === selectedRowKeys[0]);
        if (!categoryToDelete) return;

        modal.confirm({
            title: 'Xac nhan xoa the loai',
            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
            content: `Ban co chac chan muon xoa the loai "${categoryToDelete.category_name}"? Hanh dong nay khong the hoan tac.`,
            okText: 'Xoa the loai',
            okType: 'danger',
            cancelText: 'Huy',
            onOk: async () => {
                try {
                    await api.deleteCategory(categoryToDelete.category_id);
                    message.success('Xoa the loai thanh cong');
                    setSelectedRowKeys([]);
                    fetchCategories();
                } catch (error) {
                    message.error('Khong the xoa the loai nay');
                }
            },
        });
    };

    const handleDeleteFromSelection = () => {
        if (selectedRowKeys.length === 0) return;
        handleDelete();
    };

    const handleToggleStatus = async (category, checked) => {
        const originalStatus = category.is_active;
        const newStatusKey = checked ? 'ACTIVE' : 'HIDDEN';

        setCategories((prev) =>
            prev.map((c) =>
                c.category_id === category.category_id
                    ? { ...c, is_active: checked }
                    : c
            )
        );

        try {
            await api.updateCategory(category.category_id, { status: newStatusKey });
            message.success(`Da ${checked ? 'hien' : 'an'} the loai`);
        } catch (error) {
            setCategories((prev) =>
                prev.map((c) =>
                    c.category_id === category.category_id
                        ? { ...c, is_active: originalStatus }
                        : c
                )
            );
            message.error('Loi khi cap nhat trang thai');
        }
    };

    const columns = [
        {
            title: 'Ten the loai',
            dataIndex: 'category_name',
            key: 'category_name',
            render: (text) => (
                <Space>
                    <TagsOutlined style={{ color: '#2DC275' }} />
                    <b>{text}</b>
                </Space>
            ),
        },
        {
            title: 'Trang thai',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (isActive, record) => (
                <Switch
                    checkedChildren="Hien"
                    unCheckedChildren="An"
                    checked={isActive}
                    onChange={(checked) => handleToggleStatus(record, checked)}
                />
            ),
        },
    ];

    if (loading) return <AdminLoadingScreen tip="Dang tai the loai..." />;

    return (
        <div style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <AdminToolbar
                    onUndo={undo}
                    onAdd={handleAdd}
                    onRefresh={fetchCategories}
                    addLabel="Them the loai"
                    undoDisabled={!canUndo}
                    undoLoading={undoing}
                    refreshLoading={loading}
                    extraActions={[
                        <Tooltip key="edit" title="Chinh sua">
                            <Button
                                type="primary"
                                ghost
                                icon={<EditOutlined />}
                                onClick={handleEditFromSelection}
                                disabled={selectedRowKeys.length === 0}
                                size="middle"
                            >
                                Chinh sua
                            </Button>
                        </Tooltip>,
                        <Tooltip key="delete" title="Xoa">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDeleteFromSelection}
                                disabled={selectedRowKeys.length === 0}
                                size="middle"
                            >
                                Xoa
                            </Button>
                        </Tooltip>,
                    ]}
                />
            </div>

            <Card className="shadow-sm">
                <AdminTable
                    columns={columns}
                    dataSource={categories}
                    rowKey="category_id"
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                    selectionType="single"
                    pagination={{ pageSize: 50 }}
                    emptyText="Khong co the loai"
                />
            </Card>

            <Modal
                title={
                    <Text strong style={{ fontSize: 16 }}>
                        {isEditing ? `Chinh sua: ${currentCategory?.category_name}` : 'Them the loai moi'}
                    </Text>
                }
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                confirmLoading={submitting}
                okText={isEditing ? 'Luu thay doi' : 'Tao moi'}
                cancelText="Huy"
            >
                <Form form={form} layout="vertical" name="category_form">
                    <Form.Item
                        name="category_name"
                        label="Ten the loai"
                        rules={[{ required: true, message: 'Vui long nhap ten the loai!' }]}
                    >
                        <Input placeholder="Vi du: Nhac kich" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Categories;
