import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../assets/adminlte-custom.css';

const OrganizerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        document.body.className = 'hold-transition sidebar-mini layout-fixed organizer-theme';

        return () => {
            document.body.className = '';
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/organizer/dashboard', icon: 'fas fa-tachometer-alt', label: 'Bảng điều khiển' },
        { path: '/organizer/events', icon: 'fas fa-list', label: 'Quản lý sự kiện' },
        { path: '/organizer/create-event', icon: 'fas fa-calendar-plus', label: 'Tạo sự kiện mới' },
        { path: '/organizer/profile', icon: 'fas fa-user-cog', label: 'Cài đặt tài khoản' },
    ];

    return (
        <div className="wrapper">
            {/* Navbar */}
            <nav className="main-header navbar navbar-expand navbar-white navbar-light">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="pushmenu" href="#" role="button">
                            <i className="fas fa-bars"></i>
                        </a>
                    </li>
                    <li className="nav-item d-none d-sm-inline-block">
                        <Link to="/organizer/dashboard" className="nav-link">Trang chủ</Link>
                    </li>
                </ul>

                <ul className="navbar-nav ml-auto">
                    <li className="nav-item">
                        <a className="nav-link" data-widget="navbar-search" href="#" role="button">
                            <i className="fas fa-search"></i>
                        </a>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link" data-toggle="dropdown" href="#">
                            <i className="far fa-bell"></i>
                            <span className="badge badge-success navbar-badge">2</span>
                        </a>
                        <div className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                            <span className="dropdown-item dropdown-header">2 Thông báo</span>
                            <div className="dropdown-divider"></div>
                            <a href="#" className="dropdown-item">
                                <i className="fas fa-ticket-alt mr-2 text-success"></i> Vé mới được đặt
                                <span className="float-right text-muted text-sm">5 phút</span>
                            </a>
                            <div className="dropdown-divider"></div>
                            <a href="#" className="dropdown-item dropdown-footer">Xem tất cả</a>
                        </div>
                    </li>
                    <li className="nav-item dropdown user-menu">
                        <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Organizer'}&background=10b981&color=fff`}
                                className="user-image img-circle elevation-2"
                                alt="User"
                            />
                            <span className="d-none d-md-inline">{user?.full_name || 'Nhà tổ chức'}</span>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                            <li className="user-header bg-success">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Organizer'}&background=fff&color=10b981`}
                                    className="img-circle elevation-2"
                                    alt="User"
                                />
                                <p>
                                    {user?.full_name}
                                    <small>Professional Organizer</small>
                                </p>
                            </li>
                            <li className="user-footer">
                                <Link to="/organizer/profile" className="btn btn-default btn-flat">Hồ sơ</Link>
                                <button onClick={handleLogout} className="btn btn-default btn-flat float-right">Đăng xuất</button>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>

            {/* Main Sidebar */}
            <aside className="main-sidebar sidebar-light-success elevation-4">
                <Link to="/organizer/dashboard" className="brand-link">
                    <i className="fas fa-ticket-alt brand-image" style={{ fontSize: '2rem', marginLeft: '0.5rem', color: '#10b981' }}></i>
                    <span className="brand-text font-weight-light">TicketBox Organizer</span>
                </Link>

                <div className="sidebar">
                    <div className="user-panel mt-3 pb-3 mb-3 d-flex">
                        <div className="image">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Organizer'}&background=10b981&color=fff`}
                                className="img-circle elevation-2"
                                alt="User"
                            />
                        </div>
                        <div className="info">
                            <Link to="#" className="d-block">{user?.full_name || 'Nhà tổ chức'}</Link>
                        </div>
                    </div>

                    <nav className="mt-2">
                        <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                            <li className="nav-header">MENU CHÍNH</li>
                            {menuItems.map(item => (
                                <li key={item.path} className="nav-item">
                                    <Link
                                        to={item.path}
                                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    >
                                        <i className={`nav-icon ${item.icon}`}></i>
                                        <p>{item.label}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Content Wrapper */}
            <div className="content-wrapper">
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">
                                    {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                                </h1>
                            </div>
                            <div className="col-sm-6">
                                <ol className="breadcrumb float-sm-right">
                                    <li className="breadcrumb-item"><Link to="/organizer/dashboard">TCB</Link></li>
                                    <li className="breadcrumb-item active">
                                        {menuItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="content">
                    <div className="container-fluid">
                        <Outlet />
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="main-footer">
                <strong>Copyright &copy; 2026 <a href="#" className="text-success">TicketBox</a>.</strong>
                All rights reserved.
                <div className="float-right d-none d-sm-inline-block">
                    <b>Organizer Panel</b>
                </div>
            </footer>
        </div>
    );
};

export default OrganizerLayout;
