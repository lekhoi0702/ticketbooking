import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Container, Spinner } from 'react-bootstrap';
import { FaUserShield, FaLock, FaEnvelope, FaFingerprint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.login(formData);
            if (res.success) {
                if (res.user.role === 'ADMIN') {
                    login(res.user, res.token);
                    navigate('/admin/dashboard');
                } else {
                    setError('Bạn không có quyền truy cập vào khu vực quản trị.');
                }
            }
        } catch (err) {
            setError(err.message || 'Lỗi đăng nhập hệ thống');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-wrapper bg-dark vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col md={5} lg={4}>
                        <Card className="border-0 shadow-lg bg-white rounded-4 overflow-hidden">
                            <div className="bg-primary p-4 text-center text-white">
                                <FaUserShield size={50} className="mb-2" />
                                <h4 className="fw-bold mb-0">HỆ THỐNG QUẢN TRỊ</h4>
                                <small className="opacity-75 text-uppercase">Admin Control Panel</small>
                            </div>
                            <Card.Body className="p-4">
                                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">Email Quản Trị</Form.Label>
                                        <div className="position-relative">
                                            <FaEnvelope className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                            <Form.Control
                                                type="email"
                                                required
                                                className="ps-5 py-2 border-0 bg-light"
                                                placeholder="admin@ticketbooking.com"
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-muted">Mật Mã Bảo Mật</Form.Label>
                                        <div className="position-relative">
                                            <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                                            <Form.Control
                                                type="password"
                                                required
                                                className="ps-5 py-2 border-0 bg-light"
                                                placeholder="••••••••"
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </Form.Group>
                                    <Button
                                        variant="dark"
                                        type="submit"
                                        className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center rounded-3 shadow"
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner size="sm" className="me-2" /> : <FaFingerprint className="me-2" />}
                                        XÁC THỰC TRUY CẬP
                                    </Button>
                                </Form>
                            </Card.Body>
                            <div className="bg-light p-3 text-center border-top">
                                <small className="text-muted">Đây là khu vực bảo mật. Mọi hoạt động đều được ghi lại.</small>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <style>{`
                .admin-login-wrapper {
                    background: linear-gradient(135deg, #1a1a1a 0%, #343a40 100%);
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
