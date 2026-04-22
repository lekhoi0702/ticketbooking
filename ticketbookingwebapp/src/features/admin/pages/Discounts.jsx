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

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

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
 }),
 ),
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
 message.error('Không thể tải danh sách mã giảm giá');
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
 message.error('Vui lòng chọn sự kiện áp dụng');
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
 message.error(res.message || 'Không thể lưu mã giảm giá');
 return;
 }

 message.success(editingDiscount ? 'Cập nhật mã giảm giá thành công' : 'Tạo mã giảm giá thành công');
 closeModal();
 fetchData();
 } catch (error) {
 message.error(error?.message || 'Không thể lưu mã giảm giá');
 } finally {
 setSubmitting(false);
 }
 };

 const handleDelete = () => {
 const selected = discounts.find((item) => item.id === selectedRowKeys[0]);
 if (!selected) return;

 modal.confirm({
 title: 'Xác nhận xóa mã giảm giá',
 content: `Bạn có chắc chắn muốn xóa mã ${selected.code}?`,
 okText: 'Xóa',
 okType: 'danger',
 cancelText: 'Hủy',
 onOk: async () => {
 const res = await api.deleteAdminDiscount(selected.id);
 if (!res.success) {
 message.error(res.message || 'Không thể xóa mã giảm giá');
 return;
 }
 message.success('Đã xóa mã giảm giá');
 fetchData();
 },
 });
 };

 const columns = [
 {
 title: 'Mã code',
 dataIndex: 'code',
 key: 'code',
 render: (code) => <Tag color="blue">{code}</Tag>,
 },
 {
 title: 'Tên chương trình',
 dataIndex: 'name',
 key: 'name',
 render: (name) => <Text strong>{name}</Text>,
 },
 {
 title: 'Phạm vi',
 key: 'scope',
 render: (_, row) => {
 if (row.applies_all_events) return <Tag color="purple">Tất cả sự kiện</Tag>;
 const eventName = events.find((event) => event.event_id === row.event_id)?.event_name;
 return <Tag color="geekblue">{eventName || `Event #${row.event_id}`}</Tag>;
 },
 },
 {
 title: 'Giá trị',
 dataIndex: 'value',
 key: 'value',
 align: 'right',
 render: (value) => <Text>{formatCurrency(value)}</Text>,
 },
 {
 title: 'Thời gian',
 key: 'date',
 render: (_, row) => (
 <Space direction="vertical" size={0}>
 <Text>{row.start_date ? dayjs(row.start_date).format('DD/MM/YYYY HH:mm') : '--'}</Text>
 <Text type="secondary">đến {row.end_date ? dayjs(row.end_date).format('DD/MM/YYYY HH:mm') : '--'}</Text>
 </Space>
 ),
 },
 {
 title: 'Trạng thái',
 dataIndex: 'status',
 key: 'status',
 render: (status) => {
 const value = String(status || '').toUpperCase();
 if (value === 'INACTIVE') return <Tag> Tạm dừng</Tag>;
 if (value === 'EXPIRED') return <Tag color="red">Hết hạn</Tag>;
 return <Tag color="green">Hoạt động</Tag>;
 },
 },
 ];

 if (loading) {
 return <AdminLoadingScreen tip="Đang tải mã giảm giá..." />;
 }

 return (
 <div style={{ paddingTop: 0 }}>
 <Card style={{ marginBottom: 24, borderRadius: 12 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 <Space>
 {selectedRowKeys.length > 0 && (
 <>
 <Button icon={<EditOutlined />} onClick={openEditModal}>
 Chỉnh sửa
 </Button>
 <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
 Xóa
 </Button>
 </>
 )}
 </Space>

 <AdminToolbar
 onAdd={openCreateModal}
 addLabel="Thêm mã giảm giá"
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
 emptyText="Không có mã giảm giá"
 />
 </Card>

 <Modal
 title={editingDiscount ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
 open={modalOpen}
 onCancel={closeModal}
 onOk={() => form.submit()}
 confirmLoading={submitting}
 okText={editingDiscount ? 'Cập nhật' : 'Tạo mới'}
 cancelText="Hủy"
 destroyOnClose
 >
 <Form form={form} layout="vertical" onFinish={onSubmit}>
 <Form.Item
 name="name"
 label="Tên chương trình"
 rules={[{ required: true, message: 'Vui lòng nhập tên chương trình' }]}
 >
 <Input placeholder="Ví dụ: Ưu đãi hè" />
 </Form.Item>

 <Form.Item
 name="code"
 label="Mã code"
 rules={[{ required: true, message: 'Vui lòng nhập mã code' }]}
 >
 <Input placeholder="SUMMER2026" style={{ textTransform: 'uppercase' }} />
 </Form.Item>

 <Form.Item
 name="applies_all_events"
 label="Áp dụng tất cả sự kiện"
 valuePropName="checked"
 >
 <Switch />
 </Form.Item>

 <Form.Item shouldUpdate noStyle>
 {({ getFieldValue }) => (
 <Form.Item
 name="event_id"
 label="Sự kiện áp dụng"
 rules={[
 {
 required: !getFieldValue('applies_all_events'),
 message: 'Vui lòng chọn sự kiện',
 },
 ]}
 >
 <Select
 allowClear
 showSearch
 optionFilterProp="label"
 options={eventOptions}
 placeholder="Chọn sự kiện"
 disabled={Boolean(getFieldValue('applies_all_events'))}
 />
 </Form.Item>
 )}
 </Form.Item>

 <Form.Item
 name="value"
 label="Giá trị giảm"
 rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm' }]}
 >
 <InputNumber min={0} style={{ width: '100%' }} />
 </Form.Item>

 <Form.Item
 name="date_range"
 label="Thời gian áp dụng"
 rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian' }]}
 >
 <RangePicker showTime style={{ width: '100%' }} format="DD/MM/YYYY HH:mm" />
 </Form.Item>

 <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
 <Select
 options={[
 { label: 'Hoạt động', value: 'ACTIVE' },
 { label: 'Tạm dừng', value: 'INACTIVE' },
 ]}
 />
 </Form.Item>
 </Form>
 </Modal>
 </div>
 );
};

export default Discounts;
