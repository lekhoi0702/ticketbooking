import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Container, Spinner } from 'react-bootstrap';
import { FaLock, FaEnvelope, FaUser, FaArrowRight } from 'react-icons/fa';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        username: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect path after login
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isRegister) {
                const res = await api.register(formData);
                if (res.success) {
                    setIsRegister(false);
                    setError({ type: 'success', msg: 'Đăng ký thành công! Vui lòng đăng nhập.' });
                    setLoading(false);
                }
            } else {
                const res = await api.login({
                    email: formData.email,
                    password: formData.password
                });
                if (res.success) {
                    login(res.user, res.token);
                    navigate(from, { replace: true });
                }
            }
        } catch (err) {
            setError({ type: 'danger', msg: err.message || 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={10} lg={8} xl={6}>
                    <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                        <Row className="g-0">
                            <Col md={12} className="p-5">
                                <div className="text-center mb-4">
                                    <div className="bg-primary bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
                                        <FaUser className="text-primary fs-3" />
                                    </div>
                                    <h2 className="fw-bold">{isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại!'}</h2>
                                    <p className="text-muted">
                                        {isRegister ? 'Đăng ký để bắt đầu trải nghiệm' : 'Đăng nhập để đặt vé và quản lý đơn hàng'}
                                    </p>
                                </div>

                                {error && (
                                    <Alert variant={error.type} className="rounded-3 shadow-sm border-0">
                                        {error.msg}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    {isRegister && (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Họ và tên</Form.Label>
                                                <Form.Control
                                                    required
                                                    placeholder="Nguyễn Văn A"
                                                    value={formData.full_name}
                                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                                    className="py-2 px-3 bg-light border-0"
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">Username</Form.Label>
                                                <Form.Control
                                                    required
                                                    placeholder="username123"
                                                    value={formData.username}
                                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                    className="py-2 px-3 bg-light border-0"
                                                />
                                            </Form.Group>
                                        </>
                                    )}

                                    <Form.Group className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <Form.Label className="small fw-bold">Email</Form.Label>
                                            <FaEnvelope className="text-muted small" />
                                        </div>
                                        <Form.Control
                                            required
                                            type="email"
                                            placeholder="example@gmail.com"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="py-2 px-3 bg-light border-0"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <Form.Label className="small fw-bold">Mật khẩu</Form.Label>
                                            <FaLock className="text-muted small" />
                                        </div>
                                        <Form.Control
                                            required
                                            type="password"
                                            placeholder="********"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="py-2 px-3 bg-light border-0"
                                        />
                                    </Form.Group>

                                    {!isRegister && (
                                        <div className="text-end mb-4">
                                            <Link to="#" className="text-primary text-decoration-none small fw-bold">Quên mật khẩu?</Link>
                                        </div>
                                    )}

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 py-3 rounded-3 shadow mb-4 fw-bold d-flex align-items-center justify-content-center"
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner size="sm" className="me-2" /> : null}
                                        {isRegister ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
                                        {!loading && <FaArrowRight className="ms-2" />}
                                    </Button>

                                    <div className="text-center mt-2">
                                        <p className="text-muted small">
                                            {isRegister ? 'Bạn đã có tài khoản?' : 'Bạn chưa có tài khoản?'}
                                            <Button
                                                variant="link"
                                                className="text-primary p-0 ms-2 fw-bold text-decoration-none small"
                                                onClick={() => setIsRegister(!isRegister)}
                                            >
                                                {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
                                            </Button>
                                        </p>
                                    </div>
                                </Form>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
