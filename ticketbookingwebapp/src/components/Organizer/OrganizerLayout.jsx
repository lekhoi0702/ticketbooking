import React from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt, FaCalendarPlus, FaList, FaUserCog, FaSignOutAlt } from 'react-icons/fa';

const OrganizerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
            {/* Sidebar */}
            <div className="bg-white shadow-sm d-flex flex-column" style={{ width: '280px', flexShrink: 0 }}>
                <div className="p-4 border-bottom">
                    <h4 className="text-primary mb-0 fw-bold">Quản Lý Sự Kiện</h4>
                </div>
                <div className="p-3">
                    <Nav className="flex-column nav-pills">
                        <Nav.Link as={Link} to="/organizer/dashboard" active={location.pathname === '/organizer/dashboard'} className="mb-2 d-flex align-items-center">
                            <FaTachometerAlt className="me-2" /> Tổng Quan
                        </Nav.Link>
                        <Nav.Link as={Link} to="/organizer/events" active={location.pathname === '/organizer/events'} className="mb-2 d-flex align-items-center">
                            <FaList className="me-2" /> Danh Sách Sự Kiện
                        </Nav.Link>
                        <Nav.Link as={Link} to="/organizer/create-event" active={location.pathname === '/organizer/create-event'} className="mb-2 d-flex align-items-center">
                            <FaCalendarPlus className="me-2" /> Tạo Sự Kiện Mới
                        </Nav.Link>
                        <Nav.Link as={Link} to="/organizer/profile" active={location.pathname === '/organizer/profile'} className="mb-2 d-flex align-items-center">
                            <FaUserCog className="me-2" /> Hồ Sơ
                        </Nav.Link>
                    </Nav>
                </div>
                <div className="mt-auto p-3 border-top">
                    <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center border-0 fw-bold mb-2">
                        <FaSignOutAlt className="me-2" /> Đăng xuất
                    </button>
                    <div className="text-center">
                        <small className="text-muted" style={{ fontSize: '10px' }}>© 2026 TicketBooking</small>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ overflowX: 'hidden' }}>
                <Navbar bg="white" className="shadow-sm px-4 py-3 justify-content-end mb-4 sticky-top">
                    <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-2">
                            <FaUserCog className="text-primary" />
                        </div>
                        <span className="text-secondary fw-semibold">{user?.full_name || 'Tài Khoản BTC'}</span>
                    </div>
                </Navbar>
                <Container fluid className="px-4 pb-4">
                    <Outlet />
                </Container>
            </div>
        </div>
    );
};

export default OrganizerLayout;
