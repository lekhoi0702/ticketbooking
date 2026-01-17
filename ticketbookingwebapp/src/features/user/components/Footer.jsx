import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { Container } from 'react-bootstrap';
import {
    FacebookFilled,
    InstagramFilled,
    LinkedinFilled,
    GlobalOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Footer.css';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
    return (
        <AntFooter className="app-main-footer">
            <Container>
                {/* Top Section */}
                <div className="footer-top-section">
                    <Row gutter={[24, 32]}>
                        {/* Column 1: Contact Info */}
                        <Col xs={24} md={8}>
                            <div className="footer-info-block">
                                <Title level={5} className="footer-heading">Hotline</Title>
                                <Text className="footer-text-icon">
                                    <PhoneOutlined rotate={90} /> Thứ 2 - Chủ Nhật (8:00 - 23:00)
                                </Text>
                                <a href="tel:19006408" className="footer-hotline">1900.6408</a>
                            </div>

                            <div className="footer-info-block">
                                <Title level={5} className="footer-heading">Email</Title>
                                <a href="mailto:support@ticketbox.vn" className="footer-email">
                                    <MailOutlined /> support@ticketbooking.vn
                                </a>
                            </div>

                            <div className="footer-info-block">
                                <Title level={5} className="footer-heading">Văn phòng chính</Title>
                                <Text className="footer-address">
                                    <EnvironmentOutlined /> Tầng 12, Tòa nhà Viettel, 285 Cách Mạng Tháng Tám, Phường 12, Quận 10, TP. Hồ Chí Minh
                                </Text>
                            </div>
                        </Col>

                        {/* Column 2: Customer & Organizer Links */}
                        <Col xs={24} md={8}>
                            <div className="footer-group">
                                <Title level={5} className="footer-heading">Dành cho Khách hàng</Title>
                                <Link to="/terms-customer" className="footer-link">Điều khoản sử dụng cho khách hàng</Link>
                            </div>

                            <div className="footer-group">
                                <Title level={5} className="footer-heading">Dành cho Ban Tổ chức</Title>
                                <Link to="/terms-organizer" className="footer-link">Điều khoản sử dụng cho ban tổ chức</Link>
                            </div>
                        </Col>

                        {/* Column 3: About Company */}
                        <Col xs={24} md={8}>
                            <Title level={5} className="footer-heading">Về công ty chúng tôi</Title>
                            <Space direction="vertical" size={8} className="footer-links-list">
                                <Link to="/about" className="footer-link">Quy chế hoạt động</Link>
                                <Link to="/privacy" className="footer-link">Chính sách bảo mật thông tin</Link>
                                <Link to="/dispute" className="footer-link">Cơ chế giải quyết tranh chấp/ khiếu nại</Link>
                                <Link to="/payment-privacy" className="footer-link">Chính sách bảo mật thanh toán</Link>
                                <Link to="/return-policy" className="footer-link">Chính sách đổi trả và kiểm hàng</Link>
                                <Link to="/shipping" className="footer-link">Điều kiện vận chuyển và giao nhận</Link>
                                <Link to="/payment-methods" className="footer-link">Phương thức thanh toán</Link>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Bottom Section */}
                <div className="footer-bottom-section">
                    <Row gutter={[24, 32]}>
                        {/* Ticketbooking App */}
                        <Col xs={24} md={8}>
                            <Title level={5} className="footer-heading">Ứng dụng Ticketbooking</Title>
                            <Space direction="horizontal" size={16} wrap>
                                <a href="#" className="app-download-btn">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" />
                                </a>
                                <a href="#" className="app-download-btn">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" />
                                </a>
                            </Space>
                        </Col>

                        {/* Organizer App */}
                        <Col xs={24} md={8}>
                            <Title level={5} className="footer-heading">Ứng dụng check-in cho Ban tổ chức</Title>
                            <Space direction="horizontal" size={16} wrap>
                                <a href="#" className="app-download-btn">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" />
                                </a>
                                <a href="#" className="app-download-btn">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" />
                                </a>
                            </Space>
                        </Col>

                        {/* Follow (Language removed) */}
                        <Col xs={24} md={8}>
                            <div className="footer-social-group">
                                <Title level={5} className="footer-heading">Follow us</Title>
                                <Space size={16} className="social-icons">
                                    <a href="#" className="social-icon facebook"><FacebookFilled /></a>
                                    <a href="#" className="social-icon instagram"><InstagramFilled /></a>
                                    <a href="#" className="social-icon tiktok"><GlobalOutlined /></a>
                                    <a href="#" className="social-icon linkedin"><LinkedinFilled /></a>
                                </Space>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </AntFooter>
    );
};

export default Footer;