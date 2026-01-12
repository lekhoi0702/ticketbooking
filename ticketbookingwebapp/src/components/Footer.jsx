import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <Container>
                <Row className="footer-content">
                    {/* Company Info */}
                    <Col md={3} sm={6} className="footer-column">
                        <h3 className="footer-logo">ticketbox</h3>
                        <div className="contact-info">
                            <div className="contact-item">
                                <FaPhone className="contact-icon" />
                                <span>Hotline: 1900.6408</span>
                            </div>
                            <div className="contact-item">
                                <FaEnvelope className="contact-icon" />
                                <span>support@ticketbox.vn</span>
                            </div>
                            <div className="contact-item">
                                <FaMapMarkerAlt className="contact-icon" />
                                <span>Tầng 8, Tòa nhà Sohude, 15 Lê Thánh Tôn, P. Bến Nghé, Q.1, TP.HCM</span>
                            </div>
                        </div>
                    </Col>

                    {/* Customer Links */}
                    <Col md={3} sm={6} className="footer-column">
                        <h4 className="footer-title">Dành cho Khách hàng</h4>
                        <ul className="footer-links">
                            <li><a href="#huong-dan">Hướng dẫn mua vé</a></li>
                            <li><a href="#chinh-sach">Chính sách & Quy định</a></li>
                            <li><a href="#bao-mat">Chính sách bảo mật</a></li>
                            <li><a href="#thanh-toan">Phương thức thanh toán</a></li>
                            <li><a href="#faq">Câu hỏi thường gặp</a></li>
                        </ul>
                    </Col>

                    {/* Organizer Links */}
                    <Col md={3} sm={6} className="footer-column">
                        <h4 className="footer-title">Dành cho Ban Tổ chức</h4>
                        <ul className="footer-links">
                            <li><a href="#tao-su-kien">Tạo sự kiện</a></li>
                            <li><a href="#quan-ly">Quản lý sự kiện</a></li>
                            <li><a href="#bao-cao">Báo cáo & Thống kê</a></li>
                            <li><a href="#ho-tro">Hỗ trợ tổ chức</a></li>
                        </ul>
                    </Col>

                    {/* About & Social */}
                    <Col md={3} sm={6} className="footer-column">
                        <h4 className="footer-title">Về chúng tôi</h4>
                        <ul className="footer-links">
                            <li><a href="#gioi-thieu">Giới thiệu</a></li>
                            <li><a href="#tuyen-dung">Tuyển dụng</a></li>
                            <li><a href="#lien-he">Liên hệ</a></li>
                        </ul>
                        <div className="social-links">
                            <a href="#facebook" className="social-icon">
                                <FaFacebook />
                            </a>
                            <a href="#instagram" className="social-icon">
                                <FaInstagram />
                            </a>
                            <a href="#tiktok" className="social-icon">
                                <FaTiktok />
                            </a>
                            <a href="#youtube" className="social-icon">
                                <FaYoutube />
                            </a>
                        </div>
                    </Col>
                </Row>

                <div className="footer-bottom">
                    <div className="footer-brand">
                        <span className="brand-text">ticketbox by VNPAY</span>
                    </div>
                    <div className="footer-copyright">
                        <p>© 2026 TicketBox. All rights reserved.</p>
                    </div>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
