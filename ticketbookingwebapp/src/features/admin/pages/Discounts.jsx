import React, { useEffect, useMemo, useState } from 'react';
import {
    App,
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Switch,
    Tag,
    Typography,
} from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminTable from '@features/admin/components/AdminTable';
import AdminToolbar from '@features/admin/components/AdminToolbar';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')} d`;

const Discounts = () => {
    const { message, modal } = App.useApp();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [discounts, setDiscounts] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [form] = Form.useForm();

    const eventOptions = useMemo(
        () =>
            (events || []).map((event) => ({
                label: event.event_name,
                value: event.event_id,
            })),
        [events]
    );

    const fetchData = async () => {
        try {
            setLoading(true);
            setSelectedRowKeys([]);
            const [discountRes, eventRes] = await Promise.all([
                api.getAllDiscounts(),
                api.getAllAdminEvents(),
            ]);

            if (discountRes.success) {
                setDiscounts(discountRes.data || []);
            }

            if (eventRes.success) {
                setEvents(eventRes.data || []);
            }
        } catch {
            message.error('Khong the tai danh sach ma giam gia');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const closeModal = () => {
        setModalOpen(false);
        setEditingDiscount(null);
        form.resetFields();
    };

    const openCreateModal = () => {
        setEditingDiscount(null);
        form.setFieldsValue({
            applies_all_events: false,
            status: 'ACTIVE',
            value: 0,
        });
        setModalOpen(true);
    };

    const openEditModal = () => {
        const selected = discounts.find((item) => item.id === selectedRowKeys[0]);
        if (!selected) return;

        setEditingDiscount(selected);
        form.setFieldsValue({
            name: selected.name,
            code: selected.code,
            applies_all_events: Boolean(selected.applies_all_events),
            event_id: selected.event_id || undefined,
            value: Number(selected.value || 0),
            status: selected.status || 'ACTIVE',
            date_range: [
                selected.start_date ? dayjs(selected.start_date) : null,
                selected.end_date ? dayjs(selected.end_date) : null,
            ],
        });
        setModalOpen(true);
    };

    const onSubmit = async (values) => {
        const startDate = values.date_range?.[0];
        const endDate = values.date_range?.[1];
        const isGlobal = Boolean(values.applies_all_events);

        if (!isGlobal && !values.event_id) {
            message.error('Vui long chon su kien ap dung');
            return;
        }

        const payload = {
            name: values.name,
            code: String(values.code || '').toUpperCase(),
            value: values.value,
            applies_all_events: isGlobal,
            event_id: isGlobal ? null : values.event_id,
            start_date: startDate?.format('YYYY-MM-DDTHH:mm:ss'),
            end_date: endDate?.format('YYYY-MM-DDTHH:mm:ss'),
            status: values.status,
            create_id: user?.user_id || 1,
        };

        try {
            setSubmitting(true);
            const res = editingDiscount
                ? await api.updateAdminDiscount(editingDiscount.id, payload)
                : await api.createAdminDiscount(payload);

            if (!res.success) {
                message.error(res.message || 'Khong the luu ma giam gia');
                return;
            }

            message.success(editingDiscount ? 'Cap nhat ma giam gia thanh cong' : 'Tao ma giam gia thanh cong');
            closeModal();
            fetchData();
        } catch (error) {
            message.error(error?.message || 'Khong the luu ma giam gia');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        const selected = discounts.find((item) => item.id === selectedRowKeys[0]);
        if (!selected) return;

        modal.confirm({
            title: 'Xac nhan xoa ma giam gia',
            content: `Ban co chac chan muon xoa ma ${selected.code}?`,
            okText: 'Xoa',
            okType: 'danger',
            cancelText: 'Huy',
            onOk: async () => {
                const res = await api.deleteAdminDiscount(selected.id);
                if (!res.success) {
                    message.error(res.message || 'Khong the xoa ma giam gia');
                    return;
                }
                message.success('Da xoa ma giam gia');
                fetchData();
            },
        });
    };

    const columns = [
        {
            title: 'Ma code',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Tag color="blue">{code}</Tag>,
        },
        {
            title: 'Ten chuong trinh',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <Text strong>{name}</Text>,
        },
        {
            title: 'Pham vi',
            key: 'scope',
            render: (_, row) => {
                if (row.applies_all_events) return <Tag color="purple">Tat ca su kien</Tag>;
                const eventName = events.find((event) => event.event_id === row.event_id)?.event_name;
                return <Tag color="geekblue">{eventName || `Event #${row.event_id}`}</Tag>;
            },
        },
        {
            title: 'Gia tri',
            dataIndex: 'value',
            key: 'value',
            align: 'right',
            render: (value) => <Text>{formatCurrency(value)}</Text>,
        },
        {
            title: 'Thoi gian',
            key: 'date',
            render: (_, row) => (
                <Space direction="vertical" size={0}>
                    <Text>{row.start_date ? dayjs(row.start_date).format('DD/MM/YYYY HH:mm') : '--'}</Text>
                    <Text type="secondary">den {row.end_date ? dayjs(row.end_date).format('DD/MM/YYYY HH:mm') : '--'}</Text>
                </Space>
            ),
        },
        {
            title: 'Trang thai',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const value = String(status || '').toUpperCase();
                if (value === 'INACTIVE') return <Tag>Tam dung</Tag>;
                if (value === 'EXPIRED') return <Tag color="red">Het han</Tag>;
                return <Tag color="green">Hoat dong</Tag>;
            },
        },
    ];

    if (loading) {
        return <AdminLoadingScreen tip="Dang tai ma giam gia..." />;
    }

    return (
        <div style={{ paddingTop: 0 }}>
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        {selectedRowKeys.length > 0 && (
                            <>
                                <Button icon={<EditOutlined />} onClick={openEditModal}>
                                    Chinh sua
                                </Button>
                                <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                                    Xoa
                                </Button>
                            </>
                        )}
                    </Space>

                    <AdminToolbar
                        onAdd={openCreateModal}
                        addLabel="Them ma giam gia"
                        onRefresh={fetchData}
                        refreshLoading={loading}
                    />
                </div>
            </Card>

            <Card styles={{ body: { padding: 0 } }}>
                <AdminTable
                    rowKey="id"
                    columns={columns}
                    dataSource={discounts}
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                    selectionType="single"
                    pagination={{ pageSize: 50 }}
                    emptyText="Khong co ma giam gia"
                />
            </Card>

            <Modal
                title={editingDiscount ? 'Chinh sua ma giam gia' : 'Tao ma giam gia moi'}
                open={modalOpen}
                onCancel={closeModal}
                onOk={() => form.submit()}
                confirmLoading={submitting}
                okText={editingDiscount ? 'Cap nhat' : 'Tao moi'}
                cancelText="Huy"
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={onSubmit}>
                    <Form.Item
                        name="name"
                        label="Ten chuong trinh"
                        rules={[{ required: true, message: 'Vui long nhap ten chuong trinh' }]}
                    >
                        <Input placeholder="Vi du: Uu dai he" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Ma code"
                        rules={[{ required: true, message: 'Vui long nhap ma code' }]}
                    >
                        <Input placeholder="SUMMER2026" style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <Form.Item
                        name="applies_all_events"
                        label="Ap dung tat ca su kien"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => (
                            <Form.Item
                                name="event_id"
                                label="Su kien ap dung"
                                rules={[
                                    {
                                        required: !getFieldValue('applies_all_events'),
                                        message: 'Vui long chon su kien',
                                    },
                                ]}
                            >
                                <Select
                                    allowClear
                                    showSearch
                                    optionFilterProp="label"
                                    options={eventOptions}
                                    placeholder="Chon su kien"
                                    disabled={Boolean(getFieldValue('applies_all_events'))}
                                />
                            </Form.Item>
                        )}
                    </Form.Item>

                    <Form.Item
                        name="value"
                        label="Gia tri giam"
                        rules={[{ required: true, message: 'Vui long nhap gia tri giam' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="date_range"
                        label="Thoi gian ap dung"
                        rules={[{ required: true, message: 'Vui long chon khoang thoi gian' }]}
                    >
                        <RangePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
                    </Form.Item>

                    <Form.Item name="status" label="Trang thai" initialValue="ACTIVE">
                        <Select
                            options={[
                                { label: 'Hoat dong', value: 'ACTIVE' },
                                { label: 'Tam dung', value: 'INACTIVE' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Discounts;
