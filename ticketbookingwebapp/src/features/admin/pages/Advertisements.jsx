import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Card, Space, Typography, Tooltip, Switch, App, InputNumber, Select, DatePicker, Tag, Statistic, Row, Col, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import { advertisementAPI } from '@services/advertisementService';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminToolbar from '@features/admin/components/AdminToolbar';
import { getImageUrl } from '@shared/utils/eventUtils';
import { formatDateTime, parseGMT7, dayjs } from '@shared/utils/dateUtils';
import AdminTable from '@features/admin/components/AdminTable';

const { Title, Text } = Typography;

const POSITION_OPTIONS = [
    { value: 'HOME_BETWEEN_SECTIONS', label: 'Trang chủ - Giữa sections', color: 'blue' },
    { value: 'EVENT_DETAIL_SIDEBAR', label: 'Chi tiết sự kiện - Sidebar', color: 'green' },
    { value: 'HOME_TOP', label: 'Trang chủ - Đầu trang', color: 'purple' },
    { value: 'HOME_BOTTOM', label: 'Trang chủ - Cuối trang', color: 'orange' }
];

const Advertisements = () => {
    const { message, modal } = App.useApp();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAd, setCurrentAd] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                message.error('Vui lòng đăng nhập để xem quảng cáo');
                setLoading(false);
                return;
            }

            const response = await advertisementAPI.getAllAds(true, token);
            if (response.success) {
                setAds(response.data);
            }
        } catch (error) {
            console.error('Error fetching advertisements:', error);

            // Check if it's an auth error
            if (error.message && error.message.includes('401')) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                message.error('Không thể tải danh sách quảng cáo');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setIsEditing(false);
        setCurrentAd(null);

        const maxOrder = ads.length > 0
            ? Math.max(...ads.map(a => a.display_order || 0))
            : -1;
        const nextOrder = maxOrder + 1;

        form.resetFields();
        form.setFieldsValue({
            display_order: nextOrder,
            is_active: true,
            position: 'HOME_BETWEEN_SECTIONS'
        });
        setFileList([]);
        setModalVisible(true);
    };

    const handleEdit = (ad) => {
        setIsEditing(true);
        setCurrentAd(ad);
        form.setFieldsValue({
            url: ad.url,
            position: ad.position,
            display_order: ad.display_order,
            is_active: ad.is_active,
            start_date: ad.start_date ? parseGMT7(ad.start_date) : null,
            end_date: ad.end_date ? parseGMT7(ad.end_date) : null
        });
        setFileList([]);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (!isEditing && fileList.length === 0) {
                message.error('Vui lòng chọn hình ảnh quảng cáo');
                return;
            }

            setSubmitting(true);
            const token = localStorage.getItem('token');

            const formData = new FormData();
            formData.append('url', values.url || '');
            formData.append('position', values.position);
            formData.append('display_order', values.display_order || 0);
            formData.append('is_active', (values.is_active !== undefined ? values.is_active : true).toString());

            if (values.start_date) {
                formData.append('start_date', values.start_date.format('YYYY-MM-DDTHH:mm:ss'));
            }
            if (values.end_date) {
                formData.append('end_date', values.end_date.format('YYYY-MM-DDTHH:mm:ss'));
            }

            // Add image file if selected
            if (fileList.length > 0) {
                const file = fileList[0].originFileObj || fileList[0];
                if (file && file instanceof File) {
                    formData.append('image', file);
                } else {
                    console.error('Invalid file object:', file);
                    message.error('File không hợp lệ. Vui lòng chọn lại ảnh.');
                    return;
                }
            }

            if (isEditing) {
                await advertisementAPI.updateAd(currentAd.ad_id, formData, token);
                message.success('Cập nhật quảng cáo thành công');
            } else {
                await advertisementAPI.createAd(formData, token);
                message.success('Tạo quảng cáo mới thành công');
            }

            setModalVisible(false);
            fetchAds();
        } catch (error) {
            console.error('Submit error:', error);
            if (error instanceof Error) {
                message.error(error.message || 'Có lỗi xảy ra');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (ad) => {
        modal.confirm({
            title: 'Xác nhận xóa quảng cáo',
            icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
            content: `Bạn có chắc chắn muốn xóa quảng cáo #${ad.ad_id}?`,
            okText: 'Xóa quảng cáo',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await advertisementAPI.deleteAd(ad.ad_id, token);
                    message.success('Xóa quảng cáo thành công');
                    fetchAds();
                } catch (error) {
                    message.error('Không thể xóa quảng cáo này');
                }
            }
        });
    };

    const handleToggleStatus = async (ad, checked) => {
        const originalStatus = ad.is_active;

        setAds(prev => prev.map(a =>
            a.ad_id === ad.ad_id
                ? { ...a, is_active: checked }
                : a
        ));

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('is_active', checked.toString());
            await advertisementAPI.updateAd(ad.ad_id, formData, token);
            message.success(`Đã ${checked ? 'kích hoạt' : 'tắt'} quảng cáo`);
        } catch (error) {
            setAds(prev => prev.map(a =>
                a.ad_id === ad.ad_id
                    ? { ...a, is_active: originalStatus }
                    : a
            ));
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const getPositionTag = (position) => {
        const option = POSITION_OPTIONS.find(opt => opt.value === position);
        return <Tag color={option?.color || 'default'}>{option?.label || position}</Tag>;
    };

    const getStatusTag = (ad) => {
        const now = dayjs();
        const startDate = ad.start_date ? parseGMT7(ad.start_date) : null;
        const endDate = ad.end_date ? parseGMT7(ad.end_date) : null;

        if (!ad.is_active) {
            return <Tag color="default">Đã tắt</Tag>;
        }

        if (startDate && now.isBefore(startDate)) {
            return <Tag color="orange">Chưa bắt đầu</Tag>;
        }

        if (endDate && now.isAfter(endDate)) {
            return <Tag color="red">Đã hết hạn</Tag>;
        }

        return <Tag color="green">Đang chạy</Tag>;
    };

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

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 150,
            render: (url) => (
                <img
                    src={getImageUrl(url)}
                    alt="ad"
                    style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect fill="%23f0f0f0" width="120" height="60"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                />
            )
        },
        {
            title: 'URL',
            dataIndex: 'url',
            key: 'url',
            render: (text) => text ? <a href={text} target="_blank" rel="noreferrer"><LinkOutlined /> Link</a> : '-'
        },
        {
            title: 'Vị trí',
            dataIndex: 'position',
            key: 'position',
            render: (position) => getPositionTag(position)
        },
        {
            title: 'Thứ tự',
            dataIndex: 'display_order',
            key: 'display_order',
            width: 80,
            align: 'center',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            render: (_, record) => (
                <Space orientation="vertical" size={4}>
                    {getStatusTag(record)}
                    <Switch
                        size="small"
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        checked={record.is_active}
                        onChange={(checked) => handleToggleStatus(record, checked)}
                    />
                </Space>
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

    if (loading) return <AdminLoadingScreen tip="Đang tải quảng cáo..." />;

    const activeAds = ads.filter(ad => ad.is_active).length;

    return (
        <div style={{ paddingTop: 0 }}>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Tổng quảng cáo"
                            value={ads.length}
                            prefix={<PlusOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Đang hoạt động"
                            value={activeAds}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <AdminToolbar
                    onAdd={handleAdd}
                    onRefresh={fetchAds}
                    addLabel="Thêm quảng cáo"
                    refreshLoading={loading}
                />
            </div>

            <Card className="shadow-sm">
                <AdminTable
                    columns={columns}
                    dataSource={ads}
                    rowKey="ad_id"
                    pagination={{ pageSize: 50 }}
                    emptyText="Không có quảng cáo"
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={<Text strong style={{ fontSize: 16 }}>{isEditing ? `Chỉnh sửa quảng cáo #${currentAd?.ad_id}` : "Thêm quảng cáo mới"}</Text>}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                confirmLoading={submitting}
                okText={isEditing ? "Lưu thay đổi" : "Tạo mới"}
                cancelText="Hủy"
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="ad_form"
                    initialValues={{ is_active: true, position: 'HOME_BETWEEN_SECTIONS' }}
                >
                    <Form.Item
                        name="position"
                        label="Vị trí hiển thị"
                        rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}
                    >
                        <Select placeholder="Chọn vị trí hiển thị">
                            {POSITION_OPTIONS.map(opt => (
                                <Select.Option key={opt.value} value={opt.value}>
                                    <Tag color={opt.color}>{opt.label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Hình ảnh"
                        required={!isEditing}
                    >
                        <Upload {...uploadProps}>
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>

                        {/* Preview ảnh mới được chọn */}
                        {fileList.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                                    {isEditing ? 'Ảnh mới được chọn:' : 'Xem trước ảnh:'}
                                </Text>
                                <div style={{
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 4,
                                    padding: 8,
                                    display: 'inline-block',
                                    background: '#fafafa'
                                }}>
                                    <img
                                        src={URL.createObjectURL(fileList[0].originFileObj || fileList[0])}
                                        alt="preview"
                                        style={{
                                            width: '100%',
                                            maxWidth: '400px',
                                            maxHeight: '300px',
                                            objectFit: 'contain',
                                            borderRadius: 4,
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Hiển thị ảnh hiện tại khi edit và chưa chọn ảnh mới */}
                        {isEditing && currentAd?.image_url && fileList.length === 0 && (
                            <div style={{ marginTop: 16 }}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                                    Hình ảnh hiện tại:
                                </Text>
                                <div style={{
                                    border: '1px solid #d9d9d9',
                                    borderRadius: 4,
                                    padding: 8,
                                    display: 'inline-block',
                                    background: '#fafafa'
                                }}>
                                    <img
                                        src={getImageUrl(currentAd.image_url)}
                                        alt="current"
                                        style={{
                                            width: '100%',
                                            maxWidth: '400px',
                                            maxHeight: '300px',
                                            objectFit: 'contain',
                                            borderRadius: 4,
                                            display: 'block'
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item
                        name="url"
                        label="Liên kết (URL đích khi click)"
                        rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ!' }]}
                    >
                        <Input prefix={<LinkOutlined />} placeholder="https://example.com" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="display_order"
                                label="Thứ tự hiển thị"
                                help="Số nhỏ hơn sẽ hiển thị trước"
                            >
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="is_active"
                                valuePropName="checked"
                                label="Trạng thái"
                            >
                                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Thời gian hiển thị (tùy chọn)">
                        <Space orientation="vertical" style={{ width: '100%' }}>
                            <Form.Item name="start_date" noStyle>
                                <DatePicker
                                    showTime
                                    placeholder="Ngày bắt đầu"
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY HH:mm"
                                />
                            </Form.Item>
                            <Form.Item name="end_date" noStyle>
                                <DatePicker
                                    showTime
                                    placeholder="Ngày kết thúc"
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY HH:mm"
                                />
                            </Form.Item>
                        </Space>
                    </Form.Item>

                    <Text type="secondary" style={{ fontSize: 16, display: 'block' }}>
                        💡 <b>Kích thước ảnh khuyến nghị:</b><br />
                        • Trang chủ (giữa sections): 1200x300px (ratio 4:1)<br />
                        • Sidebar chi tiết sự kiện: 300x600px hoặc 300x250px
                    </Text>
                </Form>
            </Modal>
        </div>
    );
};

export default Advertisements;
