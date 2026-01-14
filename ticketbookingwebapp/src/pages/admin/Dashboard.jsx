import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Table, Badge } from 'react-bootstrap';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total_users: 0,
        total_events: 0,
        total_revenue: 0,
        total_tickets_sold: 0
    });
    const [recentEvents, setRecentEvents] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, eventsRes] = await Promise.all([
                api.getAdminStats(),
                api.getAllAdminEvents()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (eventsRes.success) {
                setRecentEvents(eventsRes.data.slice(0, 10));
            }
        } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) {
        return (
            <div className="text-center py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" variant="indigo" style={{ color: '#6366f1' }} />
                <p className="mt-3 text-slate-500 fw-bold">Đang kiến tạo dữ liệu tổng quan...</p>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Người dùng',
            value: stats.total_users.toLocaleString(),
            icon: 'bi-people-fill',
            color: '#6366f1',
            bg: '#eef2ff',
            link: '/admin/users'
        },
        {
            label: 'Sự kiện hệ thống',
            value: stats.total_events,
            icon: 'bi-calendar-event-fill',
            color: '#10b981',
            bg: '#ecfdf5',
            link: '/admin/events'
        },
        {
            label: 'Vé đã bán',
            value: stats.total_tickets_sold.toLocaleString(),
            icon: 'bi-ticket-perforated-fill',
            color: '#f59e0b',
            bg: '#fffbeb',
            link: '/admin/orders'
        },
        {
            label: 'Doanh thu tổng',
            value: formatCurrency(stats.total_revenue).replace('₫', 'VNĐ'),
            icon: 'bi-lightning-charge-fill',
            color: '#ef4444',
            bg: '#fef2f2',
            link: '#'
        }
    ];

    return (
        <div className="animate-fade-in dashboard-premium">
            {/* Premium Stat Cards */}
            <Row className="g-4 mb-5">
                {statCards.map((card, idx) => (
                    <Col lg={3} md={6} key={idx}>
                        <div className="stat-card-modern bg-white rounded-4 p-4 shadow-sm border-0 position-relative overflow-hidden transition-all h-100">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="stat-icon-box rounded-3 d-flex align-items-center justify-content-center shadow-xs" style={{ backgroundColor: card.bg, color: card.color, width: '48px', height: '48px' }}>
                                    <i className={`bi ${card.icon} fs-4`}></i>
                                </div>
                                <div className="stat-trend d-flex align-items-center text-success small fw-bold">
                                    <i className="bi bi-graph-up-arrow me-1"></i> +12%
                                </div>
                            </div>
                            <div className="stat-content">
                                <h3 className="fw-900 text-slate-800 mb-1">{card.value}</h3>
                                <p className="text-slate-400 small fw-bold text-uppercase mb-0" style={{ letterSpacing: '0.5px' }}>{card.label}</p>
                            </div>
                            <div className="stat-decoration position-absolute top-0 end-0 p-3 opacity-05">
                                <i className={`bi ${card.icon}`} style={{ fontSize: '80px', color: card.color }}></i>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Main Content Grid */}
            <Row className="g-4">
                <Col lg={12}>
                    <div className="card-modern bg-white rounded-4 shadow-sm border-0 overflow-hidden">
                        <div className="card-header-modern p-4 d-flex justify-content-between align-items-center border-bottom border-slate-50">
                            <div>
                                <h5 className="fw-bold text-slate-800 mb-1">Dòng chảy Sự kiện</h5>
                                <p className="text-slate-400 small mb-0 fw-medium">Theo dõi và phê duyệt các sự kiện mới nhất từ đối tác</p>
                            </div>
                            <button className="btn btn-slate-50 btn-sm rounded-pill px-3 fw-bold text-slate-600 border" onClick={fetchData}>
                                <i className="bi bi-arrow-clockwise me-1"></i> Làm mới dữ liệu
                            </button>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0 custom-table-premium">
                                    <thead className="bg-slate-50">
                                        <tr className="small text-slate-400 text-uppercase fw-bold">
                                            <th className="px-4 py-3 border-0">Thông tin Sự kiện</th>
                                            <th className="py-3 border-0">Đối tác</th>
                                            <th className="py-3 border-0">Mức độ phổ biến</th>
                                            <th className="py-3 border-0">Trạng thái</th>
                                            <th className="py-3 border-0 text-center">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentEvents && recentEvents.length > 0 ? recentEvents.map(event => (
                                            <tr key={event.event_id}>
                                                <td className="px-4 py-4">
                                                    <div className="d-flex align-items-center">
                                                        <div className="event-thumb me-3 rounded-3 overflow-hidden shadow-xs" style={{ width: '45px', height: '45px', background: '#f1f5f9' }}>
                                                            <img
                                                                src={event.banner_image_url?.startsWith('http') ? event.banner_image_url : `http://127.0.0.1:5000${event.banner_image_url}`}
                                                                className="w-100 h-100 object-fit-cover"
                                                                alt="thumb"
                                                                onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Event&background=6366f1&color=fff'}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-slate-700 fs-6">{event.event_name}</div>
                                                            <div className="text-slate-400 small fw-medium">{event.category?.category_name} • {new Date(event.start_datetime).toLocaleDateString('vi-VN')}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-slate-600 small">{event.organizer_name}</div>
                                                    <div className="text-indigo-500 fw-bold" style={{ fontSize: '10px' }}>VIP PARTNER</div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="progress rounded-pill flex-grow-1 me-2" style={{ height: '6px', width: '80px', backgroundColor: '#f1f5f9' }}>
                                                            <div className="progress-bar bg-indigo-500 rounded-pill" style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}></div>
                                                        </div>
                                                        <span className="text-slate-400 fw-bold" style={{ fontSize: '11px' }}>High</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {event.status === 'PUBLISHED' ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-pill fw-bold border-0" style={{ fontSize: '10px' }}>
                                                            <i className="bi bi-check-circle-fill me-1"></i> CÔNG KHAI
                                                        </Badge>
                                                    ) : event.status === 'PENDING_APPROVAL' ? (
                                                        <Badge className="bg-amber-100 text-amber-700 px-3 py-2 rounded-pill fw-bold border-0" style={{ fontSize: '10px' }}>
                                                            <i className="bi bi-hourglass-split me-1"></i> CHỜ DUYỆT
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-100 text-slate-600 px-3 py-2 rounded-pill fw-bold border-0" style={{ fontSize: '10px' }}>
                                                            {event.status}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <Link to="/admin/events" className="btn btn-indigo-soft btn-sm rounded-pill px-4 fw-bold">QUẢN LÝ</Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="text-center py-5 text-slate-400 fst-italic">Hệ thống đang yên ắng</td></tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                        <div className="card-footer bg-slate-50 border-0 py-3 text-center">
                            <Link to="/admin/events" className="text-indigo-600 fw-bold text-decoration-none small hover-underline">
                                Xem tất cả 124 sự kiện hiện có <i className="bi bi-arrow-right ms-1"></i>
                            </Link>
                        </div>
                    </div>
                </Col>
            </Row>

            <style>{`
                .fw-900 { font-weight: 900; }
                .bg-slate-50 { background-color: #f8fafc !important; }
                .text-slate-800 { color: #1e293b !important; }
                .text-slate-700 { color: #334155 !important; }
                .text-slate-600 { color: #475569 !important; }
                .text-slate-400 { color: #94a3b8 !important; }
                .text-indigo-500 { color: #6366f1 !important; }
                .text-indigo-600 { color: #4f46e5 !important; }
                .bg-indigo-500 { background-color: #6366f1 !important; }
                
                .bg-emerald-100 { background-color: #ecfdf5 !important; }
                .text-emerald-700 { color: #047857 !important; }
                .bg-amber-100 { background-color: #fffbeb !important; }
                .text-amber-700 { color: #b45309 !important; }
                
                .stat-card-modern { border: 1px solid #f1f5f9 !important; }
                .stat-card-modern:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05) !important; }
                .opacity-05 { opacity: 0.05; }
                .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                
                .custom-table-premium thead th { border-bottom: 1px solid #f1f5f9 !important; }
                .custom-table-premium tbody tr { transition: all 0.2s; }
                .custom-table-premium tbody tr:hover { background-color: #f8fafc !important; }
                .event-thumb { border: 1px solid #f1f5f9; }
                
                .btn-indigo-soft { background-color: #eef2ff; color: #6366f1; border: none; }
                .btn-indigo-soft:hover { background-color: #6366f1; color: white; }
                .hover-underline:hover { text-decoration: underline !important; }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
