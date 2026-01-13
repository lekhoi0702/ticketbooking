import React, { useState, useEffect } from 'react';
import { Card, Table, Form, InputGroup, Button, Badge, Spinner, Modal, Alert } from 'react-bootstrap';
import { FaSearch, FaUserEdit, FaLock, FaUserPlus, FaSave, FaTimes } from 'react-icons/fa';
import { api } from '../../services/api';

const UsersManagement = () => {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'ORGANIZER' // Default to Organizer as requested
    });

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
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            setCreating(true);
            setError(null);
            const res = await api.createUser(newUser);
            if (res.success) {
                setShowCreateModal(false);
                setNewUser({ username: '', email: '', password: '', full_name: '', role: 'ORGANIZER' });
                fetchUsers();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getRoleBadge = (role) => {
        const roles = {
            'ADMIN': { bg: 'danger', text: 'Quản trị' },
            'ORGANIZER': { bg: 'primary', text: 'Tổ chức' },
            'USER': { bg: 'info', text: 'Khách hàng' }
        };
        const r = roles[role] || { bg: 'secondary', text: role };
        return <Badge bg={r.bg}>{r.text}</Badge>;
    };

    const handleResetPassword = async (userId, fullName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn reset mật khẩu của "${fullName}" về mặc định (123456)?`)) {
            return;
        }

        try {
            const res = await api.resetUserPassword(userId);
            if (res.success) {
                alert(res.message);
            }
        } catch (err) {
            console.error("Error resetting password:", err);
            alert("Lỗi khi reset mật khẩu: " + err.message);
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">Quản lý Người dùng ({users.length})</h3>
                <Button variant="primary" onClick={() => setShowCreateModal(true)} className="d-flex align-items-center shadow-sm">
                    <FaUserPlus className="me-2" /> Tạo người quản lý
                </Button>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <div className="p-4 border-bottom bg-white">
                        <InputGroup className="w-50">
                            <InputGroup.Text className="bg-white border-end-0">
                                <FaSearch className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Tìm kiếm theo tên, email hoặc username..."
                                className="border-start-0 ps-0 shadow-none border"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th>Người dùng / Email</th>
                                <th>Username</th>
                                <th>Vai trò</th>
                                <th>Ngày tạo</th>
                                <th className="text-end px-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                    </td>
                                </tr>
                            ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.user_id}>
                                    <td className="px-4 text-muted small">#{user.user_id}</td>
                                    <td>
                                        <div className="fw-bold">{user.full_name || 'N/A'}</div>
                                        <div className="small text-muted">{user.email}</div>
                                    </td>
                                    <td><code className="text-primary">{user.username}</code></td>
                                    <td>{getRoleBadge(user.role)}</td>
                                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                                    <td className="text-end px-4">
                                        <Button size="sm" variant="light" className="me-2 text-primary border" title="Chỉnh sửa (Sắp có)">
                                            <FaUserEdit />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            className="text-danger border"
                                            title="Reset mật khẩu về 123456"
                                            onClick={() => handleResetPassword(user.user_id, user.full_name)}
                                        >
                                            <FaLock />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">Không tìm thấy người dùng nào</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal Tạo người dùng mới */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
                <Form onSubmit={handleCreateUser}>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold fs-5">Tạo Tài Khoản Quản Lý Mới</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Họ và tên</Form.Label>
                            <Form.Control
                                required
                                placeholder="Nhập tên đầy đủ"
                                value={newUser.full_name}
                                onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Username</Form.Label>
                            <Form.Control
                                required
                                placeholder="Tên đăng nhập"
                                value={newUser.username}
                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Email</Form.Label>
                            <Form.Control
                                required
                                type="email"
                                placeholder="example@gmail.com"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Mật khẩu</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="********"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-0">
                            <Form.Label className="small fw-bold">Vai trò</Form.Label>
                            <Form.Select
                                value={newUser.role}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="ORGANIZER">Nhà tổ chức (Organizer)</option>
                                <option value="ADMIN">Quản trị viên (Admin)</option>
                                <option value="USER">Khách hàng (User)</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-light">
                        <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)} disabled={creating}>
                            Huỷ
                        </Button>
                        <Button variant="primary" type="submit" disabled={creating} className="px-4 shadow-sm">
                            {creating ? <Spinner size="sm" /> : <><FaSave className="me-2" /> Lưu tài khoản</>}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default UsersManagement;
