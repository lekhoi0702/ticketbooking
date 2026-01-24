import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { api } from '@services/api';
import './AuthModal.css';

const ForgotPasswordModal = ({ show, onHide, initialEmail = '' }) => {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (show) {
            setEmail(initialEmail);
            setError(null);
            setSuccess(false);
        }
    }, [show, initialEmail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = (email || '').trim();
        if (!trimmed) {
            setError('Vui lòng nhập email.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError('Email không hợp lệ.');
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await api.forgotPassword(trimmed);
            if (res.success) {
                setSuccess(true);
            } else {
                setError(res.message || 'Không thể gửi email khôi phục mật khẩu.');
            }
        } catch (err) {
            setError(err.message || 'Không thể gửi email khôi phục mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        setSuccess(false);
        onHide?.();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="sm" className="auth-modal">
            <Modal.Header closeButton className="auth-modal-header border-0">
                <div className="auth-header-content">
                    <h3 className="auth-header-title">Quên mật khẩu</h3>
                    <div className="auth-mascot">
                        <img src="/mascot.svg" alt="Mascot" />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                {success ? (
                    <>
                        <div className="small text-success mb-3">
                            Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu qua email. Vui lòng kiểm tra hộp thư và thư mục spam. Link sẽ hết hạn sau 5 phút.
                        </div>
                        <Button variant="primary" className="w-100 auth-submit-btn" onClick={handleClose}>
                            <FaArrowLeft className="me-2" />
                            Quay lại đăng nhập
                        </Button>
                    </>
                ) : (
                    <>
                        <p className="small text-muted mb-3">
                            Nhập email đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu về email của bạn.
                        </p>
                        {error && (
                            <div className="small mb-3 text-danger">{error}</div>
                        )}
                        <Form onSubmit={handleSubmit} noValidate>
                            <Form.Group className="mb-3">
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(null); }}
                                    placeholder="Nhập email"
                                    className="auth-input"
                                />
                            </Form.Group>
                            <Button
                                variant="primary"
                                type="submit"
                                className="w-100 auth-submit-btn mb-2"
                                disabled={loading}
                            >
                                {loading ? <LoadingOutlined spin className="me-2" /> : null}
                                GỬI LINK ĐẶT LẠI MẬT KHẨU
                            </Button>
                            <Button variant="link" className="w-100 text-muted small" onClick={handleClose}>
                                <FaArrowLeft className="me-2" />
                                Quay lại đăng nhập
                            </Button>
                        </Form>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ForgotPasswordModal;
