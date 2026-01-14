import React from 'react';
import { Container, Navbar, Nav, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaUser, FaGlobe } from 'react-icons/fa';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            {/* Top Bar */}
            <div className="top-bar">
                <Container>
                    <div className="top-bar-content">
                        <div className="logo">
                            <h1>ticketbooking</h1>
                        </div>

                        <div className="search-bar">
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Tìm kiếm sự kiện..."
                                    className="search-input"
                                />
                                <Button variant="light" className="search-button">
                                    <FaSearch /> Tìm kiếm
                                </Button>
                            </InputGroup>
                        </div>

                        <div className="top-bar-actions">
                            <Button variant="link" className="action-btn">
                                Tạo sự kiện
                            </Button>
                            <Button variant="link" className="action-btn">
                                <FaUser /> Vé của tôi
                            </Button>
                            <Button variant="link" className="action-btn">
                                Đăng nhập | Đăng ký
                            </Button>
                            <Button variant="link" className="action-btn language-btn">
                                <FaGlobe /> VI
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Main Navigation */}
            <Navbar bg="dark" variant="dark" expand="lg" className="main-nav">
                <Container>
                    <Nav className="w-100 justify-content-between">
                        <Nav.Link href="#nhac-song">Nhạc sống</Nav.Link>
                        <Nav.Link href="#san-khau">Sân khấu & Nghệ thuật</Nav.Link>
                        <Nav.Link href="#the-thao">Thể Thao</Nav.Link>
                        <Nav.Link href="#hoi-thao">Hội thảo & Workshop</Nav.Link>
                        <Nav.Link href="#tham-quan">Tham quan & Trải nghiệm</Nav.Link>
                        <Nav.Link href="#khac">Khác</Nav.Link>
                        <Nav.Link href="#ve-ban-lai">Vé bán lại</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </header>
    );
};

export default Header;
