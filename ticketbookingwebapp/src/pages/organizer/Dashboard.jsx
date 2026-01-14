import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalRevenue: 0,
        totalTicketsSold: 0,
        recentOrders: []
    });

    useEffect(() => {
        if (user?.user_id) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.getDashboardStats(user.user_id);
            if (res.success) {
                setStats({
                    totalEvents: res.data.total_events,
                    totalRevenue: res.data.total_revenue,
                    totalTicketsSold: res.data.total_tickets_sold,
                    recentOrders: res.data.recent_orders
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return (
        <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
                <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-3">Đang chuẩn bị dữ liệu...</p>
        </div>
    );

    return (
        <div>
            {/* Small boxes (Stat box) */}
            <div className="row">
                <div className="col-lg-4 col-6">
                    <div className="small-box bg-success">
                        <div className="inner">
                            <h3>{stats.totalEvents}</h3>
                            <p>Sự kiện đang quản lý</p>
                        </div>
                        <div className="icon">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <Link to="/organizer/events" className="small-box-footer">
                            Xem chi tiết <i className="fas fa-arrow-circle-right"></i>
                        </Link>
                    </div>
                </div>

                <div className="col-lg-4 col-6">
                    <div className="small-box bg-info">
                        <div className="inner">
                            <h3>{formatCurrency(stats.totalRevenue).slice(0, -2)}</h3>
                            <p>Tổng doanh thu (VNĐ)</p>
                        </div>
                        <div className="icon">
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                        <a href="#" className="small-box-footer">
                            Báo cáo tài chính <i className="fas fa-arrow-circle-right"></i>
                        </a>
                    </div>
                </div>

                <div className="col-lg-4 col-12">
                    <div className="small-box bg-warning">
                        <div className="inner">
                            <h3>{stats.totalTicketsSold.toLocaleString()}</h3>
                            <p>Vé đã được đặt</p>
                        </div>
                        <div className="icon">
                            <i className="fas fa-ticket-alt"></i>
                        </div>
                        <Link to="/organizer/events" className="small-box-footer">
                            Thống kê vé <i className="fas fa-arrow-circle-right"></i>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-chart-line mr-2"></i>
                                Giao dịch gần nhất
                            </h3>
                            <div className="card-tools">
                                <button type="button" className="btn btn-sm btn-tool" onClick={fetchStats}>
                                    <i className="fas fa-sync-alt"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body table-responsive p-0">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Khách Hàng</th>
                                        <th>Sự Kiện</th>
                                        <th>Tổng Tiền</th>
                                        <th>Thanh Toán</th>
                                        <th>Ngày</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.length > 0 ? stats.recentOrders.map(order => (
                                        <tr key={order.order_id}>
                                            <td>
                                                <code className="text-success">{order.order_code}</code>
                                            </td>
                                            <td>
                                                <strong>{order.customer_name}</strong>
                                                <br />
                                                <small className="text-muted">{order.customer_email}</small>
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                                    {order.event_name}
                                                </div>
                                            </td>
                                            <td>
                                                <strong className="text-success">{formatCurrency(order.total_amount)}</strong>
                                            </td>
                                            <td>
                                                <span className={`badge ${order.payment_method === 'VNPAY' ? 'badge-info' : 'badge-secondary'}`}>
                                                    {order.payment_method}
                                                </span>
                                            </td>
                                            <td>
                                                <i className="far fa-calendar mr-1"></i>
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                <i className="fas fa-inbox fa-2x mb-2 d-block text-muted"></i>
                                                Chưa có giao dịch nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
