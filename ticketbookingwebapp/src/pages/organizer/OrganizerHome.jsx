import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaCalendarPlus, FaChartLine, FaUsers, FaTicketAlt, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrganizerAuthModal from '../../components/auth/OrganizerAuthModal';
import './OrganizerHome.css';

/**
 * OrganizerHome landing page.
 * Redirects to dashboard if logged in, otherwise shows promotional content.
 */
const OrganizerHome = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If already logged in as organizer, redirect to dashboard
        const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';
        if (isAuthenticated && isOrganizer) {
            navigate('/organizer/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const features = [
        {
            icon: <FaCalendarPlus />,
            title: 'Tạo sự kiện nhanh chóng',
            description: 'Công cụ kéo thả và điền thông tin trực quan giúp bạn tạo sự kiện trong 5 phút.'
        },
        {
            icon: <FaTicketAlt />,
            title: 'Quản lý vé linh hoạt',
            description: 'Thiết lập nhiều loại vé (VIP, Standard), mã giảm giá và số lượng vé giới hạn.'
        },
        {
            icon: <FaChartLine />,
            title: 'Thống kê thời gian thực',
            description: 'Theo dõi doanh thu, số lượng vé đã bán và biểu đồ tăng trưởng ngay trên dashboard.'
        },
        {
            icon: <FaUsers />,
            title: 'Kết nối khán giả',
            description: 'Tiếp cận hàng triệu khách hàng tiềm năng đang tìm kiếm sự kiện trên TicketBox.'
        }
    ];

    return (
        <div className="organizer-home-v2">
            {/* Hero Section */}
            <section className="organizer-hero">
                <div className="hero-overlay"></div>
                <Container className="position-relative" style={{ zIndex: 2 }}>
                    <Row className="align-items-center min-vh-100">
                        <Col lg={7}>
                            <div className="mb-3">
                                <span className="badge rounded-pill bg-success px-3 py-2 fw-bold bg-opacity-75">
                                    <FaRocket className="me-2" /> DÀNH CHO NHÀ TỔ CHỨC
                                </span>
                            </div>
                            <h1 className="display-3 fw-bold mb-4 text-white">
                                Giải pháp quản lý <br />
                                <span className="text-ticketbox-green">Sự kiện toàn diện</span>
                            </h1>
                            <p className="lead mb-5 text-gray-300 fs-4">
                                Nền tảng bán vé và quản lý sự kiện hàng đầu Việt Nam.
                                Chúng tôi giúp bạn tối ưu quy trình và tăng doanh thu vượt trội.
                            </p>
                            <div className="d-flex gap-3">
                                <Button
                                    size="lg"
                                    className="btn-ticketbox px-5 py-3 fw-bold"
                                    onClick={() => setShowAuthModal(true)}
                                >
                                    BẮT ĐẦU NGAY
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline-light"
                                    className="px-5 py-3 fw-bold border-2"
                                >
                                    LIÊN HỆ TƯ VẤN
                                </Button>
                            </div>
                        </Col>
                        <Col lg={5} className="d-none d-lg-block">
                            <div className="hero-visual-card p-4 rounded-4 shadow-lg animate-float">
                                <div className="d-flex justify-content-between mb-4">
                                    <div className="fw-bold text-white fs-5">Doanh thu tháng này</div>
                                    <div className="text-ticketbox-green fw-bold">+24%</div>
                                </div>
                                <div className="h-150px bg-dark rounded-3 mb-4 d-flex align-items-end p-3 gap-2">
                                    <div className="bg-success opacity-50 flex-grow-1 rounded-top" style={{ height: '40%' }}></div>
                                    <div className="bg-success opacity-75 flex-grow-1 rounded-top" style={{ height: '60%' }}></div>
                                    <div className="bg-success flex-grow-1 rounded-top" style={{ height: '90%' }}></div>
                                    <div className="bg-success opacity-60 flex-grow-1 rounded-top" style={{ height: '50%' }}></div>
                                    <div className="bg-success opacity-80 flex-grow-1 rounded-top" style={{ height: '75%' }}></div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="bg-success bg-opacity-20 p-2 rounded-circle me-3">
                                        <FaShieldAlt className="text-ticketbox-green" />
                                    </div>
                                    <div className="text-muted small">Hệ thống bảo mật tiêu chuẩn quốc tế</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="features-v2 py-5">
                <Container className="py-5">
                    <div className="text-center mb-5 pb-3">
                        <h2 className="text-white fw-bold mb-3 display-5">Tại sao nên chọn TicketBox?</h2>
                        <div className="ticketbox-divider mx-auto mb-4"></div>
                        <p className="text-muted fs-5">Cung cấp bộ công cụ mạnh mẽ nhất cho nhà tổ chức chuyên nghiệp</p>
                    </div>
                    <Row>
                        {features.map((feature, index) => (
                            <Col key={index} md={6} lg={3} className="mb-4">
                                <Card className="organizer-feature-card h-100 border-0">
                                    <Card.Body className="p-4">
                                        <div className="feature-icon-v2 mb-4">
                                            {feature.icon}
                                        </div>
                                        <h4 className="text-white fw-bold mb-3">{feature.title}</h4>
                                        <p className="text-muted mb-0">{feature.description}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="cta-v2 py-5 text-center position-relative overflow-hidden">
                <div className="cta-bg-blur"></div>
                <Container className="py-5 position-relative" style={{ zIndex: 1 }}>
                    <h2 className="display-4 fw-bold text-white mb-4">Sẵn sàng để tổ chức sự kiện?</h2>
                    <p className="fs-4 text-gray-300 mb-5 max-w-700 mx-auto">
                        Gia nhập cộng đồng hơn 5.000+ nhà tổ chức sự kiện chuyên nghiệp tại Việt Nam.
                    </p>
                    <Button
                        size="lg"
                        className="btn-ticketbox px-5 py-3 fw-bold shadow-lg"
                        onClick={() => setShowAuthModal(true)}
                    >
                        ĐĂNG KÝ NHÀ TỔ CHỨC NGAY
                    </Button>
                </Container>
            </section>

            {/* Footer Placeholder for Organizer Home */}
            <footer className="py-4 border-top border-secondary border-opacity-10 text-center">
                <div className="container">
                    <div className="text-ticketbox-green fw-bold mb-2">TICKETBOX ORGANIZER</div>
                    <div className="text-muted small">© 2026 TicketBooking . All rights reserved.</div>
                </div>
            </footer>

            {/* Auth Modal */}
            <OrganizerAuthModal
                show={showAuthModal}
                onHide={() => setShowAuthModal(false)}
            />
        </div>
    );
};

export default OrganizerHome;
