import React, { useEffect, useState, useRef } from 'react';
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
import { EditOutlined, TagsOutlined, DeleteOutlined, WarningOutlined, HolderOutlined, SaveOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminTable from '@features/admin/components/AdminTable';
import AdminToolbar from '@features/admin/components/AdminToolbar';
import useAdminUndo from '@features/admin/hooks/useAdminUndo';

const { Text } = Typography;

const normalizeCategories = (items = []) =>
    [...items].sort((a, b) => {
        const orderA = a.display_order ?? a.category_id ?? 0;
        const orderB = b.display_order ?? b.category_id ?? 0;
        return orderA - orderB;
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
    const [savedOrder, setSavedOrder] = useState([]);
    const [savingOrder, setSavingOrder] = useState(false);
    const dragIndex = useRef(null);
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setSelectedRowKeys([]);
            const response = await api.getAdminCategories();
            if (response.success) {
                const normalized = normalizeCategories(response.data || []);
                setCategories(normalized);
                setSavedOrder(normalized);

            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Không thể tải danh sách thể loại');
        } finally {
            setLoading(false);
        }
    };

    const { canUndo, undo, recordCreate, clear: clearUndo, undoing } = useAdminUndo({
        onDelete: (id) => api.deleteCategory(id),
        onRefetch: fetchCategories,
        onSuccess: () => message.success('Đã hoàn tác'),
        onError: () => message.error('Không thể hoàn tác'),
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
                message.success('Cập nhật thể loại thành công');
                clearUndo();
                setSelectedRowKeys([]);
            } else {
                const res = await api.createCategory(payload);
                message.success('Tạo thể loại mới thành công');
                if (res?.data?.category_id) recordCreate(res.data.category_id);
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

    const handleDelete = (category = null) => {
        const categoryToDelete = category || categories.find((c) => c.category_id === selectedRowKeys[0]);
        if (!categoryToDelete) return;

        modal.confirm({
            title: 'Xác nhận xóa thể loại',
            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
            content: `Bạn có chắc chắn muốn xóa thể loại "${categoryToDelete.category_name}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa thể loại',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await api.deleteCategory(categoryToDelete.category_id);
                    message.success('Xóa thể loại thành công');
                    setSelectedRowKeys([]);
                    fetchCategories();
                } catch (error) {
                    message.error('Không thể xóa thể loại này');
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
            message.success(`Đã ${checked ? 'hiện' : 'ẩn'} thể loại`);
        } catch (error) {
            setCategories((prev) =>
                prev.map((c) =>
                    c.category_id === category.category_id
                        ? { ...c, is_active: originalStatus }
                        : c
                )
            );
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const columns = [
        {
            title: '',
            key: 'drag',
            width: 40,
            onCell: (_, index) => ({
                draggable: true,
                onDragStart: () => onDragStart(index),
                onDragOver: (e) => onDragOver(e, index),
                onDragEnd,
                style: { cursor: 'grab' },
            }),
            render: () => <HolderOutlined style={{ color: '#ccc' }} />,
        },
        {
            title: 'Tên thể loại',
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
            ),
        },
    ];

    if (loading) return <AdminLoadingScreen tip="Đang tải thể loại..." />;

    const hasOrderChanged = categories.some(
      (cat, i) => cat.category_id !== savedOrder[i]?.category_id
    );

    const onDragStart = (index) => { dragIndex.current = index; };

    const onDragOver = (e, index) => {
      e.preventDefault();
      if (dragIndex.current === null || dragIndex.current === index) return;
      setCategories((prev) => {
        const next = [...prev];
        const [dragged] = next.splice(dragIndex.current, 1);
        next.splice(index, 0, dragged);
        dragIndex.current = index;
        return next;
      });
    };

    const onDragEnd = () => { dragIndex.current = null; };

    const handleSaveOrder = async () => {
      setSavingOrder(true);
      try {
        const res = await api.saveCategoryOrder(categories);
        if (res.success) {
          message.success('Đã lưu thứ tự thể loại');
          setSavedOrder([...categories]);
        } else {
          message.error(res.message || 'Không thể lưu thứ tự');
        }
      } catch {
        message.error('Lỗi khi lưu thứ tự');
      } finally {
        setSavingOrder(false);
      }
    };
    return (
        <div style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <AdminToolbar
                    onUndo={undo}
                    onAdd={handleAdd}
                    onRefresh={fetchCategories}
                    addLabel="Thêm thể loại"
                    undoDisabled={!canUndo}
                    undoLoading={undoing}
                    refreshLoading={loading}
                    extraActions={[
                        <Button
                            key="save-order"
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSaveOrder}
                            loading={savingOrder}
                            disabled={!hasOrderChanged}
                            size="middle"
                        >
                            Lưu thứ tự
                        </Button>,
                        <Tooltip key="edit" title="Chỉnh sửa">
                            <Button
                                type="primary"
                                ghost
                                icon={<EditOutlined />}
                                onClick={handleEditFromSelection}
                                disabled={selectedRowKeys.length === 0}
                                size="middle"
                            >
                                Chỉnh sửa
                            </Button>
                        </Tooltip>,
                        <Tooltip key="delete" title="Xóa">
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDeleteFromSelection}
                                disabled={selectedRowKeys.length === 0}
                                size="middle"
                            >
                                Xóa
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
                    emptyText="Không có thể loại"
                />
            </Card>

            <Modal
                title={
                    <Text strong style={{ fontSize: 16 }}>
                        {isEditing ? `Chỉnh sửa: ${currentCategory?.category_name}` : 'Thêm thể loại mới'}
                    </Text>
                }
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                confirmLoading={submitting}
                okText={isEditing ? 'Lưu thay đổi' : 'Tạo mới'}
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" name="category_form">
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
