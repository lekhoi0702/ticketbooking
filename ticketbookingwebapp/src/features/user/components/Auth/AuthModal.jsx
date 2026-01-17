import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaLock, FaEnvelope, FaUser, FaPhone, FaArrowRight } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import './AuthModal.css';

const AuthModal = ({ show, onHide, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        phone: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();

    const validateEmailOrPhone = (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        return emailRegex.test(input) || phoneRegex.test(input);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic frontend validation
        if (activeTab === 'login') {
            if (!validateEmailOrPhone(formData.email)) {
                setError({ type: 'danger', msg: 'Vui lòng nhập Email hoặc Số điện thoại hợp lệ' });
                return;
            }
        } else if (activeTab === 'register') {
            if (!validatePhone(formData.phone)) {
                setError({ type: 'danger', msg: 'Số điện thoại không hợp lệ' });
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            if (activeTab === 'register') {
                const res = await api.register(formData);
                if (res.success) {
                    setActiveTab('login');
                    setError({ type: 'success', msg: 'Đăng ký thành công! Vui lòng đăng nhập.' });
                    setFormData({ ...formData, full_name: '', phone: '', email: '', password: '' });
                }
            } else {
                const res = await api.login({
                    email: formData.email,
                    password: formData.password
                });
                if (res.success) {
                    login(res.user, res.token);
                    onHide();
                    if (onSuccess) onSuccess();
                }
            }
        } catch (err) {
            setError({ type: 'danger', msg: err.message || 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError(null);
    };

    const handleClose = () => {
        setFormData({ email: '', password: '', full_name: '', phone: '' });
        setError(null);
        setActiveTab('login');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="md" className="auth-modal">
            <Modal.Header closeButton className="border-0 pb-0 shadow-none">
                <div className="w-100 d-flex flex-column align-items-center mt-3">
                    <div className="auth-modal-icon">
                        <FaUser />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                <Tabs
                    activeKey={activeTab}
                    onSelect={handleTabChange}
                    className="auth-tabs mb-4 nav-justified border-0"
                >
                    <Tab eventKey="login" title="Đăng nhập">
                        <div className="text-center mb-4 mt-3">
                            <h4 className="fw-bold">Chào mừng trở lại!</h4>
                            <p className="text-muted small">Đăng nhập để đặt vé và quản lý đơn hàng</p>
                        </div>

                        {error && (
                            <Alert variant={error.type} className="rounded-3 border-0 py-2 small">
                                {error.msg}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">
                                    <FaEnvelope className="me-2 text-muted" />
                                    Email hoặc Số điện thoại
                                </Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="py-2 px-3 bg-light border-0"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">
                                    <FaLock className="me-2 text-muted" />
                                    Mật khẩu
                                </Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="py-2 px-3 bg-light border-0"
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 py-2 fw-bold"
                                disabled={loading}
                            >
                                {loading ? <LoadingOutlined spin className="me-2" /> : null}
                                ĐĂNG NHẬP
                                {!loading && <FaArrowRight className="ms-2" />}
                            </Button>
                        </Form>
                    </Tab>

                    <Tab eventKey="register" title="Đăng ký">
                        <div className="text-center mb-4 mt-3">
                            <h4 className="fw-bold">Tạo tài khoản mới</h4>
                            <p className="text-muted small">Đăng ký để bắt đầu trải nghiệm</p>
                        </div>

                        {error && (
                            <Alert variant={error.type} className="rounded-3 border-0 py-2 small">
                                {error.msg}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">
                                    <FaUser className="me-2 text-muted" />
                                    Họ và tên
                                </Form.Label>
                                <Form.Control
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    className="py-2 px-3 bg-light border-0"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">
                                    <FaPhone className="me-2 text-muted" />
                                    Số điện thoại
                                </Form.Label>
                                <Form.Control
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="py-2 px-3 bg-light border-0"
                                    pattern="[0-9]{10}"
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">
                                    <FaEnvelope className="me-2 text-muted" />
                                    Email
                                </Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="py-2 px-3 bg-light border-0"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold">
                                    <FaLock className="me-2 text-muted" />
                                    Mật khẩu
                                </Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="py-2 px-3 bg-light border-0"
                                    minLength="6"
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 py-2 fw-bold"
                                disabled={loading}
                            >
                                {loading ? <LoadingOutlined spin className="me-2" /> : null}
                                ĐĂNG KÝ NGAY
                                {!loading && <FaArrowRight className="ms-2" />}
                            </Button>
                        </Form>
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
};

export default AuthModal;
