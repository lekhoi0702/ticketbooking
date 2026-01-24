import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Typography, Popconfirm, Skeleton } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatLocaleDate, parseGMT7 } from '@shared/utils/dateUtils';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DiscountManagement = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [discounts, setDiscounts] = useState([]);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [selectedEventInfo, setSelectedEventInfo] = useState(null);

    useEffect(() => {
        if (user?.user_id) {
            fetchData();
        }
    }, [user?.user_id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [discRes, eventRes] = await Promise.all([
                api.getDiscounts(user.user_id),
                api.getOrganizerEvents(user.user_id)
            ]);

            if (discRes.success) setDiscounts(discRes.data);
            if (eventRes.success) setEvents(eventRes.data);
        } catch (error) {
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values) => {
        try {
            setSubmitting(true);

            const startDate = values.date_range[0];
            const endDate = values.date_range[1];

            // Validation: Discount period must be within event sale period
            if (values.event_id) {
                const selectedEvent = events.find(e => e.event_id === values.event_id);
                if (selectedEvent && selectedEvent.sale_start_datetime && selectedEvent.sale_end_datetime) {
                    const saleStart = parseGMT7(selectedEvent.sale_start_datetime);
                    const saleEnd = parseGMT7(selectedEvent.sale_end_datetime);

                    if (startDate.isBefore(saleStart) || endDate.isAfter(saleEnd)) {
                        form.setFields([{
                            name: 'date_range',
                            errors: [`Thời gian áp dụng phải nằm trong khoảng mở bán vé: ${saleStart.format('DD/MM/YYYY HH:mm')} - ${saleEnd.format('DD/MM/YYYY HH:mm')}`]
                        }]);
                        setSubmitting(false);
                        return;
                    }
                }
            }

            const payload = {
                manager_id: user.user_id,
                ...values,
                code: values.code.toUpperCase(),
                event_id: values.event_id || null,
                start_date: startDate.format('YYYY-MM-DDTHH:mm:ss'),
                end_date: endDate.format('YYYY-MM-DDTHH:mm:ss'),
            };

            const res = editingDiscount
                ? await api.updateDiscount(editingDiscount.id, payload)
                : await api.createDiscount(payload);

            if (res.success) {
                message.success(editingDiscount ? 'Cập nhật thành công' : 'Tạo mã giảm giá thành công');
                setIsModalOpen(false);
                setEditingDiscount(null);
                form.resetFields();
                fetchData();
            }
        } catch (error) {
            message.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteDiscount(id);
            fetchData();
            message.success('Đã xóa mã giảm giá');
        } catch (error) {
            message.error('Lỗi khi xóa');
        }
    };

    const columns = [
        { title: 'Mã Code', dataIndex: 'code', key: 'code', render: t => <Tag color="blue">{t}</Tag> },
        { title: 'Tên chương trình', dataIndex: 'name', key: 'name' },
        {
            title: 'Giảm giá',
            key: 'value',
            render: (_, r) => r.discount_type === 'PERCENTAGE' ? `${r.value}%` : `${Number(r.value).toLocaleString()} ₫`
        },
        { title: 'Áp dụng cho', dataIndex: 'event_name', key: 'event_name' },
        {
            title: 'Thời gian',
            key: 'date',
            render: (_, r) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 12 }}>{new Date(r.start_date).toLocaleDateString('vi-VN')}</Text>
                    <Text style={{ fontSize: 12 }}>đến {new Date(r.end_date).toLocaleDateString('vi-VN')}</Text>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: s => {
                let color = 'green';
                let text = 'Hoạt động';
                if (s === 'INACTIVE') {
                    color = 'default';
                    text = 'Tạm dừng';
                } else if (s === 'EXPIRED') {
                    color = 'red';
                    text = 'Hết hạn';
                }
                return <Tag color={color}>{text}</Tag>;
            }
        }
    ];

    const handleBulkDelete = async () => {
        try {
            setLoading(true);
            // Chỉ xóa 1 mã được chọn
            if (selectedRowKeys.length > 0) {
                await api.deleteDiscount(selectedRowKeys[0]);
                message.success('Đã xóa mã giảm giá');
                setSelectedRowKeys([]);
                fetchData();
            }
        } catch (error) {
            message.error('Lỗi khi xóa mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setLoading(true);
            // Chỉ cập nhật 1 mã được chọn
            if (selectedRowKeys.length > 0) {
                await api.updateDiscount(selectedRowKeys[0], { status: newStatus });
                message.success('Đã cập nhật trạng thái mã giảm giá');
                setSelectedRowKeys([]);
                fetchData();
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        const discount = discounts.find(d => d.id === selectedRowKeys[0]);
        if (discount) {
            setEditingDiscount(discount);
            const event = events.find(e => e.event_id === discount.event_id);
            setSelectedEventInfo(event);
            form.setFieldsValue({
                ...discount,
                date_range: [parseGMT7(discount.start_date), parseGMT7(discount.end_date)]
            });
            setIsModalOpen(true);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, alignItems: 'center' }}>
                <Space>
                    {selectedRowKeys.length > 0 && (
                        <>
                            <Button
                                icon={<EditOutlined />}
                                onClick={handleEditClick}
                            >
                                Chỉnh sửa
                            </Button>
                            <Button
                                onClick={() => handleStatusUpdate('ACTIVE')}
                                type="default"
                                style={{ color: '#2DC275', borderColor: '#2DC275' }}
                                loading={loading}
                            >
                                Kích hoạt
                            </Button>
                            <Button
                                onClick={() => handleStatusUpdate('INACTIVE')}
                                type="default"
                                danger
                                loading={loading}
                            >
                                Tạm dừng
                            </Button>
                            <Popconfirm
                                title={`Xác nhận xóa mã "${discounts.find(d => d.id === selectedRowKeys[0])?.code}"?`}
                                onConfirm={handleBulkDelete}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger icon={<DeleteOutlined />} type="primary">
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} style={{ background: '#2DC275', borderColor: '#2DC275' }}>
                        Tạo mã mới
                    </Button>
                </Space>
            </div>

            <Card bordered={false} style={{ borderRadius: 12 }}>
                {loading ? (
                    <div style={{ padding: 20 }}>
                        <Skeleton active paragraph={{ rows: 5 }} />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={discounts}
                        rowKey="id"
                        rowSelection={{
                            type: 'radio', // Chỉ cho phép chọn 1 mã giảm giá
                            selectedRowKeys,
                            onChange: setSelectedRowKeys
                        }}
                        loading={false}
                        pagination={{ pageSize: 5 }}
                    />
                )}
            </Card>

            <Modal
                title={editingDiscount ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingDiscount(null);
                    setSelectedEventInfo(null);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleCreate}
                    onValuesChange={(changedValues) => {
                        if ('event_id' in changedValues) {
                            const event = events.find(e => e.event_id === changedValues.event_id);
                            setSelectedEventInfo(event);
                        }
                    }}
                >
                    <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Vd: Khuyến mãi Tết" />
                    </Form.Item>

                    <Form.Item name="code" label="Mã Code" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                        <Input style={{ textTransform: 'uppercase' }} placeholder="Vd: TET2026" />
                    </Form.Item>

                    <Form.Item
                        name="event_id"
                        label="Áp dụng cho sự kiện"
                        help={selectedEventInfo && selectedEventInfo.sale_start_datetime && (() => {
                            const f = parseGMT7(selectedEventInfo.sale_start_datetime);
                            const t = parseGMT7(selectedEventInfo.sale_end_datetime);
                            return f && t ? (
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Thời gian mở bán vé: {f.format('DD/MM/YYYY HH:mm')} - {t.format('DD/MM/YYYY HH:mm')}
                                </Text>
                            ) : null;
                        })()}
                    >
                        <Select allowClear placeholder="Chọn sự kiện (Để trống = Áp dụng tất cả)">
                            {events
                                .filter(e => ['DRAFT', 'PENDING_APPROVAL', 'PUBLISHED'].includes(e.status))
                                .map(e => (
                                    <Select.Option key={e.event_id} value={e.event_id}>
                                        {e.event_name} <Tag style={{ marginLeft: 8, fontSize: 10 }}>{e.status}</Tag>
                                    </Select.Option>
                                ))
                            }
                        </Select>
                    </Form.Item>

                    <Space style={{ display: 'flex' }} align="baseline">
                        <Form.Item name="discount_type" label="Loại giảm" initialValue="PERCENTAGE">
                            <Select style={{ width: 120 }}>
                                <Select.Option value="PERCENTAGE">Theo %</Select.Option>
                                <Select.Option value="FIXED_AMOUNT">Số tiền</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="value" label="Giá trị" rules={[{ required: true, message: 'Nhập giá trị' }]}>
                            <InputNumber min={0} style={{ width: 150 }} />
                        </Form.Item>
                    </Space>

                    <Form.Item name="date_range" label="Thời gian áp dụng" rules={[{ required: true, message: 'Chọn thời gian' }]}>
                        <RangePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="usage_limit" label="Giới hạn số lần dùng (0 = Không giới hạn)" initialValue={0}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block loading={submitting} size="large">
                        {editingDiscount ? 'CẬP NHẬT MÃ GIẢM GIÁ' : 'TẠO MÃ GIẢM GIÁ'}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};
export default DiscountManagement;
