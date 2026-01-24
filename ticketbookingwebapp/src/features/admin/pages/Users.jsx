import React, { useState, useEffect } from 'react';
import { formatLocaleDate } from '@shared/utils/dateUtils';
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

    LockOutlined,

    UnlockOutlined,

    KeyOutlined,

    CopyOutlined,

    ExclamationCircleOutlined,

    CheckCircleOutlined,

    MailOutlined,

    PhoneOutlined

} from '@ant-design/icons';

import { api } from '@services/api';
import AdminPortal from '@shared/components/AdminPortal';
import AdminLoadingScreen from '@features/admin/components/AdminLoadingScreen';
import AdminTable from '@features/admin/components/AdminTable';
import AdminToolbar from '@features/admin/components/AdminToolbar';
import { useAuth } from '@context/AuthContext';



const { Text, Title } = Typography;

const { confirm } = Modal;



const UsersManagement = () => {

    const { user: currentUser } = useAuth();

    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');

    const [roleFilter, setRoleFilter] = useState(null);

    const [users, setUsers] = useState([]);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [creating, setCreating] = useState(false);

    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [resetPasswordResult, setResetPasswordResult] = useState(null);



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

            content: `Bạn có chắc chắn muốn khôi phục mật khẩu cho tài khoản ${fullName}? Mật khẩu tạm sẽ hiển thị sau khi xác nhận — vui lòng cung cấp cho user/organizer.`,

            okText: 'Xác nhận',

            cancelText: 'Hủy',

            onOk: async () => {

                try {

                    const res = await api.resetUserPassword(userId);

                    if (res.success && res.data) {

                        setResetPasswordResult(res.data);

                        message.success('Đã khôi phục mật khẩu. Vui lòng ghi lại mật khẩu tạm bên dưới.');

                    }

                } catch (err) {

                    message.error(err.message || 'Lỗi khi khôi phục mật khẩu');

                }

            },

        });

    };

    const handleCopyTempPassword = () => {

        if (!resetPasswordResult?.new_password) return;

        navigator.clipboard.writeText(resetPasswordResult.new_password).then(

            () => message.success('Đã sao chép mật khẩu tạm'),

            () => message.error('Không thể sao chép')

        );

    };



    const handleToggleLock = (userId, fullName, isActive) => {

        // Không cho phép khóa chính mình
        if (currentUser && currentUser.user_id === userId) {
            message.warning('Bạn không thể khóa tài khoản của chính mình!');
            return;
        }

        const actionText = isActive ? 'khóa' : 'mở khóa';
        const newLockStatus = isActive; // true = khóa (is_locked: true), false = mở khóa (is_locked: false)

        confirm({

            title: `Xác nhận ${actionText} tài khoản`,

            icon: <ExclamationCircleOutlined />,

            content: `Bạn có chắc chắn muốn ${actionText} tài khoản của ${fullName}?`,

            okText: 'Xác nhận',

            cancelText: 'Hủy',

            onOk: async () => {

                try {

                    const res = await api.toggleUserLock(userId, newLockStatus);

                    if (res.success) {

                        message.success(`Đã ${actionText} tài khoản thành công!`);

                        fetchUsers();

                    } else {

                        message.error(res.message || `Lỗi khi ${actionText} tài khoản`);

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

                    <Text strong style={{ fontSize: 16 }}>{record.full_name || 'Anonymous'}</Text>

                </Space>

            ),

        },

        {

            title: 'EMAIL',

            key: 'email',

            dataIndex: 'email',

            render: (email) => (

                <Space size={8}>

                    <MailOutlined style={{ color: '#8c8c8c', fontSize: 16 }} />

                    <Text type="secondary" style={{ fontSize: 16 }}>{email || '-'}</Text>

                </Space>

            ),

        },

        {

            title: 'SỐ ĐIỆN THOẠI',

            key: 'phone',

            dataIndex: 'phone',

            render: (phone) => (

                <Space size={8}>

                    <PhoneOutlined style={{ color: '#8c8c8c', fontSize: 16 }} />

                    <Text type="secondary" style={{ fontSize: 16 }}>{phone || '-'}</Text>

                </Space>

            ),

        },

        {

            title: 'VAI TRÒ',

            key: 'role',

            render: (_, record) => {

                const config = getRoleConfig(record.role);

                return <Tag color={config.color} style={{ fontWeight: 600, fontSize: 16 }}>{config.label.toUpperCase()}</Tag>;

            },

        },

        {

            title: 'TRẠNG THÁI',

            key: 'status',

            render: (_, record) => (

                record.is_active ? (

                    <Tag color="success" icon={<CheckCircleOutlined style={{ fontSize: 16 }} />} style={{ fontSize: 16 }}>ACTIVE</Tag>

                ) : (

                    <Tag color="error" icon={<LockOutlined style={{ fontSize: 16 }} />} style={{ fontSize: 16 }}>LOCKED</Tag>

                )

            ),

        },

        {

            title: 'NGÀY THAM GIA',

            key: 'created_at',

            render: (_, record) => (

                <Text type="secondary" style={{ fontSize: 16 }}>

                    {record.created_at ? formatLocaleDate(record.created_at) || '—' : '—'}

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
                            <span style={{ fontSize: 16, color: '#8c8c8c', fontWeight: 600 }}>VAI TRÒ:</span>
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

                        {selectedRowKeys.length > 0 && (() => {
                            const selectedUser = users.find(u => u.user_id === selectedRowKeys[0]);
                            if (!selectedUser) return null;
                            const isActive = selectedUser.is_active;
                            const actionText = isActive ? 'Khóa' : 'Mở khóa';
                            const isCurrentUser = currentUser && currentUser.user_id === selectedUser.user_id;

                            return (
                                <Space size="middle" style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 24 }}>
                                    <Text strong>Đã chọn:</Text>
                                    <Button
                                        icon={isActive ? <LockOutlined /> : <UnlockOutlined />}
                                        danger={isActive}
                                        onClick={() => {
                                            handleToggleLock(selectedUser.user_id, selectedUser.full_name, isActive);
                                        }}
                                        disabled={isCurrentUser && isActive}
                                        title={isCurrentUser && isActive ? 'Bạn không thể khóa tài khoản của chính mình' : undefined}
                                    >
                                        {actionText}
                                    </Button>
                                <Button
                                    icon={<KeyOutlined />}
                                    onClick={() => {
                                        const user = users.find(u => u.user_id === selectedRowKeys[0]);
                                        handleResetPassword(user.user_id, user.full_name);
                                    }}
                                    style={{ color: '#1890ff' }}
                                >
                                    Đặt lại mật khẩu
                                </Button>
                                </Space>
                            );
                        })()}
                    </div>
                    <AdminToolbar
                        onAdd={() => setShowCreateModal(true)}
                        onRefresh={fetchUsers}
                        addLabel="Thêm Organizer"
                        refreshLoading={loading}
                    />
                </div>
            </Card>



            <Card styles={{ body: { padding: 0 } }}>
                <AdminTable
                    selectedRowKeys={selectedRowKeys}
                    setSelectedRowKeys={setSelectedRowKeys}
                    selectionType="single"
                    rowKey="user_id"
                    columns={columns}
                    dataSource={filteredUsers}
                    pagination={{ pageSize: 50 }}
                    emptyText="Không tìm thấy người dùng"
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

            <Modal
                title="Mật khẩu tạm đã được tạo"
                open={!!resetPasswordResult}
                onCancel={() => setResetPasswordResult(null)}
                footer={[
                    <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyTempPassword}>
                        Sao chép mật khẩu
                    </Button>,
                    <Button key="close" type="primary" onClick={() => setResetPasswordResult(null)}>
                        Đóng
                    </Button>
                ]}
                width={420}
                closable
            >
                {resetPasswordResult && (
                    <div style={{ marginTop: 8 }}>
                        <Alert
                            type="info"
                            message="Vui lòng cung cấp mật khẩu tạm cho user/organizer. Sau khi đăng nhập, họ sẽ được yêu cầu đổi mật khẩu."
                            style={{ marginBottom: 16 }}
                        />
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            {resetPasswordResult.full_name && (
                                <div>
                                    <Text type="secondary">Họ tên: </Text>
                                    <Text strong>{resetPasswordResult.full_name}</Text>
                                </div>
                            )}
                            <div>
                                <Text type="secondary">Email: </Text>
                                <Text strong>{resetPasswordResult.email}</Text>
                            </div>
                            <div>
                                <Text type="secondary">Mật khẩu tạm: </Text>
                                <Text strong copyable={{ text: resetPasswordResult.new_password }}>
                                    {resetPasswordResult.new_password}
                                </Text>
                            </div>
                        </Space>
                    </div>
                )}
            </Modal>

        </div >

    );

};



export default UsersManagement;

