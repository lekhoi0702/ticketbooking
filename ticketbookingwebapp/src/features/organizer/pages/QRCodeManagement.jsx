import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Image,
    message,
    Popconfirm,
    Switch,
    Typography,
    Empty
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    QrcodeOutlined,
    BankOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { organizerApi } from '@services/api/organizer';
import { useAuth } from '@context/AuthContext';
import VietQRImageUpload from '@features/organizer/components/VietQRImageUpload';

const { Title, Text } = Typography;

const QRCodeManagement = () => {
    const { user } = useAuth();
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingQR, setEditingQR] = useState(null);
    const [form] = Form.useForm();
    const [qrPreview, setQrPreview] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        if (user?.user_id) {
            fetchQRCodes();
        }
    }, [user]);

    const fetchQRCodes = async () => {
        try {
            setLoading(true);
            const res = await organizerApi.getQRCodes(user.user_id);
            if (res.success) {
                setQrCodes(res.data || []);
            }
        } catch (error) {
            message.error('Không thể tải danh sách QR code');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingQR(null);
        setQrPreview(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingQR(record);
        const qrUrl = record.qr_image_url?.startsWith('http') 
            ? record.qr_image_url 
            : `http://127.0.0.1:5000${record.qr_image_url}`;
        setQrPreview(qrUrl);
        form.setFieldsValue({
            qr_name: record.qr_name,
            qr_image_url: record.qr_image_url
        });
        setModalVisible(true);
    };

    const handleDelete = async (qrCodeId) => {
        try {
            const res = await organizerApi.deleteQRCode(qrCodeId, user.user_id);
            if (res.success) {
                message.success('Xóa QR code thành công');
                fetchQRCodes();
            }
        } catch (error) {
            message.error('Không thể xóa QR code');
            console.error(error);
        }
    };

    const handleToggleActive = async (qrCodeId) => {
        try {
            const res = await organizerApi.toggleQRCodeActive(qrCodeId, user.user_id);
            if (res.success) {
                message.success(res.message);
                fetchQRCodes();
            }
        } catch (error) {
            message.error('Không thể thay đổi trạng thái QR code');
            console.error(error);
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (!qrPreview) {
                message.error('Vui lòng tạo QR code từ thông tin ngân hàng');
                return;
            }

            const formData = new FormData();
            formData.append('qr_name', values.qr_name || 'QR Code');
            formData.append('qr_image_url', qrPreview);

            let res;
            if (editingQR) {
                res = await organizerApi.updateQRCode(editingQR.qr_code_id, user.user_id, formData);
            } else {
                res = await organizerApi.createQRCode(user.user_id, formData);
            }

            if (res.success) {
                message.success(editingQR ? 'Cập nhật QR code thành công' : 'Tạo QR code thành công');
                setModalVisible(false);
                setQrPreview(null);
                form.resetFields();
                fetchQRCodes();
            }
        } catch (error) {
            message.error(error.message || 'Không thể lưu QR code');
            console.error(error);
        }
    };

    const handleURLChange = (url) => {
        setQrPreview(url);
        form.setFieldsValue({ qr_image_url: url });
    };

    const removeQR = () => {
        setQrPreview(null);
        form.setFieldsValue({ qr_image_url: null, qr_image: null });
    };

    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Vui lòng chọn QR code cần xóa');
            return;
        }

        try {
            await organizerApi.deleteQRCode(selectedRowKeys[0], user.user_id);
            message.success('Đã xóa QR code thành công');
            setSelectedRowKeys([]);
            setSelectedRows([]);
            fetchQRCodes();
        } catch (error) {
            message.error('Không thể xóa QR code');
            console.error(error);
        }
    };


    const rowSelection = {
        type: 'radio',
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
        },
    };

    const columns = [
        {
            title: 'Tên QR Code',
            dataIndex: 'qr_name',
            key: 'qr_name',
            render: (text, record) => (
                <Space>
                    <QrcodeOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Hình ảnh',
            dataIndex: 'qr_image_url',
            key: 'qr_image_url',
            width: 150,
            render: (url) => (
                url ? (
                    <Image
                        src={url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`}
                        alt="QR Code"
                        width={80}
                        height={80}
                        style={{ objectFit: 'contain' }}
                        preview={false}
                    />
                ) : (
                    <Text type="secondary">Không có</Text>
                )
            )
        },
        {
            title: 'Ngân hàng',
            dataIndex: 'bank_name',
            key: 'bank_name',
            render: (text) => text ? (
                <Space>
                    <BankOutlined />
                    <Text>{text}</Text>
                </Space>
            ) : <Text type="secondary">-</Text>
        },
        {
            title: 'Số tài khoản',
            dataIndex: 'account_number',
            key: 'account_number',
            render: (text) => text || <Text type="secondary">-</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleActive(record.qr_code_id)}
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<CloseCircleOutlined />}
                />
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-'
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            <QrcodeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            Quản lý QR Code VietQR
                        </Title>
                        <Text type="secondary">
                            Quản lý các QR code VietQR để sử dụng cho thanh toán
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        size="large"
                    >
                        Tạo QR Code mới
                    </Button>
                </div>

                {selectedRowKeys.length > 0 && (
                    <div style={{ 
                        marginBottom: 16, 
                        padding: '12px 16px', 
                        background: '#e6f7ff', 
                        border: '1px solid #91d5ff',
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Text strong style={{ color: '#1890ff' }}>
                            Đã chọn QR code
                        </Text>
                        <Space>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => {
                                    const selectedRecord = qrCodes.find(qr => qr.qr_code_id === selectedRowKeys[0]);
                                    if (selectedRecord) {
                                        handleEdit(selectedRecord);
                                        setSelectedRowKeys([]);
                                        setSelectedRows([]);
                                    }
                                }}
                            >
                                Sửa
                            </Button>
                            <Popconfirm
                                title="Xác nhận xóa"
                                description="Bạn có chắc chắn muốn xóa QR code này?"
                                onConfirm={handleBatchDelete}
                                okText="Xóa"
                                cancelText="Hủy"
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                >
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </Space>
                    </div>
                )}

                <Table
                    columns={columns}
                    dataSource={qrCodes}
                    loading={loading}
                    rowKey="qr_code_id"
                    rowSelection={rowSelection}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} QR code`
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                description="Chưa có QR code nào"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }}
                    onRow={(record) => ({
                        onDoubleClick: () => handleEdit(record),
                    })}
                />
            </Card>

            <Modal
                title={editingQR ? 'Chỉnh sửa QR Code' : 'Tạo QR Code mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={750}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="qr_name"
                        label="Tên QR Code"
                        rules={[{ required: true, message: 'Vui lòng nhập tên QR code' }]}
                    >
                        <Input placeholder="VD: QR Code Vietcombank" style={{ height: '40px' }} />
                    </Form.Item>

                    <Form.Item
                        label="Hình ảnh QR Code"
                        name="qr_image_url"
                        rules={[{ required: true, message: 'Vui lòng tạo QR code từ thông tin ngân hàng' }]}
                    >
                        <VietQRImageUpload
                            qrPreview={qrPreview}
                            handleURLChange={handleURLChange}
                            removeQR={removeQR}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingQR ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                setQrPreview(null);
                                form.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QRCodeManagement;
