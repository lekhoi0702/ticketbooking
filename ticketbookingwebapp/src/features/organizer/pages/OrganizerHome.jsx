import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    Button,
    Typography,
    Row,
    Col,
    Card,
    Space,
    ConfigProvider,
    Divider
} from 'antd';
import {
    RocketOutlined,
    BarChartOutlined,
    TeamOutlined,
    CustomerServiceOutlined,
    PlusCircleOutlined,
    ArrowRightOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import { useAuth } from '@context/AuthContext';
import OrganizerAuthModal from '@features/user/components/Auth/OrganizerAuthModal';
import { AntdThemeConfig } from '@theme/AntdThemeConfig';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const OrganizerHome = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';
        if (isAuthenticated && isOrganizer) {
            navigate('/organizer/events');
        }
    }, [isAuthenticated, user, navigate]);

    const features = [
        {
            title: 'Tạo Sự Kiện Dễ Dàng',
            desc: 'Quy trình tạo sự kiện chuyên nghiệp với đầy đủ cấu hình loại vé và sơ đồ ghế.',
            icon: <PlusCircleOutlined style={{ fontSize: 40, color: '#2DC275' }} />,
        },
        {
            title: 'Phân Tích Doanh Thu',
            desc: 'Theo dõi báo cáo doanh thu và lượng vé bán ra theo thời gian thực.',
            icon: <BarChartOutlined style={{ fontSize: 40, color: '#2DC275' }} />,
        },
        {
            title: 'Quản Lý Khách Hàng',
            desc: 'Dễ dàng quản lý thông tin người mua vé và các yêu cầu hỗ trợ.',
            icon: <TeamOutlined style={{ fontSize: 40, color: '#2DC275' }} />,
        },
        {
            title: 'Hỗ Trợ 24/7',
            desc: 'Đội ngũ kỹ thuật luôn sẵn sàng hỗ trợ bạn trong mọi khâu tổ chức.',
            icon: <CustomerServiceOutlined style={{ fontSize: 40, color: '#2DC275' }} />,
        }
    ];

    return (
        <ConfigProvider theme={AntdThemeConfig}>
            <Layout style={{ background: '#fff' }}>
                {/* Navbar */}
                <Header style={{
                    position: 'fixed',
                    zIndex: 1000,
                    width: '100%',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 50px'
                }}>
                    <div
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        <Title level={4} style={{ margin: 0, color: '#000000', fontWeight: 800 }}>TICKETBOOKING</Title>
                    </div>
                    <Space size={24}>
                        <Button type="text" onClick={() => navigate('/')} style={{ fontWeight: 600 }}>Tới trang bán vé</Button>
                        <Button
                            type="primary"
                            onClick={() => setShowAuthModal(true)}
                            style={{ borderRadius: 6, fontWeight: 600 }}
                        >
                            Đăng nhập
                        </Button>
                    </Space>
                </Header>

                <Content>
                    {/* Hero Section */}
                    <div style={{
                        height: '80vh',
                        minHeight: 600,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'white',
                        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        textAlign: 'center'
                    }}>
                        <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
                            <Title style={{ color: 'white', fontSize: '3.5rem', fontWeight: 900, marginBottom: 24 }}>
                                Giải Pháp Tổ Chức<br /><span style={{ color: '#2DC275' }}>Sự Kiện Toàn Diện</span>
                            </Title>
                            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.25rem', marginBottom: 40 }}>
                                Nền tảng chuyên nghiệp giúp nhà tổ chức quản lý, quảng bá và phân phối vé sự kiện một cách hiệu quả nhất tại Việt Nam.
                            </Paragraph>
                            <Space size={16}>
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<RocketOutlined />}
                                    onClick={() => setShowAuthModal(true)}
                                    style={{ height: 56, padding: '0 40px', fontSize: 18, fontWeight: 700, borderRadius: 8 }}
                                >
                                    BẮT ĐẦU NGAY
                                </Button>
                                <Button
                                    ghost
                                    size="large"
                                    style={{ height: 56, padding: '0 40px', fontSize: 18, fontWeight: 700, borderRadius: 8, color: 'white', borderColor: 'white' }}
                                >
                                    TÌM HIỂU THÊM
                                </Button>
                            </Space>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div style={{ padding: '100px 50px', backgroundColor: '#fff' }}>
                        <div style={{ textAlign: 'center', marginBottom: 80 }}>
                            <Title level={2} style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>
                                Tại sao chọn <span style={{ color: '#2DC275' }}>TicketBooking</span>?
                            </Title>
                            <div style={{ width: 60, height: 4, background: '#2DC275', margin: '0 auto', borderRadius: 2 }}></div>
                        </div>

                        <Row gutter={[40, 40]} justify="center">
                            {features.map((f, i) => (
                                <Col xs={24} sm={12} md={6} key={i}>
                                    <Card
                                        bordered={false}
                                        style={{
                                            textAlign: 'center',
                                            background: '#fafafa',
                                            borderRadius: 20,
                                            height: '100%',
                                            transition: 'transform 0.3s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ marginBottom: 24 }}>{f.icon}</div>
                                        <Title level={4} style={{ marginBottom: 16 }}>{f.title}</Title>
                                        <Text type="secondary" style={{ fontSize: 15, lineHeight: 1.6 }}>{f.desc}</Text>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* Simple CTA Section */}
                    <div style={{ padding: '100px 50px', backgroundColor: '#f9f9f9', textAlign: 'center' }}>
                        <Card
                            style={{
                                maxWidth: 1000,
                                margin: '0 auto',
                                borderRadius: 32,
                                background: 'linear-gradient(135deg, #2DC275 0%, #26a65b 100%)',
                                border: 'none',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px rgba(45, 194, 117, 0.2)'
                            }}
                            styles={{ body: { padding: '80px 40px' } }}
                        >
                            <Title style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>Sẵn sàng nâng tầm sự kiện của bạn?</Title>
                            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: 40 }}>
                                Tham gia cộng đồng nhà tổ chức chuyên nghiệp và trải nghiệm những tính năng ưu việt nhất.
                            </Paragraph>
                            <Button
                                size="large"
                                ghost
                                style={{
                                    height: 60,
                                    padding: '0 60px',
                                    fontSize: 18,
                                    fontWeight: 800,
                                    borderRadius: 12,
                                    backgroundColor: 'white',
                                    color: '#2DC275',
                                    border: 'none'
                                }}
                                onClick={() => setShowAuthModal(true)}
                            >
                                ĐĂNG KÝ HỢP TÁC
                            </Button>
                        </Card>
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center', padding: '60px 0', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
                    <div style={{ marginBottom: 16 }}>
                        <Title level={4} style={{ color: '#000000', margin: 0, fontWeight: 800 }}>TICKETBOOKING</Title>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        © 2026 TicketBooking Organizer Portal. Giải pháp quản lý sự kiện chuyên nghiệp bậc nhất.
                    </Text>
                </Footer>

                <OrganizerAuthModal
                    show={showAuthModal}
                    onHide={() => setShowAuthModal(false)}
                />
            </Layout>
        </ConfigProvider>
    );
};

export default OrganizerHome;
