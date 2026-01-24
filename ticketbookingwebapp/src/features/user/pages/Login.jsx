import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FaLock, FaEnvelope, FaUser, FaPhone, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import '@features/user/components/Auth/AuthModal.css';

const Login = () => {
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

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

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

        if (activeTab === 'login') {
            // Skip validation for admin login (email = "admin")
            if (formData.email.toLowerCase() !== "admin" && !validateEmailOrPhone(formData.email)) {
                setError({ type: 'danger', msg: 'Vui lòng nhập Email hoặc Số điện thoại hợp lệ' });
                return;
            }
        } else {
            if (!validatePhone(formData.phone)) {
                setError({ type: 'danger', msg: 'Số điện thoại không hợp lệ' });
                return;
            }
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
                        password: formData.password,
                        required_role: 'USER'
                    });
                    if (loginRes.success && loginRes.data) {
                        login(loginRes.data.user, loginRes.data.access_token);
                        const from = location.state?.from?.pathname || "/";
                        const fromState = location.state?.from?.state || {};
                        navigate(from, { state: fromState, replace: true });
                    } else {
                        // If auto-login fails, switch to login tab
                        setActiveTab('login');
                        setError({ type: 'success', msg: 'Đăng ký thành công! Vui lòng đăng nhập.' });
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
                        password: formData.password,
                        required_role: 'USER'
                    });
                    if (res.success && res.data) {
                        login(res.data.user, res.data.access_token);
                        const from = location.state?.from?.pathname || "/";
                        const fromState = location.state?.from?.state || {};
                        navigate(from, { state: fromState, replace: true });
                    } else {
                        setError({ type: 'danger', msg: res.message || 'Đăng nhập không thành công' });
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
                if (lowerMsg.includes('email') && activeTab === 'register') {
                    newFieldErrors.email = lowerMsg.includes('already exists') || lowerMsg.includes('đã được sử dụng')
                        ? 'Email này đã được sử dụng'
                        : msg;
                    setError({ type: 'danger', msg: lowerMsg.includes('already exists') || lowerMsg.includes('đã được sử dụng')
                        ? 'Email này đã được sử dụng'
                        : msg });
                } else if ((lowerMsg.includes('số điện thoại') || lowerMsg.includes('phone')) && activeTab === 'register') {
                    newFieldErrors.phone = lowerMsg.includes('already exists') || lowerMsg.includes('đã được sử dụng')
                        ? 'Số điện thoại này đã được sử dụng'
                        : msg;
                    setError({ type: 'danger', msg: lowerMsg.includes('already exists') || lowerMsg.includes('đã được sử dụng')
                        ? 'Số điện thoại này đã được sử dụng'
                        : msg });
                } else {
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

    return (
        <Container className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <Row className="w-100 justify-content-center">
                <Col md={10} lg={8} xl={6}>
                    <Card className="border-0 shadow-lg rounded-4 overflow-hidden position-relative">
                        <Button
                            variant="link"
                            className="position-absolute end-0 top-0 m-3 text-muted p-0 d-flex align-items-center justify-content-center"
                            onClick={() => navigate('/')}
                            style={{
                                zIndex: 10,
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)';
                                e.currentTarget.style.transform = 'rotate(90deg)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                                e.currentTarget.style.transform = 'rotate(0deg)';
                            }}
                        >
                            <span style={{ fontSize: '20px', fontWeight: '400', color: '#666', marginTop: '-2px' }}>&times;</span>
                        </Button>
                        <Card.Body className="p-4 p-md-5">
                            <div className="text-center mb-4">
                                <div className="auth-modal-icon mx-auto mb-3" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#2dc275', color: 'white', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '24px' }}>
                                    <FaUser className="mx-auto" />
                                </div>
                            </div>

                            {viewMode === 'forgot' ? (
                                <>
                                    {forgotSuccess ? (
                                        <>
                                            <div className="text-center mb-4 mt-3">
                                                <h4 className="fw-bold">Quên mật khẩu</h4>
                                            </div>
                                            <div className="small text-success mb-3">
                                                Bạn sẽ nhận được link đặt lại mật khẩu qua email. Vui lòng kiểm tra hộp thư và thư mục spam. Link sẽ hết hạn sau 5 phút.
                                            </div>
                                            <Button variant="primary" className="w-100 py-2 fw-bold" onClick={handleBackToLogin}>
                                                <FaArrowLeft className="me-2" />
                                                Quay lại đăng nhập
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-center mb-4 mt-3">
                                                <h4 className="fw-bold">Quên mật khẩu</h4>
                                                <p className="text-muted small">Nhập email đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu về email của bạn.</p>
                                            </div>
                                            {forgotError && (
                                                <div className="small mb-3 text-danger">{forgotError}</div>
                                            )}
                                            <Form onSubmit={handleForgotSubmit} noValidate>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="small fw-bold">
                                                        <FaEnvelope className="me-2" />
                                                        Email
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        value={forgotEmail}
                                                        onChange={e => { setForgotEmail(e.target.value); setForgotError(null); }}
                                                        placeholder="Nhập email"
                                                        className="py-2 px-3"
                                                    />
                                                </Form.Group>
                                                <Button
                                                    variant="primary"
                                                    type="submit"
                                                    className="w-100 py-2 fw-bold mb-2"
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
                                        onClick={() => { setActiveTab('login'); setError(null); }}
                                        aria-selected={activeTab === 'login'}
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        type="button"
                                        className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                                        onClick={() => { setActiveTab('register'); setError(null); }}
                                        aria-selected={activeTab === 'register'}
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                                {activeTab === 'login' && (
                                    <>
                                    <div className="text-center mb-4 mt-3">
                                        <h4 className="fw-bold">Chào mừng trở lại!</h4>
                                        <p className="text-muted small">Đăng nhập để đặt vé và quản lý đơn hàng</p>
                                    </div>

                                    {error && (
                                        <div className={`small mb-3 ${error.type === 'success' ? 'text-success' : error.type === 'warning' ? 'text-warning' : 'text-danger'}`}>
                                            {error.msg}
                                        </div>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">
                                                <FaEnvelope className="me-2" />
                                                Email hoặc Số điện thoại
                                            </Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="py-2 px-3"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold">
                                                <FaLock className="me-2" />
                                                Mật khẩu
                                            </Form.Label>
                                            <Form.Control
                                                required
                                                type="password"
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
                                    <div className="text-center mb-4 mt-3">
                                        <h4 className="fw-bold">Tạo tài khoản mới</h4>
                                        <p className="text-muted small">Đăng ký để bắt đầu trải nghiệm</p>
                                    </div>

                                    {error && (
                                        <div className={`small mb-3 ${error.type === 'success' ? 'text-success' : error.type === 'warning' ? 'text-warning' : 'text-danger'}`}>
                                            {error.msg}
                                        </div>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">
                                                <FaUser className="me-2" />
                                                Họ và tên
                                            </Form.Label>
                                            <Form.Control
                                                required
                                                value={formData.full_name}
                                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                className="py-2 px-3"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">
                                                <FaPhone className="me-2" />
                                                Số điện thoại
                                            </Form.Label>
                                            <Form.Control
                                                required
                                                type="tel"
                                                value={formData.phone}
                                                onChange={e => {
                                                    setFormData({ ...formData, phone: e.target.value });
                                                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: null });
                                                }}
                                                className={`py-2 px-3 ${fieldErrors.phone ? 'is-invalid' : ''}`}
                                                pattern="[0-9]{10}"
                                            />
                                            {fieldErrors.phone && (
                                                <Form.Text className="text-danger small">{fieldErrors.phone}</Form.Text>
                                            )}
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">
                                                <FaEnvelope className="me-2" />
                                                Email
                                            </Form.Label>
                                            <Form.Control
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={e => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                                                }}
                                                className={`py-2 px-3 ${fieldErrors.email ? 'is-invalid' : ''}`}
                                            />
                                            {fieldErrors.email && (
                                                <Form.Text className="text-danger small">{fieldErrors.email}</Form.Text>
                                            )}
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold">
                                                <FaLock className="me-2" />
                                                Mật khẩu
                                            </Form.Label>
                                            <Form.Control
                                                required
                                                type="password"
                                                value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="py-2 px-3"
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
                                    </>
                                )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
