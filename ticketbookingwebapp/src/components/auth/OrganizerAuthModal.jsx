import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaLock, FaEnvelope, FaUser, FaArrowRight, FaCalendarPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import './AuthModal.css';

const OrganizerAuthModal = ({ show, onHide }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.login({
                email: formData.email,
                password: formData.password
            });

            if (res.success) {
                // Check if user is organizer or admin
                if (res.user.role === 'ORGANIZER' || res.user.role === 'ADMIN') {
                    // Store auth data
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res.user));

                    // Close modal and redirect
                    onHide();
                    navigate('/organizer/dashboard');
                } else {
                    setError({ type: 'danger', msg: 'Tài khoản không có quyền tạo sự kiện. Vui lòng liên hệ admin để được cấp quyền.' });
                }
            }
        } catch (err) {
            setError({ type: 'danger', msg: err.message || 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ email: '', password: '' });
        setError(null);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="md" className="auth-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="w-100 text-center">
                    <div className="auth-modal-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                        <FaCalendarPlus />
                    </div>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                <div className="text-center mb-4 mt-3">
                    <h4 className="fw-bold">Đăng nhập cho Nhà tổ chức</h4>
                    <p className="text-muted small">Đăng nhập để tạo và quản lý sự kiện của bạn</p>
                </div>

                {error && (
                    <Alert variant={error.type} className="rounded-3 border-0">
                        {error.msg}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">
                            <FaEnvelope className="me-2" />
                            Email
                        </Form.Label>
                        <Form.Control
                            required
                            type="email"
                            placeholder="organizer@example.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="py-2 px-3"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">
                            <FaLock className="me-2" />
                            Mật khẩu
                        </Form.Label>
                        <Form.Control
                            required
                            type="password"
                            placeholder="********"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="py-2 px-3"
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 py-2 fw-bold"
                        disabled={loading}
                        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', border: 'none' }}
                    >
                        {loading ? <Spinner size="sm" className="me-2" /> : null}
                        ĐĂNG NHẬP
                        {!loading && <FaArrowRight className="ms-2" />}
                    </Button>
                </Form>

                <div className="mt-4 p-3 bg-light rounded-3">
                    <p className="small mb-2 fw-bold text-center">
                        <FaUser className="me-2" />
                        Tài khoản demo
                    </p>
                    <div className="small text-muted text-center">
                        <div>Email: <code>manager@ticketbox.vn</code></div>
                        <div>Password: <code>manager123</code></div>
                    </div>
                </div>

                <div className="text-center mt-3">
                    <p className="small text-muted mb-0">
                        Chưa có tài khoản?
                        <a href="mailto:admin@ticketbox.vn" className="text-primary ms-1 fw-bold text-decoration-none">
                            Liên hệ Admin
                        </a>
                    </p>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default OrganizerAuthModal;
