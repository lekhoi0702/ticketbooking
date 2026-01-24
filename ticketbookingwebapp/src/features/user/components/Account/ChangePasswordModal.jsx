import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ show, onHide, forceChange = false, onSuccess }) => {
    const { user, token } = useAuth();
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

        // Validation (forceChange: skip old password)
        if (!forceChange && !oldPassword) {
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
            setFieldErrors(newFieldErrors);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setFieldErrors({});

            if (!forceChange && (!user || !user.user_id)) {
                setError({ type: 'danger', msg: 'Không tìm thấy thông tin người dùng' });
                setLoading(false);
                return;
            }
            if (forceChange && !token) {
                setError({ type: 'danger', msg: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' });
                setLoading(false);
                return;
            }

            const payload = forceChange
                ? { new_password: newPassword }
                : { user_id: user.user_id, old_password: oldPassword, new_password: newPassword };
            const res = await api.changePassword(payload, forceChange ? token : undefined);

            if (res.success) {
                setError({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
                if (forceChange && onSuccess) {
                    onSuccess();
                    setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    setError(null);
                    setFieldErrors({});
                } else {
                    setTimeout(() => handleClose(), 1500);
                }
            } else {
                setError({ type: 'danger', msg: res.message || 'Có lỗi xảy ra khi đổi mật khẩu' });
            }
        } catch (err) {
            setError({ type: 'danger', msg: err.message || 'Lỗi server, vui lòng thử lại sau' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setError(null);
        setFieldErrors({});
        onHide?.();
    };

    return (
        <Modal
            show={show}
            onHide={forceChange ? () => {} : handleClose}
            backdrop={forceChange ? 'static' : true}
            keyboard={!forceChange}
            centered
            size="sm"
            className="change-password-modal"
        >
            <Modal.Header closeButton={!forceChange} className="change-password-modal-header border-0">
                <div className="change-password-header-content">
                    <h3 className="change-password-header-title">
                        {forceChange ? 'Bạn cần đổi mật khẩu' : 'Đổi mật khẩu'}
                    </h3>
                    <div className="change-password-mascot">
                        <img src="/mascot.svg" alt="Mascot" />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                {error && (
                    <div className={`small mb-3 ${error.type === 'success' ? 'text-success' : error.type === 'warning' ? 'text-warning' : 'text-danger'}`}>
                        {error.msg}
                    </div>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                    {!forceChange && (
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
                    )}

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
