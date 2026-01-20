import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ show, onHide }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newFieldErrors = {};

        // Trim values
        const oldPassword = formData.oldPassword?.trim() || '';
        const newPassword = formData.newPassword?.trim() || '';
        const confirmPassword = formData.confirmPassword?.trim() || '';

        console.log('Form data:', { oldPassword: oldPassword.length, newPassword: newPassword.length, confirmPassword: confirmPassword.length });

        // Validation
        if (!oldPassword) {
            newFieldErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
        }
        if (!newPassword) {
            newFieldErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (newPassword.length < 6) {
            newFieldErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (!confirmPassword) {
            newFieldErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
        } else if (newPassword !== confirmPassword) {
            newFieldErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (Object.keys(newFieldErrors).length > 0) {
            console.log('Validation errors:', newFieldErrors);
            setFieldErrors(newFieldErrors);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setFieldErrors({});

            if (!user || !user.user_id) {
                setError({ type: 'danger', msg: 'Không tìm thấy thông tin người dùng' });
                setLoading(false);
                return;
            }

            const res = await api.changePassword({
                user_id: user.user_id,
                old_password: oldPassword,
                new_password: newPassword
            });

            if (res.success) {
                setError({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
                setTimeout(() => {
                    handleClose();
                }, 1500);
            } else {
                setError({ type: 'danger', msg: res.message || 'Có lỗi xảy ra khi đổi mật khẩu' });
            }
        } catch (err) {
            console.error('Change password error:', err);
            setError({ type: 'danger', msg: err.message || 'Lỗi server, vui lòng thử lại sau' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setError(null);
        setFieldErrors({});
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="sm" className="change-password-modal">
            <Modal.Header closeButton className="change-password-modal-header border-0">
                <div className="change-password-header-content">
                    <h3 className="change-password-header-title">
                        Đổi mật khẩu
                    </h3>
                    <div className="change-password-mascot">
                        <img src="/mascot.svg" alt="Mascot" />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                {error && (
                    <Alert variant={error.type} className="rounded-3 border-0 py-2 small">
                        {error.msg}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="password"
                            value={formData.oldPassword}
                            onChange={e => {
                                setFormData({ ...formData, oldPassword: e.target.value });
                                if (fieldErrors.oldPassword) setFieldErrors({ ...fieldErrors, oldPassword: null });
                            }}
                            placeholder="Mật khẩu hiện tại"
                            className={`change-password-input ${fieldErrors.oldPassword ? 'is-invalid' : ''}`}
                        />
                        {fieldErrors.oldPassword && <div className="text-danger small mt-1">{fieldErrors.oldPassword}</div>}
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Control
                            type="password"
                            value={formData.newPassword}
                            onChange={e => {
                                setFormData({ ...formData, newPassword: e.target.value });
                                if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: null });
                            }}
                            placeholder="Mật khẩu mới"
                            className={`change-password-input ${fieldErrors.newPassword ? 'is-invalid' : ''}`}
                        />
                        {fieldErrors.newPassword && <div className="text-danger small mt-1">{fieldErrors.newPassword}</div>}
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Control
                            type="password"
                            value={formData.confirmPassword}
                            onChange={e => {
                                setFormData({ ...formData, confirmPassword: e.target.value });
                                if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null });
                            }}
                            placeholder="Xác nhận mật khẩu mới"
                            className={`change-password-input ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                        />
                        {fieldErrors.confirmPassword && <div className="text-danger small mt-1">{fieldErrors.confirmPassword}</div>}
                    </Form.Group>

                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100 change-password-submit-btn"
                        disabled={loading}
                    >
                        {loading ? <LoadingOutlined spin className="me-2" /> : null}
                        CẬP NHẬT MẬT KHẨU
                        {!loading && <FaArrowRight className="ms-2" />}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ChangePasswordModal;
