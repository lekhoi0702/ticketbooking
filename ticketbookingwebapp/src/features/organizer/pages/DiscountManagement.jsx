import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Typography, Popconfirm, Skeleton } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
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
            const payload = {
                manager_id: user.user_id,
                ...values,
                code: values.code.toUpperCase(),
                event_id: values.event_id || null,
                start_date: values.date_range[0].toISOString(),
                end_date: values.date_range[1].toISOString(),
            };

            const res = await api.createDiscount(payload);
            if (res.success) {
                message.success('Tạo mã giảm giá thành công');
                setIsModalOpen(false);
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
            render: s => <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, r) => (
                <Popconfirm title="Xóa mã này?" onConfirm={() => handleDelete(r.id)}>
                    <Button danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, alignItems: 'center' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Tạo mã mới
                </Button>
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
                        loading={false}
                        pagination={{ pageSize: 5 }}
                    />
                )}
            </Card>

            <Modal
                title="Tạo mã giảm giá mới"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" form={form} onFinish={handleCreate}>
                    <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                        <Input placeholder="Vd: Khuyến mãi Tết" />
                    </Form.Item>

                    <Form.Item name="code" label="Mã Code" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                        <Input style={{ textTransform: 'uppercase' }} placeholder="Vd: TET2026" />
                    </Form.Item>

                    <Form.Item name="event_id" label="Áp dụng cho sự kiện">
                        <Select allowClear placeholder="Chọn sự kiện (Để trống = Áp dụng tất cả)">
                            {events.map(e => (
                                <Select.Option key={e.event_id} value={e.event_id}>{e.event_name}</Select.Option>
                            ))}
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
                        TẠO MÃ GIẢM GIÁ
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};
export default DiscountManagement;
