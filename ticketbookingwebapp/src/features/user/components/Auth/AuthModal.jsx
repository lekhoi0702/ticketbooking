import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaLock, FaEnvelope, FaUser, FaPhone, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import './AuthModal.css';

const AuthModal = ({ show, onHide, onSuccess }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [viewMode, setViewMode] = useState('tabs'); // 'tabs' or 'forgot'
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotError, setForgotError] = useState(null);
    const [forgotSuccess, setForgotSuccess] = useState(false);
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
            } else if (formData.email.toLowerCase() !== "admin" && !validateEmailOrPhone(formData.email)) {
                // Skip validation for admin login (email = "admin")
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
                    try {
                        const loginRes = await api.login({
                            email: formData.email,
                            password: formData.password
                        });
                        if (loginRes.success && loginRes.data) {
                            login(loginRes.data.user, loginRes.data.access_token);
                            onHide();
                            if (onSuccess) onSuccess();
                        } else {
                            // If auto-login fails, switch to login tab
                            setActiveTab('login');
                            setError({ type: 'success', msg: 'Đăng ký thành công! Vui lòng đăng nhập.' });
                            setFormData({ ...formData, full_name: '', phone: '' });
                            setFieldErrors({});
                        }
                    } catch (loginErr) {
                        // If auto-login fails with error, switch to login tab and show message
                        setActiveTab('login');
                        const loginErrorMsg = loginErr.message || 'Đăng ký thành công nhưng đăng nhập tự động thất bại. Vui lòng đăng nhập thủ công.';
                        setError({ type: 'warning', msg: loginErrorMsg });
                        setFormData({ ...formData, full_name: '', phone: '' });
                        setFieldErrors({});
                    }
                } else {
                    // Registration response indicates failure
                    const errorMsg = res.message || 'Đăng ký không thành công';
                    setError({ type: 'danger', msg: errorMsg });
                }
            } else {
                try {
                    const res = await api.login({
                        email: formData.email,
                        password: formData.password
                    });
                    if (res.success && res.data) {
                        login(res.data.user, res.data.access_token);
                        onHide();
                        if (onSuccess) onSuccess();
                    } else {
                        // Always show error message
                        const errorMsg = res.message || 'Đăng nhập không thành công';
                        setError({ type: 'danger', msg: errorMsg });
                    }
                } catch (loginErr) {
                    // Error from api.login() will be caught here
                    const errorMsg = loginErr.message || 'Đăng nhập không thành công';
                    setError({ type: 'danger', msg: errorMsg });
                }
            }
        } catch (err) {
            const msg = err.message || 'Có lỗi xảy ra';
            const newFieldErrors = {};
            
            // Check if error has field information from backend
            if (err.data && err.data.field) {
                const field = err.data.field;
                const fieldMsg = err.data.message || msg;
                
                // Map backend field names to form field names
                if (field === 'phone') {
                    newFieldErrors.phone = fieldMsg.includes('already exists') 
                        ? 'Số điện thoại này đã được sử dụng' 
                        : fieldMsg;
                } else if (field === 'email') {
                    newFieldErrors.email = fieldMsg.includes('already exists') 
                        ? 'Email này đã được sử dụng' 
                        : fieldMsg;
                }
                
                // Also show general error message
                setError({ type: 'danger', msg: fieldMsg.includes('already exists') 
                    ? (field === 'phone' ? 'Số điện thoại này đã được sử dụng' : 'Email này đã được sử dụng')
                    : fieldMsg });
            } else {
                // Fallback to message-based detection
                const lowerMsg = msg.toLowerCase();
                if (lowerMsg.includes('email') && activeTab === 'login') {
                    // For login, show email error in field
                    newFieldErrors.email = msg;
                    setError({ type: 'danger', msg: msg });
                } else if ((lowerMsg.includes('số điện thoại') || lowerMsg.includes('phone')) && activeTab === 'register') {
                    // For register, show phone error in field
                    newFieldErrors.phone = lowerMsg.includes('already exists') || lowerMsg.includes('đã được sử dụng')
                        ? 'Số điện thoại này đã được sử dụng'
                        : msg;
                    setError({ type: 'danger', msg: lowerMsg.includes('already exists') || lowerMsg.includes('đã được sử dụng')
                        ? 'Số điện thoại này đã được sử dụng'
                        : msg });
                } else if (lowerMsg.includes('email') && activeTab === 'register') {
                    // For register, show email error in field
                    newFieldErrors.email = lowerMsg.includes('already exists') || lowerMsg.includes('đã được sử dụng')
                        ? 'Email này đã được sử dụng'
                        : msg;
                    setError({ type: 'danger', msg: lowerMsg.includes('already exists') || lowerMsg.includes('đã được sử dụng')
                        ? 'Email này đã được sử dụng'
                        : msg });
                } else {
                    // Always show error message
                    setError({ type: 'danger', msg: msg });
                }
            }

            // Set field-specific errors if any
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

    const handleForgotPassword = () => {
        setForgotEmail(formData.email);
        setViewMode('forgot');
        setForgotError(null);
        setForgotSuccess(false);
    };

    const handleBackToLogin = () => {
        setViewMode('tabs');
        setForgotError(null);
        setForgotSuccess(false);
        setForgotEmail('');
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        const trimmed = (forgotEmail || '').trim();
        if (!trimmed) {
            setForgotError('Vui lòng nhập email.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setForgotError('Email không hợp lệ.');
            return;
        }
        setForgotLoading(true);
        setForgotError(null);
        setForgotSuccess(false);
        try {
            const res = await api.forgotPassword(trimmed);
            if (res.success) {
                setForgotSuccess(true);
            } else {
                setForgotError(res.message || 'Không thể gửi email khôi phục mật khẩu.');
            }
        } catch (err) {
            setForgotError(err.message || 'Không thể gửi email khôi phục mật khẩu.');
        } finally {
            setForgotLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ email: '', password: '', full_name: '', phone: '' });
        setError(null);
        setFieldErrors({});
        setActiveTab('login');
        setViewMode('tabs');
        setForgotEmail('');
        setForgotError(null);
        setForgotSuccess(false);
        onHide();
    };

    return (
        <>
        <Modal show={show} onHide={handleClose} centered size="sm" className="auth-modal">
            <Modal.Header closeButton className="auth-modal-header border-0">
                <div className="auth-header-content">
                    <h3 className="auth-header-title">
                        {viewMode === 'forgot' ? 'Quên mật khẩu' : (activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký')}
                    </h3>
                    <div className="auth-mascot">
                        <img src="/mascot.svg" alt="Mascot" />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                {viewMode === 'forgot' ? (
                    <>
                        {forgotSuccess ? (
                            <>
                                <div className="small text-success mb-3">
                                    Bạn sẽ nhận được link đặt lại mật khẩu qua email. Vui lòng kiểm tra hộp thư và thư mục spam. Link sẽ hết hạn sau 5 phút.
                                </div>
                                <Button variant="primary" className="w-100 auth-submit-btn" onClick={handleBackToLogin}>
                                    <FaArrowLeft className="me-2" />
                                    Quay lại đăng nhập
                                </Button>
                            </>
                        ) : (
                            <>
                                <p className="small text-muted mb-3">
                                    Nhập email đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu về email của bạn.
                                </p>
                                {forgotError && (
                                    <div className="small mb-3 text-danger">{forgotError}</div>
                                )}
                                <Form onSubmit={handleForgotSubmit} noValidate>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="email"
                                            value={forgotEmail}
                                            onChange={e => { setForgotEmail(e.target.value); setForgotError(null); }}
                                            placeholder="Nhập email"
                                            className="auth-input"
                                        />
                                    </Form.Group>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 auth-submit-btn mb-2"
                                        disabled={forgotLoading}
                                    >
                                        {forgotLoading ? <LoadingOutlined spin className="me-2" /> : null}
                                        ĐẶT LẠI MẬT KHẨU
                                    </Button>
                                    <Button variant="link" className="w-100 text-muted small" onClick={handleBackToLogin}>
                                        <FaArrowLeft className="me-2" />
                                        Quay lại đăng nhập
                                    </Button>
                                </Form>
                            </>
                        )}
                    </>
                ) : (
                    <>
                    <div className="auth-tabs-row mb-4">
                        <button
                            type="button"
                            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => handleTabChange('login')}
                            aria-selected={activeTab === 'login'}
                        >
                            Đăng nhập
                        </button>
                        <button
                            type="button"
                            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => handleTabChange('register')}
                            aria-selected={activeTab === 'register'}
                        >
                            Đăng ký
                        </button>
                    </div>
                    {activeTab === 'login' && (
                        <>
                        {error && (
                            <div className={`small mb-3 ${error.type === 'success' ? 'text-success' : error.type === 'warning' ? 'text-warning' : 'text-danger'}`}>
                                {error.msg}
                            </div>
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
                            <div className="text-center mt-2">
                                <Button
                                    variant="link"
                                    className="p-0 small text-muted text-decoration-none"
                                    onClick={handleForgotPassword}
                                >
                                    Quên mật khẩu?
                                </Button>
                            </div>
                        </Form>
                        </>
                    )}
                    {activeTab === 'register' && (
                        <>
                        {error && (
                            <div className={`small mb-3 ${error.type === 'success' ? 'text-success' : error.type === 'warning' ? 'text-warning' : 'text-danger'}`}>
                                {error.msg}
                            </div>
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
                        </>
                    )}
                    </>
                )}
            </Modal.Body>
        </Modal>
        </>
    );
};

export default AuthModal;
