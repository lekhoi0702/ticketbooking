import React, { useState, useEffect } from 'react';

import {

    Card,

    Table,

    Button,

    Tag,

    Avatar,

    Input,

    Modal,

    Form,

    Select,

    Space,

    Typography,

    Tooltip,

    Alert,

    message,

    Divider

} from 'antd';

import {

    SearchOutlined,

    UserAddOutlined,

    ReloadOutlined,

    LockOutlined,

    UnlockOutlined,

    KeyOutlined,

    ExclamationCircleOutlined,

    CheckCircleOutlined

} from '@ant-design/icons';

import { api } from '@services/api';
import AdminPortal from '@shared/components/AdminPortal';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';



const { Text, Title } = Typography;

const { confirm } = Modal;



const UsersManagement = () => {

    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');

    const [roleFilter, setRoleFilter] = useState(null);

    const [users, setUsers] = useState([]);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [creating, setCreating] = useState(false);

    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);



    useEffect(() => {

        fetchUsers();

    }, []);



    const fetchUsers = async () => {

        try {

            setLoading(true);

            const res = await api.getAllUsers();

            if (res.success) setUsers(res.data);

        } catch (error) {

            console.error("Error fetching users:", error);

            message.error("Không thể tải danh sách người dùng.");

        } finally {

            setLoading(false);

        }

    };



    const handleCreateUser = async (values) => {

        try {

            setCreating(true);

            const res = await api.createUser({ ...values, role: 'ORGANIZER' });

            if (res.success) {

                setShowCreateModal(false);

                form.resetFields();

                message.success("Đã tạo tài khoản nhà tổ chức thành công!");

                fetchUsers();

            }

        } catch (err) {

            message.error(err.message || "Lỗi khi tạo người dùng");

        } finally {

            setCreating(false);

        }

    };



    const handleResetPassword = (userId, fullName) => {

        confirm({

            title: 'Xác nhận khôi phục mật khẩu',

            icon: <ExclamationCircleOutlined />,

            content: `Bạn có chắc chắn muốn khôi phục mật khẩu cho tài khoản ${fullName} về mặc định?`,

            okText: 'Xác nhận',

            cancelText: 'Hủy',

            onOk: async () => {

                try {

                    const res = await api.resetUserPassword(userId);

                    if (res.success) {

                        message.success("Đã khôi phục mật khẩu thành công!");

                    }

                } catch (err) {

                    message.error(err.message || "Lỗi khi khôi phục mật khẩu");

                }

            },

        });

    };



    const handleToggleLock = (userId, fullName, currentlyLocked) => {

        const actionText = currentlyLocked ? 'mở khóa' : 'khóa';

        confirm({

            title: `Xác nhận ${actionText} tài khoản`,

            icon: <ExclamationCircleOutlined />,

            content: `Bạn có chắc chắn muốn ${actionText} tài khoản của ${fullName}?`,

            okText: 'Xác nhận',

            cancelText: 'Hủy',

            onOk: async () => {

                try {

                    const res = await api.toggleUserLock(userId, !currentlyLocked);

                    if (res.success) {

                        message.success(`Đã ${actionText} tài khoản thành công!`);

                        fetchUsers();

                    }

                } catch (err) {

                    message.error(err.message || `Lỗi khi ${actionText} tài khoản`);

                }

            },

        });

    };



    const filteredUsers = users.filter(user => {

        const matchesSearch = (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||

            (user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = roleFilter ? user.role === roleFilter : true;

        return matchesSearch && matchesRole;

    });



    const getRoleConfig = (role) => {

        const roles = {

            'ADMIN': { color: 'red', label: 'Administrator' },

            'ORGANIZER': { color: 'green', label: 'Organizer' },

            'USER': { color: 'blue', label: 'Customer' }

        };

        return roles[role] || { color: 'default', label: role };

    };



    const columns = [

        {

            title: 'NGƯỜI DÙNG',

            key: 'user',

            render: (_, record) => (

                <Space size={12}>

                    <Avatar

                        style={{ backgroundColor: getRoleConfig(record.role).color + '22', color: getRoleConfig(record.role).color }}

                    >

                        {record.full_name?.charAt(0) || 'U'}

                    </Avatar>

                    <Space direction="vertical" size={0}>

                        <Text strong style={{ fontSize: 14 }}>{record.full_name || 'Anonymous'}</Text>

                        <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>

                    </Space>

                </Space>

            ),

        },

        {

            title: 'VAI TRÒ',

            key: 'role',

            render: (_, record) => {

                const config = getRoleConfig(record.role);

                return <Tag color={config.color} style={{ fontWeight: 600 }}>{config.label.toUpperCase()}</Tag>;

            },

        },

        {

            title: 'TRẠNG THÁI',

            key: 'status',

            render: (_, record) => (

                record.is_active ? (

                    <Tag color="success" icon={<CheckCircleOutlined />}>ACTIVE</Tag>

                ) : (

                    <Tag color="error" icon={<LockOutlined />}>LOCKED</Tag>

                )

            ),

        },

        {

            title: 'NGÀY THAM GIA',

            key: 'created_at',

            render: (_, record) => (

                <Text type="secondary">

                    {record.created_at ? new Date(record.created_at).toLocaleDateString('vi-VN') : 'Default'}

                </Text>

            ),

        },

        // Actions column removed as requested - moved to toolbar
    ];



    if (loading) {

        return <AdminLoadingScreen tip="Đang tải danh sách người dùng..." />;

    }



    return (
        <div style={{ paddingTop: 0 }}>
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        <Space size="middle">
                            <span style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 600 }}>VAI TRÒ:</span>
                            <Select
                                placeholder="Lọc theo vai trò"
                                style={{ width: 160 }}
                                allowClear
                                value={roleFilter}
                                onChange={(value) => setRoleFilter(value)}
                                options={[
                                    { label: 'Administrator', value: 'ADMIN' },
                                    { label: 'Organizer', value: 'ORGANIZER' },
                                    { label: 'Customer', value: 'USER' }
                                ]}
                                size="large"
                            />
                        </Space>

                        {selectedRowKeys.length > 0 && (
                            <Space size="middle" style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                                <Text strong>{selectedRowKeys.length} đã chọn:</Text>
                                <Button
                                    icon={<LockOutlined />}
                                    danger
                                    onClick={() => {
                                        const user = users.find(u => u.user_id === selectedRowKeys[0]);
                                        handleToggleLock(user.user_id, user.full_name, user.is_active);
                                    }}
                                    disabled={selectedRowKeys.length > 1}
                                >
                                    Khóa/Mở khóa
                                </Button>
                                <Button
                                    icon={<KeyOutlined />}
                                    onClick={() => {
                                        const user = users.find(u => u.user_id === selectedRowKeys[0]);
                                        handleResetPassword(user.user_id, user.full_name);
                                    }}
                                    disabled={selectedRowKeys.length > 1}
                                    style={{ color: '#1890ff' }}
                                >
                                    Đặt lại mật khẩu
                                </Button>
                            </Space>
                        )}
                    </div>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
                            Làm mới
                        </Button>
                        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setShowCreateModal(true)}>
                            Thêm Organizer
                        </Button>
                    </Space>
                </div>
            </Card>



            <Card styles={{ body: { padding: 0 } }}>
                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    rowKey="user_id"
                    columns={columns}
                    dataSource={filteredUsers}

                    pagination={{ pageSize: 10 }}

                    locale={{ emptyText: 'Không tìm thấy người dùng' }}

                />

            </Card>



            <Modal

                title="Tạo Tài Khoản Nhà Tổ Chức"

                open={showCreateModal}

                onCancel={() => {

                    setShowCreateModal(false);

                    form.resetFields();

                }}

                footer={null}

                width={400}

            >

                <Form

                    form={form}

                    layout="vertical"

                    onFinish={handleCreateUser}

                    initialValues={{ role: 'ORGANIZER' }}

                    style={{ marginTop: 20 }}

                >

                    <Form.Item

                        label="Họ và Tên"

                        name="full_name"

                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}

                    >

                        <Input />

                    </Form.Item>



                    <Form.Item

                        label="Địa Chỉ Email"

                        name="email"

                        rules={[

                            { required: true, message: 'Vui lòng nhập email' },

                            { type: 'email', message: 'Email không hợp lệ' }

                        ]}

                    >

                        <Input />

                    </Form.Item>



                    <Form.Item

                        label="Mật Khẩu Ban Đầu"

                        name="password"

                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}

                    >

                        <Input.Password />

                    </Form.Item>



                    <Divider />



                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>

                        <Space>

                            <Button onClick={() => setShowCreateModal(false)}>Hủy bỏ</Button>

                            <Button type="primary" htmlType="submit" loading={creating}>

                                Tạo tài khoản

                            </Button>

                        </Space>

                    </Form.Item>

                </Form>

            </Modal>

        </div >

    );

};



export default UsersManagement;

