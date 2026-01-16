import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Alert } from 'react-bootstrap';
import { FaLock, FaEnvelope, FaUser, FaPhone, FaArrowRight } from 'react-icons/fa';
import { LoadingOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import '@features/user/components/Auth/AuthModal.css';

const Login = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        phone: ''
    });
    const [error, setError] = useState(null);
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
            if (!validateEmailOrPhone(formData.email)) {
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

        try {
            if (activeTab === 'register') {
                const res = await api.register(formData);
                if (res.success) {
                    setActiveTab('login');
                    setError({ type: 'success', msg: 'Đăng ký thành công! Vui lòng đăng nhập.' });
                    setFormData({ email: '', password: '', full_name: '', phone: '' });
                }
            } else {
                const res = await api.login({
                    email: formData.email,
                    password: formData.password,
                    required_role: 'USER'
                });
                if (res.success) {
                    login(res.user, res.token);
                    const from = location.state?.from?.pathname || "/";
                    const fromState = location.state?.from?.state || {};
                    navigate(from, { state: fromState, replace: true });
                }
            }
        } catch (err) {
            setError({ type: 'danger', msg: err.message || 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <Row className="w-100 justify-content-center">
                <Col md={8} lg={6} xl={5}>
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

                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => { setActiveTab(k); setError(null); }}
                                className="auth-tabs mb-4"
                                justify
                            >
                                <Tab eventKey="login" title="Đăng nhập">
                                    <div className="text-center mb-4 mt-3">
                                        <h4 className="fw-bold">Chào mừng trở lại!</h4>
                                        <p className="text-muted small">Đăng nhập để đặt vé và quản lý đơn hàng</p>
                                    </div>

                                    {error && (
                                        <Alert variant={error.type} className="rounded-3 border-0">
                                            {error.msg}
                                        </Alert>
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
                                    </Form>
                                </Tab>

                                <Tab eventKey="register" title="Đăng ký">
                                    <div className="text-center mb-4 mt-3">
                                        <h4 className="fw-bold">Tạo tài khoản mới</h4>
                                        <p className="text-muted small">Đăng ký để bắt đầu trải nghiệm</p>
                                    </div>

                                    {error && (
                                        <Alert variant={error.type} className="rounded-3 border-0">
                                            {error.msg}
                                        </Alert>
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
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="py-2 px-3"
                                                pattern="[0-9]{10}"
                                            />
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
                                </Tab>
                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
