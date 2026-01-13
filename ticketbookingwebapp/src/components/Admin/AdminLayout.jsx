import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Badge } from 'react-bootstrap';
import {
    FaTachometerAlt, FaUsers, FaCalendarAlt,
    FaMapMarkedAlt, FaShoppingCart, FaCogs,
    FaSignOutAlt, FaBell, FaUserShield
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Tổng quan' },
        { path: '/admin/users', icon: <FaUsers />, label: 'Người dùng' },
        { path: '/admin/events', icon: <FaCalendarAlt />, label: 'Sự kiện' },
        { path: '/admin/venues', icon: <FaMapMarkedAlt />, label: 'Địa điểm' },
        { path: '/admin/orders', icon: <FaShoppingCart />, label: 'Đơn hàng & Vé' },
        { path: '/admin/settings', icon: <FaCogs />, label: 'Cài đặt hệ thống' },
    ];

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar */}
            <div className="bg-dark text-white shadow" style={{ width: '260px', flexShrink: 0, zIndex: 1000 }}>
                <div className="p-4 border-bottom border-secondary text-center">
                    <h4 className="text-white mb-0 fw-bold d-flex align-items-center justify-content-center">
                        <FaUserShield className="me-2 text-primary" /> ADMIN CP
                    </h4>
                </div>
                <div className="py-4">
                    <Nav className="flex-column nav-pills px-3">
                        {menuItems.map((item) => (
                            <Nav.Link
                                key={item.path}
                                as={Link}
                                to={item.path}
                                active={location.pathname === item.path}
                                className={`mb-2 d-flex align-items-center py-2 px-3 rounded-3 transition-all ${location.pathname === item.path ? 'bg-primary text-white shadow-sm' : 'text-light opacity-75 hover-bg-secondary'
                                    }`}
                            >
                                <span className="me-3">{item.icon}</span>
                                {item.label}
                            </Nav.Link>
                        ))}
                    </Nav>
                </div>
                <div className="mt-auto p-4 border-top border-secondary">
                    <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center">
                        <FaSignOutAlt className="me-2" /> Đăng xuất
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column" style={{ overflowX: 'hidden' }}>
                <Navbar bg="white" className="shadow-sm px-4 py-2 border-bottom sticky-top">
                    <div className="container-fluid justify-content-end">
                        <div className="d-flex align-items-center">
                            <div className="me-4 position-relative cursor-pointer">
                                <FaBell className="text-secondary fs-5" />
                                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle p-1 border border-white" style={{ fontSize: '8px' }}>
                                    3
                                </Badge>
                            </div>
                            <div className="d-flex align-items-center border-start ps-4">
                                <div className="text-end me-3 d-none d-md-block">
                                    <div className="fw-bold text-dark small">{user?.full_name || 'Quản Trị Viên'}</div>
                                    <div className="text-muted" style={{ fontSize: '11px' }}>{user?.role === 'ADMIN' ? 'Hệ thống cấp cao' : 'Nhân viên'}</div>
                                </div>
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '40px', height: '40px' }}>
                                    {String(user?.full_name || 'A').charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </Navbar>
                <Container fluid className="p-4">
                    <Outlet />
                </Container>
            </div>
        </div>
    );
};

export default AdminLayout;
