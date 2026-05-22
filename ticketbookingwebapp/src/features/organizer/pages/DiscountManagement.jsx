import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, Tag, Space, message, Typography, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { parseGMT7 } from '@shared/utils/dateUtils';
import { api } from '@services/api';
import { useAuth } from '@context/AuthContext';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DiscountManagement = () => {
    const { user, organizer } = useAuth();
    const actor = organizer || user;
    const [loading, setLoading] = useState(false);
    const [discounts, setDiscounts] = useState([]);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [editingDiscount, setEditingDiscount] = useState(null);

    useEffect(() => {
        if (actor?.user_id) {
            fetchData();
        }
    }, [actor?.user_id]);

    const fetchData = async () => {
        if (!actor?.user_id) return;
        setLoading(true);
        try {
            const [discRes, eventRes] = await Promise.all([
                api.getDiscounts(actor.user_id),
                api.getOrganizerEvents(actor.user_id)
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


            const payload = {
                manager_id: actor.user_id,
                ...values,
                code: values.code.toUpperCase(),
                event_id: values.event_id,
                discount_type: 'FIXED_AMOUNT',
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
            render: (_, r) => `${Number(r.value).toLocaleString()} ₫`
        },
        { title: 'Áp dụng cho', dataIndex: 'event_name', key: 'event_name' },
        {
            title: 'Thời gian',
            key: 'date',
            render: (_, r) => (
                <Space orientation="vertical" size={0}>
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
                <Table
                    columns={columns}
                    dataSource={discounts}
                    rowKey="id"
                    rowSelection={{
                        type: 'radio', // Chỉ cho phép chọn 1 mã giảm giá
                        selectedRowKeys,
                        onChange: setSelectedRowKeys
                    }}
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            <Modal
                title={editingDiscount ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setEditingDiscount(null);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleCreate}
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
                        rules={[{ required: true, message: 'Vui lòng chọn sự kiện áp dụng' }]}
                    >
                        <Select placeholder="Chọn sự kiện">
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

                    <Form.Item name="value" label="Số tiền giảm (₫)" rules={[{ required: true, message: 'Nhập số tiền giảm' }]}>
                        <InputNumber 
                            min={0} 
                            style={{ width: '100%' }} 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            placeholder="Vd: 50000"
                        />
                    </Form.Item>

                    <Form.Item name="date_range" label="Thời gian áp dụng" rules={[{ required: true, message: 'Chọn thời gian' }]}>
                        <RangePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
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

