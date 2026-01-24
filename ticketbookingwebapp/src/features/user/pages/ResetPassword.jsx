import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { FaLock, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import '@features/user/components/Auth/AuthModal.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { setShowLoginModal } = useAuth();

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tokenStatus, setTokenStatus] = useState(null); // 'checking', 'used', 'expired', 'not_found', 'valid'
    const [showTokenModal, setShowTokenModal] = useState(false);

    useEffect(() => {
        if (!token) {
            setError({ type: 'danger', msg: 'Token không hợp lệ. Vui lòng yêu cầu link đặt lại mật khẩu mới.' });
            setTokenStatus('not_found');
            return;
        }

        // Check token status when component mounts
        const checkToken = async () => {
            setTokenStatus('checking');
            try {
                const res = await api.checkResetToken(token);
                if (res.success && res.status === 'valid') {
                    setTokenStatus('valid');
                } else {
                    // Token is used, expired, or not found
                    setTokenStatus(res.status || 'not_found');
                    setShowTokenModal(true);
                }
            } catch (err) {
                // If check fails, still allow user to try (maybe network issue)
                setTokenStatus('valid');
            }
        };

        checkToken();
    }, [token]);

    const validatePassword = (password) => {
        if (!password || password.length < 6) {
            return 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        return null;
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoHomeAndShowLogin = () => {
        navigate('/');
        setShowLoginModal(true);
    };

    const handleCloseTokenModal = () => {
        setShowTokenModal(false);
        handleGoHome();
    };

    const getTokenStatusMessage = () => {
        switch (tokenStatus) {
            case 'used':
                return 'Vui lòng gửi lại yêu cầu.';
            case 'expired':
                return 'Vui lòng gửi lại yêu cầu.';
            case 'not_found':
                return 'Vui lòng gửi lại yêu cầu.';
            default:
                return 'Vui lòng gửi lại yêu cầu.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setError({ type: 'danger', msg: 'Token không hợp lệ. Vui lòng yêu cầu link đặt lại mật khẩu mới.' });
            return;
        }

        const newPasswordError = validatePassword(formData.newPassword);
        if (newPasswordError) {
            setFieldErrors({ newPassword: newPasswordError });
            setError({ type: 'danger', msg: newPasswordError });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setFieldErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
            setError({ type: 'danger', msg: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        setLoading(true);
        setError(null);
        setFieldErrors({});

        try {
            const res = await api.resetPassword(token, formData.newPassword);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    handleGoHomeAndShowLogin();
                }, 1500);
            } else {
                setError({ type: 'danger', msg: res.message || 'Đặt lại mật khẩu không thành công' });
            }
        } catch (err) {
            const errorMsg = err.message || 'Đặt lại mật khẩu không thành công';
            setError({ type: 'danger', msg: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
                <Row className="w-100 justify-content-center">
                    <Col md={10} lg={8} xl={6}>
                        <div className="auth-reset-page position-relative">
                            <div className="auth-modal-header position-relative">
                                <button
                                    type="button"
                                    className="btn-close-custom"
                                    onClick={handleGoHome}
                                    aria-label="Đóng"
                                >
                                    &times;
                                </button>
                                <div className="auth-header-content">
                                    <h3 className="auth-header-title">Đặt lại mật khẩu</h3>
                                    <div className="auth-mascot">
                                        <img src="/mascot.svg" alt="Mascot" />
                                    </div>
                                </div>
                            </div>
                            <div className="auth-reset-body px-4 pb-4 text-center">
                                <div className="small text-success mb-3">
                                    Đặt lại mật khẩu thành công! Bạn sẽ được chuyển về trang chủ và mở form đăng nhập.
                                </div>
                                <Button
                                    variant="primary"
                                    className="w-100 auth-submit-btn"
                                    onClick={handleGoHomeAndShowLogin}
                                >
                                    <FaArrowRight className="me-2" />
                                    Đăng nhập ngay
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Show loading while checking token
    if (tokenStatus === 'checking') {
        return (
            <Container className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
                <Row className="w-100 justify-content-center">
                    <Col md={10} lg={8} xl={6}>
                        <div className="auth-reset-page position-relative">
                            <div className="auth-modal-header position-relative">
                                <div className="auth-header-content">
                                    <h3 className="auth-header-title">Đặt lại mật khẩu</h3>
                                    <div className="auth-mascot">
                                        <img src="/mascot.svg" alt="Mascot" />
                                    </div>
                                </div>
                            </div>
                            <div className="auth-reset-body px-4 pb-4 text-center">
                                <LoadingOutlined spin style={{ fontSize: 24 }} />
                                <p className="small text-muted mt-3">Đang kiểm tra link...</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    // If token is invalid (used, expired, or not found), only show modal
    if (showTokenModal && tokenStatus !== 'valid' && tokenStatus !== 'checking') {
        return (
            <Modal
                show={showTokenModal}
                onHide={handleCloseTokenModal}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FaExclamationTriangle className="me-2 text-warning" />
                        Thông báo
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">{getTokenStatusMessage()}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseTokenModal}>
                        Về trang chủ
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <>
        {/* Modal thông báo token đã được sử dụng/hết hạn */}
        <Modal
            show={showTokenModal}
            onHide={handleCloseTokenModal}
            centered
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <FaExclamationTriangle className="me-2 text-warning" />
                    Thông báo
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0">{getTokenStatusMessage()}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleCloseTokenModal}>
                    Về trang chủ
                </Button>
            </Modal.Footer>
        </Modal>

        <Container className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <Row className="w-100 justify-content-center">
                <Col md={10} lg={8} xl={6}>
                    <div className="auth-reset-page position-relative">
                        <div className="auth-modal-header position-relative">
                            <button
                                type="button"
                                className="btn-close-custom"
                                onClick={handleGoHome}
                                aria-label="Đóng"
                            >
                                &times;
                            </button>
                            <div className="auth-header-content">
                                <h3 className="auth-header-title">Đặt lại mật khẩu</h3>
                                <div className="auth-mascot">
                                    <img src="/mascot.svg" alt="Mascot" />
                                </div>
                            </div>
                        </div>
                        <div className="auth-reset-body px-4 pb-4">
                            <p className="small text-muted mb-3">Nhập mật khẩu mới cho tài khoản của bạn.</p>

                            {error && (
                                <div className={`small mb-3 ${error.type === 'success' ? 'text-success' : error.type === 'warning' ? 'text-warning' : 'text-danger'}`}>
                                    {error.msg}
                                </div>
                            )}

                            <Form onSubmit={handleSubmit} noValidate>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={e => {
                                            setFormData({ ...formData, newPassword: e.target.value });
                                            if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: null });
                                        }}
                                        className={`auth-input ${fieldErrors.newPassword ? 'is-invalid' : ''}`}
                                        placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                                        minLength={6}
                                    />
                                    {fieldErrors.newPassword && (
                                        <div className="text-danger small mt-1">{fieldErrors.newPassword}</div>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Control
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={e => {
                                            setFormData({ ...formData, confirmPassword: e.target.value });
                                            if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null });
                                        }}
                                        className={`auth-input ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                                        placeholder="Xác nhận mật khẩu mới"
                                        minLength={6}
                                    />
                                    {fieldErrors.confirmPassword && (
                                        <div className="text-danger small mt-1">{fieldErrors.confirmPassword}</div>
                                    )}
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 auth-submit-btn"
                                    disabled={loading || !token || tokenStatus !== 'valid'}
                                >
                                    {loading ? <LoadingOutlined spin className="me-2" /> : null}
                                    ĐẶT LẠI MẬT KHẨU
                                    {!loading && <FaArrowRight className="ms-2" />}
                                </Button>
                            </Form>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
        </>
    );
};

export default ResetPassword;
