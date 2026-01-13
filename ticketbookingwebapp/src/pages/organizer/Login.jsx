import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Container, Spinner } from 'react-bootstrap';
import { FaCalendarCheck, FaLock, FaEnvelope, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const OrganizerLogin = () => {
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
                if (res.user.role === 'ORGANIZER' || res.user.role === 'ADMIN') {
                    login(res.user, res.token);
                    navigate('/organizer/dashboard');
                } else {
                    setError('Tài khoản này không có quyền quản lý sự kiện.');
                }
            }
        } catch (err) {
            setError(err.message || 'Lỗi kết nối cổng đối tác');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="organizer-login-wrapper vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="border-0 shadow rounded-4 overflow-hidden">
                            <Row className="g-0">
                                <Col md={5} className="bg-primary d-flex flex-column justify-content-center align-items-center text-white p-4">
                                    <FaBuilding size={60} className="mb-3 opacity-75" />
                                    <h4 className="fw-bold text-center">DÀNH CHO ĐỐI TÁC</h4>
                                    <p className="small text-center opacity-75">Quản lý sự kiện và doanh thu của bạn tại đây.</p>
                                </Col>
                                <Col md={7} className="p-4 bg-white">
                                    <div className="mb-4">
                                        <h3 className="fw-bold text-dark mb-1">Đăng nhập</h3>
                                        <p className="text-muted small">Cổng thông tin Ban Tổ Chức</p>
                                    </div>

                                    {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-semibold">Email Đối Tác</Form.Label>
                                            <Form.Control
                                                type="email"
                                                required
                                                className="py-2 border-0 bg-light rounded-3"
                                                placeholder="partner@event.com"
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-semibold">Mật Khẩu</Form.Label>
                                            <Form.Control
                                                type="password"
                                                required
                                                className="py-2 border-0 bg-light rounded-3"
                                                placeholder="••••••••"
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            className="w-100 py-2 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center"
                                            disabled={loading}
                                        >
                                            {loading ? <Spinner size="sm" className="me-2" /> : <FaCalendarCheck className="me-2" />}
                                            VÀO TRANG QUẢN LÝ
                                        </Button>
                                    </Form>
                                    <div className="mt-4 text-center">
                                        <small className="text-muted">Bạn muốn trở thành đối tác? <a href="#" className="text-primary text-decoration-none fw-bold">Đăng ký ngay</a></small>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <style>{`
                .organizer-login-wrapper {
                    background-color: #f0f2f5;
                    background-image: radial-gradient(#007bff 0.5px, #f0f2f5 0.5px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};

export default OrganizerLogin;
