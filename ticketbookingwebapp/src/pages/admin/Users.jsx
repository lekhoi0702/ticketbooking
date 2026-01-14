import React, { useState, useEffect } from 'react';
import { Card, Table, Form, InputGroup, Button, Badge, Spinner, Modal, Alert } from 'react-bootstrap';
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
        role: 'ORGANIZER'
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

    const getRoleStyles = (role) => {
        const roles = {
            'ADMIN': { bg: '#fef2f2', color: '#b91c1c', text: 'QUẢN TRỊ VIÊN' },
            'ORGANIZER': { bg: '#eef2ff', color: '#4f46e5', text: 'NHÀ TỔ CHỨC' },
            'USER': { bg: '#f0f9ff', color: '#0369a1', text: 'THÀNH VIÊN' }
        };
        return roles[role] || { bg: '#f1f5f9', color: '#475569', text: role };
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

    if (loading && users.length === 0) return (
        <div className="text-center py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" style={{ color: '#6366f1' }} />
            <p className="mt-3 text-slate-500 fw-bold">Đang tải cơ sở dữ liệu người dùng...</p>
        </div>
    );

    return (
        <div className="animate-fade-in pb-5 users-management-premium">
            <div className="d-flex justify-content-end mb-4 gap-3">
                <Button variant="white" onClick={fetchUsers} className="rounded-pill px-4 border text-slate-600 fw-bold small shadow-xs">
                    <i className="bi bi-arrow-clockwise me-2"></i> LÀM MỚI
                </Button>
                <Button variant="indigo-gradient" onClick={() => setShowCreateModal(true)} className="rounded-pill px-4 border-0 text-white fw-900 small shadow-indigo">
                    <i className="bi bi-person-plus-fill me-2"></i> THÊM TÀI KHOẢN
                </Button>
            </div>

            <Card className="card-modern bg-white rounded-4 shadow-sm border-0 border-slate-50 overflow-hidden mt-4">
                <div className="card-header-modern p-4 border-bottom border-slate-50">
                    <Row className="align-items-center">
                        <Col lg={4}>
                            <h5 className="fw-900 text-slate-800 mb-1 tracking-tightest">Danh sách Quản trị</h5>
                            <p className="text-slate-400 small mb-0 fw-medium">Quản lý phân quyền và thông tin định danh toàn hệ thống</p>
                        </Col>
                        <Col lg={8}>
                            <InputGroup className="bg-slate-50 rounded-pill px-3 py-1 border border-slate-100 ms-auto" style={{ maxWidth: '400px' }}>
                                <span className="input-group-text bg-transparent border-0 text-slate-400"><i className="bi bi-search"></i></span>
                                <Form.Control
                                    placeholder="Tìm tài khoản, email hoặc tên..."
                                    className="bg-transparent border-0 shadow-none text-slate-600 fw-medium small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </div>

                <div className="table-responsive">
                    <Table hover className="align-middle mb-0 custom-table-premium">
                        <thead className="bg-slate-50">
                            <tr className="small text-slate-400 text-uppercase fw-bold">
                                <th className="px-4 py-3 border-0">Thành viên / Định danh</th>
                                <th className="py-3 border-0">Tên đăng nhập</th>
                                <th className="py-3 border-0">Vai trò / Quyền hạn</th>
                                <th className="py-3 border-0">Tham gia từ</th>
                                <th className="py-3 border-0 text-end px-4">Tác vụ Quản trị</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map(user => {
                                const st = getRoleStyles(user.role);
                                return (
                                    <tr key={user.user_id}>
                                        <td className="px-4 py-4">
                                            <div className="d-flex align-items-center">
                                                <div className="user-avatar-premium me-3 rounded-circle d-flex align-items-center justify-content-center shadow-xs" style={{ width: '40px', height: '40px', background: st.bg, color: st.color, border: `2px solid #fff` }}>
                                                    <span className="fw-black fs-6">{user.full_name?.charAt(0) || 'U'}</span>
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-slate-800">{user.full_name || 'Anonymous User'}</div>
                                                    <div className="text-slate-400 small fw-medium">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="bg-slate-50 text-indigo-500 px-2 py-1 rounded-3 small fw-bold border border-slate-100">{user.username}</span>
                                        </td>
                                        <td>
                                            <span className="premium-role-badge d-inline-flex align-items-center rounded-pill px-3 py-1 fw-bold" style={{ backgroundColor: st.bg, color: st.color, fontSize: '10px' }}>
                                                <i className="bi bi-shield-check me-1"></i> {st.text}
                                            </span>
                                        </td>
                                        <td className="text-slate-400 small fw-medium">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Mặc định'}
                                        </td>
                                        <td className="text-end px-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button
                                                    className="btn btn-slate-50 btn-sm rounded-circle shadow-xs border"
                                                    title="Chỉnh sửa hồ sơ"
                                                    style={{ width: '34px', height: '34px', padding: 0 }}
                                                >
                                                    <i className="bi bi-pencil-square text-slate-600"></i>
                                                </button>
                                                <button
                                                    className="btn btn-slate-50 btn-sm rounded-circle shadow-xs border"
                                                    title="Đặt lại mật khẩu"
                                                    style={{ width: '34px', height: '34px', padding: 0 }}
                                                    onClick={() => handleResetPassword(user.user_id, user.full_name)}
                                                >
                                                    <i className="bi bi-key-fill text-danger text-opacity-75"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="5" className="text-center py-5 text-slate-400 fst-italic">Không tìm thấy tài khoản phù hợp với tiêu chí</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Premium Create Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered contentClassName="border-0 shadow-2xl rounded-5 overflow-hidden transition-all">
                <Form onSubmit={handleCreateUser}>
                    <Modal.Header closeButton className="bg-slate-50 py-4 px-5 border-0">
                        <Modal.Title className="fw-900 text-slate-800 tracking-tightest">TẠO TÀI KHOẢN MỚI</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-5 bg-white pt-0">
                        {error && <div className="alert alert-danger rounded-4 py-3 small border-0 mb-4 shadow-sm animate-fade-in"><i className="bi bi-exclamation-circle me-2"></i> {error}</div>}

                        <div className="mb-4">
                            <label className="form-label small fw-900 text-slate-400 text-uppercase tracking-widest mb-2">Họ và tên chủ sở hữu</label>
                            <Form.Control
                                required
                                placeholder="Nhập tên hiển thị..."
                                className="bg-slate-50 border-0 rounded-4 py-3 px-4 text-slate-700 shadow-none hover-slate-100 transition-all fw-bold fs-6"
                                value={newUser.full_name}
                                onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                            />
                        </div>

                        <Row className="g-4 mb-4">
                            <Col md={6}>
                                <label className="form-label small fw-900 text-slate-400 text-uppercase tracking-widest mb-2">Tên đăng nhập</label>
                                <Form.Control
                                    required
                                    placeholder="Username..."
                                    className="bg-slate-50 border-0 rounded-4 py-3 px-4 text-slate-700 shadow-none transition-all fw-bold"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </Col>
                            <Col md={6}>
                                <label className="form-label small fw-900 text-slate-400 text-uppercase tracking-widest mb-2">Vai trò hệ thống</label>
                                <Form.Select
                                    className="bg-slate-50 border-0 rounded-4 py-3 px-4 text-slate-700 shadow-none transition-all fw-bold"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="ORGANIZER">NHÀ TỔ CHỨC</option>
                                    <option value="ADMIN">QUẢN TRỊ VIÊN</option>
                                    <option value="USER">KHÁCH HÀNG</option>
                                </Form.Select>
                            </Col>
                        </Row>

                        <div className="mb-4">
                            <label className="form-label small fw-900 text-slate-400 text-uppercase tracking-widest mb-2">Địa chỉ Email xác thực</label>
                            <Form.Control
                                required
                                type="email"
                                placeholder="email@example.com"
                                className="bg-slate-50 border-0 rounded-4 py-3 px-4 text-slate-700 shadow-none transition-all fw-medium"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>

                        <div className="mb-0">
                            <label className="form-label small fw-900 text-slate-400 text-uppercase tracking-widest mb-2">Mật khẩu khởi tạo</label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="••••••••"
                                className="bg-slate-50 border-0 rounded-4 py-3 px-4 text-slate-700 shadow-none transition-all"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="bg-slate-50 p-5 pt-0 border-0 d-flex justify-content-between">
                        <Button variant="link" className="text-slate-400 text-decoration-none fw-bold small" onClick={() => setShowCreateModal(false)}>HỦY BỎ</Button>
                        <Button variant="indigo-gradient" type="submit" disabled={creating} className="px-5 rounded-pill shadow-indigo border-0 text-white fw-900 py-3 active-scale transition-all">
                            {creating ? <Spinner animation="border" size="sm" /> : 'XÁC NHẬN KHỞI TẠO'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <style>{`
                .fw-900 { font-weight: 900; }
                .tracking-tightest { letter-spacing: -0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                .bg-indigo-gradient { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important; }
                .shadow-indigo { box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
                .text-indigo-500 { color: #6366f1 !important; }
                .bg-slate-50 { background-color: #f8fafc !important; }
                .hover-slate-100:hover { background-color: #f1f5f9 !important; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                
                .custom-table-premium tbody tr { transition: all 0.2s; border-color: #f1f5f9; }
                .custom-table-premium tbody tr:hover { background-color: #f8fafc !important; transform: scale(1.001); }
                .user-avatar-premium { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                tr:hover .user-avatar-premium { transform: scale(1.1) rotate(5deg); }
                
                .active-scale:active { transform: scale(0.96); }
                .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .btn-white { background-color: white !important; }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default UsersManagement;
