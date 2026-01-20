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
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const { login, redirectIntent } = useAuth();

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
        const newFieldErrors = {};

        // Basic frontend validation
        if (activeTab === 'login') {
            if (!formData.email) {
                newFieldErrors.email = 'Vui lòng nhập Email hoặc Số điện thoại';
            } else if (!validateEmailOrPhone(formData.email)) {
                newFieldErrors.email = 'Email hoặc Số điện thoại không hợp lệ';
            }
            if (!formData.password) {
                newFieldErrors.password = 'Vui lòng nhập mật khẩu';
            }
        } else if (activeTab === 'register') {
            if (!formData.full_name) {
                newFieldErrors.full_name = 'Vui lòng nhập họ và tên';
            }
            if (!formData.phone) {
                newFieldErrors.phone = 'Vui lòng nhập số điện thoại';
            } else if (!validatePhone(formData.phone)) {
                newFieldErrors.phone = 'Số điện thoại không hợp lệ (10 chữ số)';
            }
            if (!formData.email) {
                newFieldErrors.email = 'Vui lòng nhập email';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newFieldErrors.email = 'Email không hợp lệ';
            }
            if (!formData.password) {
                newFieldErrors.password = 'Vui lòng nhập mật khẩu';
            } else if (formData.password.length < 6) {
                newFieldErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            }
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            if (activeTab === 'register') {
                const res = await api.register(formData);
                if (res.success) {
                    // Auto-login after successful registration
                    const loginRes = await api.login({
                        email: formData.email,
                        password: formData.password
                    });
                    if (loginRes.success) {
                        login(loginRes.user, loginRes.token);
                        onHide();
                        if (onSuccess) onSuccess();
                    } else {
                        // If auto-login fails, switch to login tab
                        setActiveTab('login');
                        setError({ type: 'success', msg: 'Đăng ký thành công! Vui lòng đăng nhập.' });
                        setFormData({ ...formData, full_name: '', phone: '' });
                        setFieldErrors({});
                    }
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
            const msg = err.message || 'Có lỗi xảy ra';
            const newFieldErrors = {};

            if (msg.toLowerCase().includes('email')) {
                newFieldErrors.email = msg;
            } else if (msg.toLowerCase().includes('số điện thoại') || msg.toLowerCase().includes('phone')) {
                newFieldErrors.phone = msg;
            } else {
                setError({ type: 'danger', msg: msg });
            }

            if (Object.keys(newFieldErrors).length > 0) {
                setFieldErrors(newFieldErrors);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setError(null);
        setFieldErrors({});
    };

    const handleClose = () => {
        setFormData({ email: '', password: '', full_name: '', phone: '' });
        setError(null);
        setFieldErrors({});
        setActiveTab('login');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="sm" className="auth-modal">
            <Modal.Header closeButton className="auth-modal-header border-0">
                <div className="auth-header-content">
                    <h3 className="auth-header-title">
                        {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                    </h3>
                    <div className="auth-mascot">
                        <img src="/mascot.svg" alt="Mascot" />
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
                        {error && (
                            <Alert variant={error.type} className="rounded-3 border-0 py-2 small">
                                {error.msg}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit} noValidate>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="text"
                                    value={formData.email}
                                    onChange={e => {
                                        setFormData({ ...formData, email: e.target.value });
                                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                                    }}
                                    placeholder="Nhập email hoặc số điện thoại"
                                    className={`auth-input ${fieldErrors.email ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.email && <div className="text-danger small mt-1">{fieldErrors.email}</div>}
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Control
                                    type="password"
                                    value={formData.password}
                                    onChange={e => {
                                        setFormData({ ...formData, password: e.target.value });
                                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                                    }}
                                    placeholder="Nhập mật khẩu"
                                    className={`auth-input ${fieldErrors.password ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.password && <div className="text-danger small mt-1">{fieldErrors.password}</div>}
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? <LoadingOutlined spin className="me-2" /> : null}
                                ĐĂNG NHẬP
                                {!loading && <FaArrowRight className="ms-2" />}
                            </Button>
                        </Form>
                    </Tab>

                    <Tab eventKey="register" title="Đăng ký">
                        {error && (
                            <Alert variant={error.type} className="rounded-3 border-0 py-2 small">
                                {error.msg}
                            </Alert>
                        )}

                        <Form onSubmit={handleSubmit} noValidate>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    value={formData.full_name}
                                    onChange={e => {
                                        setFormData({ ...formData, full_name: e.target.value });
                                        if (fieldErrors.full_name) setFieldErrors({ ...fieldErrors, full_name: null });
                                    }}
                                    placeholder="Họ và tên"
                                    className={`auth-input ${fieldErrors.full_name ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.full_name && <div className="text-danger small mt-1">{fieldErrors.full_name}</div>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => {
                                        setFormData({ ...formData, phone: e.target.value });
                                        if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: null });
                                    }}
                                    placeholder="Số điện thoại"
                                    className={`auth-input ${fieldErrors.phone ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.phone && <div className="text-danger small mt-1">{fieldErrors.phone}</div>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="email"
                                    value={formData.email}
                                    onChange={e => {
                                        setFormData({ ...formData, email: e.target.value });
                                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                                    }}
                                    placeholder="Email"
                                    className={`auth-input ${fieldErrors.email ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.email && <div className="text-danger small mt-1">{fieldErrors.email}</div>}
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Control
                                    type="password"
                                    value={formData.password}
                                    onChange={e => {
                                        setFormData({ ...formData, password: e.target.value });
                                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                                    }}
                                    placeholder="Mật khẩu"
                                    className={`auth-input ${fieldErrors.password ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.password && <div className="text-danger small mt-1">{fieldErrors.password}</div>}
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 auth-submit-btn"
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
