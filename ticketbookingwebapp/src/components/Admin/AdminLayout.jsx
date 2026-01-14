import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from '../../pages/admin/Login';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, logout } = useAuth();

    useEffect(() => {
        // Body classes for AdminLTE 4 - Premium Light Theme
        if (isAuthenticated && user?.role === 'ADMIN') {
            document.body.classList.add('layout-fixed', 'sidebar-expand-lg', 'bg-light-subtle');
            document.body.style.fontFamily = '"Inter", "Source Sans 3", -apple-system, system-ui, sans-serif';
        } else {
            document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-light-subtle');
        }

        return () => {
            document.body.classList.remove('layout-fixed', 'sidebar-expand-lg', 'bg-light-subtle');
        };
    }, [isAuthenticated, user]);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    if (loading) return null;

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <AdminLogin />;
    }

    const menuItems = [
        { path: '/admin/dashboard', icon: 'bi-grid-1x2-fill', label: 'Bảng tổng quan' },
        { path: '/admin/users', icon: 'bi-people', label: 'Quản lý Người dùng' },
        { path: '/admin/events', icon: 'bi-shield-check', label: 'Phê duyệt Sự kiện' },
        { path: '/admin/orders', icon: 'bi-receipt-cutoff', label: 'Lịch sử Giao dịch' },
        { path: '/admin/venues', icon: 'bi-geo-alt', label: 'Quản lý Địa điểm' },
    ];

    return (
        <div className="app-wrapper app-premium">
            {/* Ultra-Clean Navbar */}
            <nav className="app-header navbar navbar-expand bg-white border-bottom shadow-sm py-2">
                <div className="container-fluid px-4">
                    <ul className="navbar-nav align-items-center">
                        <li className="nav-item">
                            <a className="nav-link text-slate-600" data-lte-toggle="sidebar-mini" href="#" role="button">
                                <i className="bi bi-list fs-4"></i>
                            </a>
                        </li>
                        <li className="nav-item d-none d-md-block ms-3">
                            <span className="text-slate-400 small fw-medium">Hệ thống Quản trị / {menuItems.find(i => i.path === location.pathname)?.label || 'Bảng điều khiển'}</span>
                        </li>
                    </ul>

                    <ul className="navbar-nav ms-auto align-items-center">
                        <li className="nav-item me-3">
                            <a className="nav-link text-slate-500 position-relative" href="#">
                                <i className="bi bi-bell-fill fs-5"></i>
                                <span className="position-absolute top-2 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                            </a>
                        </li>
                        <li className="nav-item dropdown user-menu ms-2">
                            <a href="#" className="nav-link dropdown-toggle d-flex align-items-center bg-slate-50 border rounded-pill px-3 py-1" data-bs-toggle="dropdown">
                                <img src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=6366f1&color=fff&bold=true`} className="user-image rounded-circle border shadow-sm" alt="User" style={{ width: '28px', height: '28px' }} />
                                <span className="d-none d-md-inline ms-2 fw-bold text-slate-700">{user?.full_name || 'Administrator'}</span>
                            </a>
                            <ul className="dropdown-menu dropdown-menu-lg dropdown-menu-end shadow-lg border-0 rounded-4 mt-2 overflow-hidden">
                                <li className="user-header bg-slate-900 text-center p-4">
                                    <img src={`https://ui-avatars.com/api/?name=${user?.full_name || 'Admin'}&background=fff&color=0f172a&bold=true`} className="rounded-circle shadow-lg mb-3" style={{ width: '70px', border: '3px solid #6366f1' }} alt="User" />
                                    <p className="text-white fw-bold mb-0 fs-5">{user?.full_name}</p>
                                    <small className="text-slate-400">System Administrator</small>
                                </li>
                                <li className="user-footer d-flex justify-content-between p-3 bg-white">
                                    <button className="btn btn-outline-slate btn-sm rounded-pill px-3">Tài khoản</button>
                                    <button onClick={handleLogout} className="btn btn-indigo btn-sm rounded-pill px-4 fw-bold">Đăng xuất</button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Slate Sidebar (Premium Look) */}
            <aside className="app-sidebar bg-slate-900 shadow-xl" data-bs-theme="dark">
                <div className="sidebar-brand py-4 px-4 border-bottom border-white border-opacity-5">
                    <Link to="/admin" className="brand-link text-decoration-none d-flex align-items-center">
                        <div className="brand-logo-container bg-indigo-500 rounded-3 d-flex align-items-center justify-content-center me-3 shadow-indigo" style={{ width: '36px', height: '36px' }}>
                            <i className="bi bi-ticket-perforated-fill text-white fs-4"></i>
                        </div>
                        <span className="brand-text fw-black text-white fs-4 tracking-tight">TICKET<span className="fw-light opacity-50">BOX</span></span>
                    </Link>
                </div>

                <div className="sidebar-wrapper px-2">
                    <nav className="mt-4">
                        <ul className="nav sidebar-menu flex-column" data-lte-toggle="treeview" role="menu">
                            <li className="nav-header px-4 small text-uppercase text-slate-500 fw-bold mb-3 mt-2" style={{ letterSpacing: '1px' }}>Menu Quản trị</li>
                            {menuItems.map((item) => (
                                <li key={item.path} className="nav-item mb-1">
                                    <Link
                                        to={item.path}
                                        className={`nav-link d-flex align-items-center py-3 px-4 rounded-3 transition-all ${location.pathname === item.path ? 'active bg-indigo-gradient shadow-indigo text-white' : 'text-slate-400 hover-slate-800'}`}
                                    >
                                        <i className={`nav-icon bi ${item.icon} me-3 fs-5`}></i>
                                        <p className="mb-0 fw-semibold fs-6">{item.label}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="sidebar-footer p-4 mt-auto">
                    <div className="bg-slate-800 bg-opacity-50 rounded-4 p-3 border border-white border-opacity-5 text-center">
                        <div className="text-slate-500 small mb-1 fw-medium uppercase">Admin Panel</div>
                        <div className="text-indigo-400 fw-bold small">v4.0.0-PRO</div>
                    </div>
                </div>
            </aside>

            {/* Content Body */}
            <main className="app-main pt-0">
                <div className="app-content-header py-5 mb-0" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
                    <div className="container-fluid px-5">
                        <div className="row align-items-center">
                            <div className="col-sm-6">
                                <h2 className="mb-1 fw-900 text-slate-800 tracking-tightest">
                                    {menuItems.find(i => i.path === location.pathname)?.label || 'Tổng quan hệ thống'}
                                </h2>
                                <p className="text-slate-500 mb-0 small fw-medium">Xin chào, quản trị viên {user?.full_name?.split(' ').pop()}! Chúc bạn làm việc hiệu quả.</p>
                            </div>
                            <div className="col-sm-6 text-sm-end mt-3 mt-sm-0">
                                <div className="btn-group shadow-sm rounded-pill overflow-hidden border">
                                    <button className="btn btn-white btn-sm px-3 fw-bold border-0">Hôm nay</button>
                                    <button className="btn btn-slate-50 btn-sm px-3 fw-bold border-0">Tuần</button>
                                    <button className="btn btn-slate-50 btn-sm px-3 fw-bold border-0">Tháng</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="app-content px-5 pt-4">
                    <div className="container-fluid px-0">
                        <Outlet />
                    </div>
                </div>
            </main>

            <footer className="app-footer py-4 text-center border-top-0 bg-transparent text-slate-400 small">
                <div className="container-fluid px-5 d-flex justify-content-between">
                    <div>© 2026 <span className="fw-bold text-slate-600">TicketBox Administration</span></div>
                    <div className="fw-medium">Made with <i className="bi bi-heart-fill text-danger mx-1"></i> for Premium Events</div>
                </div>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                :root {
                    --indigo-500: #6366f1;
                    --indigo-600: #4f46e5;
                    --slate-900: #0f172a;
                    --slate-800: #1e293b;
                    --slate-700: #334155;
                    --slate-600: #475569;
                    --slate-500: #64748b;
                    --slate-400: #94a3b8;
                    --slate-100: #f1f5f9;
                    --slate-50: #f8fafc;
                }

                .bg-slate-900 { background-color: var(--slate-900) !important; }
                .bg-slate-800 { background-color: var(--slate-800) !important; }
                .bg-light-subtle { background-color: #f8fafc !important; }
                .text-slate-800 { color: var(--slate-800) !important; }
                .text-slate-700 { color: var(--slate-700) !important; }
                .text-slate-600 { color: var(--slate-600) !important; }
                .text-slate-500 { color: var(--slate-500) !important; }
                .text-slate-400 { color: var(--slate-400) !important; }
                
                .app-premium { font-family: 'Inter', sans-serif; letter-spacing: -0.01em; }
                .fw-900 { font-weight: 900; }
                .tracking-tight { letter-spacing: -0.025em; }
                .tracking-tightest { letter-spacing: -0.05em; }
                
                .bg-indigo-500 { background-color: var(--indigo-500) !important; }
                .text-indigo-400 { color: #818cf8 !important; }
                .shadow-indigo { box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39); }
                .bg-indigo-gradient { background: linear-gradient(135deg, var(--indigo-500) 0%, var(--indigo-600) 100%) !important; }
                .hover-slate-800:hover { background-color: rgba(255, 255, 255, 0.05) !important; color: white !important; }
                .btn-indigo { background: var(--indigo-600); color: white; border: none; }
                .btn-indigo:hover { background: var(--indigo-500); color: white; transform: translateY(-1px); }
                .btn-outline-slate { border: 1px solid var(--slate-100); color: var(--slate-600); }
                .btn-white { background: white; }
                
                /* Layout overrides */
                .app-main { background-color: #f1f5f9; min-height: calc(100vh - 65px); }
                .nav-link.active i { color: white !important; }
                .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>
        </div>
    );
};

export default AdminLayout;
