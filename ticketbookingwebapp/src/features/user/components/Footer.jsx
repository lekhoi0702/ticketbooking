import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import {
    FacebookOutlined,
    InstagramOutlined,
    YoutubeOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    TwitterOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Footer.css';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
    return (
        <AntFooter className="app-footer-wrapper">
            <div className="footer-container">
                <Row gutter={[48, 32]}>
                    <Col xs={24} sm={12} md={6}>
                        <div className="footer-brand">
                            <Title level={3} style={{ color: '#52c41a', margin: 0 }}>ticketbooking</Title>
                            <Text type="secondary" className="footer-desc">
                                Nền tảng đặt vé sự kiện hàng đầu Việt Nam. Mang đến trải nghiệm giải trí tuyệt vời nhất cho bạn.
                            </Text>
                            <Space size="middle" className="footer-social">
                                <a href="https://facebook.com" target="_blank" rel="noreferrer"><FacebookOutlined /></a>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer"><InstagramOutlined /></a>
                                <a href="https://twitter.com" target="_blank" rel="noreferrer"><TwitterOutlined /></a>
                                <a href="https://youtube.com" target="_blank" rel="noreferrer"><YoutubeOutlined /></a>
                            </Space>
                        </div>
                    </Col>

                    <Col xs={12} sm={12} md={6}>
                        <Title level={5}>Dành cho Khách hàng</Title>
                        <Space direction="vertical" className="footer-links">
                            <Link to="/huong-dan">Hướng dẫn mua vé</Link>
                            <Link to="/chinh-sach">Chính sách & Quy định</Link>
                            <Link to="/bao-mat">Chính sách bảo mật</Link>
                            <Link to="/thanh-toan">Phương thức thanh toán</Link>
                            <Link to="/faq">Câu hỏi thường gặp</Link>
                        </Space>
                    </Col>

                    <Col xs={12} sm={12} md={6}>
                        <Title level={5}>Dành cho Ban tổ chức</Title>
                        <Space direction="vertical" className="footer-links">
                            <Link to="/organizer">Tạo sự kiện</Link>
                            <Link to="/organizer/login">Đăng nhập Organizer</Link>
                            <Link to="/bao-cao">Báo cáo & Thống kê</Link>
                            <Link to="/ho-tro">Hỗ trợ tổ chức</Link>
                        </Space>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Title level={5}>Liên hệ với chúng tôi</Title>
                        <Space direction="vertical" className="footer-contact">
                            <Text><PhoneOutlined /> Hotline: 1900.6408</Text>
                            <Text><MailOutlined /> support@ticketbooking.vn</Text>
                            <Text className="address-text">
                                <EnvironmentOutlined /> Tầng 8, Tòa nhà Sohude, 15 Lê Thánh Tôn, P. Bến Nghé, Q.1, TP.HCM
                            </Text>
                        </Space>
                    </Col>
                </Row>

                <Divider style={{ borderColor: '#f0f0f0', margin: '40px 0 24px' }} />

                <div className="footer-bottom">
                    <Text type="secondary">© 2026 TicketBooking. All rights reserved.</Text>
                    <Space size="large" className="footer-policy-links">
                        <Link to="/terms">Điều khoản sử dụng</Link>
                        <Link to="/privacy">Bảo mật</Link>
                    </Space>
                </div>
            </div>
        </AntFooter>
    );
};

export default Footer;
