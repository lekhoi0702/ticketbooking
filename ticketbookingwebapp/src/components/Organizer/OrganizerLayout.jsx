import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaTachometerAlt, FaCalendarPlus, FaList,
    FaUserCog, FaSignOutAlt, FaUser, FaBars,
    FaBell, FaSearch
} from 'react-icons/fa';
import './OrganizerDashboard.css';

const OrganizerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        // Apply AdminLTE classes for Organizer (dark theme)
        document.body.classList.add('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
        document.body.setAttribute('data-bs-theme', 'dark');

        return () => {
            document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-body-tertiary');
            document.body.removeAttribute('data-bs-theme');
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/organizer/dashboard', icon: <FaTachometerAlt />, label: 'Bảng điều khiển' },
        { path: '/organizer/events', icon: <FaList />, label: 'Quản lý sự kiện' },
        { path: '/organizer/create-event', icon: <FaCalendarPlus />, label: 'Tạo sự kiện mới' },
        { path: '/organizer/profile', icon: <FaUserCog />, label: 'Cài đặt tài khoản' },
    ];

    return (
        <div className="app-wrapper organizer-layout shadow-lg">
            {/* Header */}
            <nav className="app-header navbar navbar-expand">
                <div className="container-fluid">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link text-white" data-lte-toggle="sidebar-full" href="#" role="button">
                                <FaBars />
                            </a>
                        </li>
                    </ul>

                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item dropdown">
                            <a className="nav-link text-white" href="#" data-bs-toggle="dropdown">
                                <FaSearch />
                            </a>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link text-white position-relative" href="#" data-bs-toggle="dropdown">
                                <FaBell />
                                <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '8px' }}>
                                    2
                                </span>
                            </a>
                        </li>

                        <li className="nav-item dropdown user-menu">
                            <a href="#" className="nav-link dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
                                <div className="bg-success rounded-circle me-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                    <FaUser size={14} className="text-white" />
                                </div>
                                <span className="d-none d-md-inline text-white fw-bold">{user?.full_name || 'Nhà tổ chức'}</span>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end border-0 shadow-lg">
                                <li className="user-header bg-dark text-center p-4">
                                    <div className="bg-success rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '60px', height: '60px' }}>
                                        <FaUser size={30} className="text-white" />
                                    </div>
                                    <p className="text-white fw-bold mb-0">
                                        {user?.full_name}
                                        <small className="d-block text-muted mt-1">Professional Organizer</small>
                                    </p>
                                </li>
                                <li className="user-footer bg-secondary bg-opacity-10 d-flex justify-content-between p-3">
                                    <Link to="/organizer/profile" className="btn btn-outline-light btn-sm rounded-pill px-3">Hồ sơ</Link>
                                    <button onClick={handleLogout} className="btn btn-danger btn-sm rounded-pill px-3">Đăng xuất</button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Sidebar */}
            <aside className="app-sidebar shadow-lg">
                <div className="sidebar-brand">
                    <Link to="/organizer/dashboard" className="brand-link text-center w-100 py-4">
                        <span className="brand-text fw-black sidebar-logo">TICKETBOX</span>
                        <div className="text-muted small mt-1" style={{ fontSize: '9px', letterSpacing: '2px' }}>ORGANIZER PANEL</div>
                    </Link>
                </div>

                <div className="sidebar-wrapper mt-3">
                    <nav>
                        <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu">
                            {menuItems.map(item => (
                                <li key={item.path} className="nav-item px-3 mb-1">
                                    <Link
                                        to={item.path}
                                        className={`nav-link d-flex align-items-center rounded-3 py-3 ${location.pathname === item.path ? 'active' : 'text-muted'}`}
                                    >
                                        <i className="nav-icon me-3">{item.icon}</i>
                                        <p className="mb-0 fw-500">{item.label}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="sidebar-footer p-4 mt-auto border-top border-secondary border-opacity-10">
                    <div className="bg-success bg-opacity-5 rounded-4 p-3 border border-success border-opacity-10 text-center">
                        <div className="small text-muted mb-1">Hệ thống đối tác</div>
                        <div className="fw-bold text-success small">Verified Partner</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="app-main pt-4">
                <div className="app-content-header py-3 mb-4">
                    <div className="container-fluid px-4">
                        <div className="row">
                            <div className="col-sm-6">
                                <h3 className="mb-0 fw-bold animate-fade-in">
                                    {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                                </h3>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-end mb-0 px-0 bg-transparent small">
                                    <li className="breadcrumb-item"><Link to="/organizer">TCB</Link></li>
                                    <li className="breadcrumb-item active">
                                        {menuItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="app-content px-4">
                    <div className="container-fluid px-4">
                        <div className="animate-fade-in">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="app-footer py-3 text-center border-top border-secondary border-opacity-10">
                <div className="small text-muted">
                    <strong>Copyright &copy; 2026 <span className="text-success">TicketBox</span>.</strong> All rights reserved.
                </div>
            </footer>

            <style>{`
                .fw-black { font-weight: 900; }
                .fw-500 { font-weight: 500; }
                .sidebar-logo { color: var(--accent-green) !important; letter-spacing: -1px; }
            `}</style>
        </div>
    );
};

export default OrganizerLayout;
