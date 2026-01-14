import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge, Button, Spinner } from 'react-bootstrap';
import {
    FaCalendarAlt, FaMoneyBillWave, FaTicketAlt,
    FaChartLine, FaArrowRight, FaSync
} from 'react-icons/fa';
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
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Đang chuẩn bị dữ liệu thống kê...</p>
        </div>
    );

    return (
        <div className="pb-5">
            {/* Action Header */}
            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-between align-items-center">
                    <h5 className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-0">Tổng quan hiệu suất</h5>
                    <Button variant="outline-success" size="sm" className="rounded-pill px-3" onClick={fetchStats}>
                        <FaSync className="me-2" /> LÀM MỚI
                    </Button>
                </div>
            </div>

            {/* Small Boxes - Organizer Style */}
            <Row className="g-4 mb-5">
                <Col lg={4} md={6}>
                    <div className="small-box bg-success shadow-sm h-100 rounded-4 overflow-hidden position-relative border border-white border-opacity-5">
                        <div className="inner p-4">
                            <h2 className="fw-black text-white mb-1">{stats.totalEvents}</h2>
                            <p className="text-white opacity-75 mb-0">Sự kiện đang quản lý</p>
                        </div>
                        <div className="icon position-absolute top-0 end-0 p-4 opacity-25">
                            <FaCalendarAlt size={60} className="text-white" />
                        </div>
                        <Link to="/organizer/events" className="small-box-footer bg-black bg-opacity-20 text-center py-2 text-decoration-none text-white d-block small">
                            Xem chi tiết <FaArrowRight className="ms-1" />
                        </Link>
                    </div>
                </Col>
                <Col lg={4} md={6}>
                    <div className="small-box bg-dark shadow-sm h-100 rounded-4 overflow-hidden position-relative border border-white border-opacity-5">
                        <div className="inner p-4">
                            <h2 className="fw-black text-success mb-1">{formatCurrency(stats.totalRevenue).slice(0, -2)}</h2>
                            <p className="text-muted mb-0">Tổng doanh thu (VNĐ)</p>
                        </div>
                        <div className="icon position-absolute top-0 end-0 p-4 opacity-10">
                            <FaMoneyBillWave size={60} className="text-success" />
                        </div>
                        <a href="#" className="small-box-footer bg-white bg-opacity-5 text-center py-2 text-decoration-none text-muted d-block small">
                            Báo cáo tài chính <FaArrowRight className="ms-1" />
                        </a>
                    </div>
                </Col>
                <Col lg={4} md={12}>
                    <div className="small-box bg-primary shadow-sm h-100 rounded-4 overflow-hidden position-relative border border-white border-opacity-5">
                        <div className="inner p-4">
                            <h2 className="fw-black text-white mb-1">{stats.totalTicketsSold.toLocaleString()}</h2>
                            <p className="text-white opacity-75 mb-0">Vé đã được đặt thành công</p>
                        </div>
                        <div className="icon position-absolute top-0 end-0 p-4 opacity-25">
                            <FaTicketAlt size={60} className="text-white" />
                        </div>
                        <Link to="/organizer/events" className="small-box-footer bg-black bg-opacity-20 text-center py-2 text-decoration-none text-white d-block small">
                            Thống kê vé <FaArrowRight className="ms-1" />
                        </Link>
                    </div>
                </Col>
            </Row>

            {/* Recent Orders Table */}
            <div className="card content-card border-0 shadow-lg mb-0 animate-fade-in">
                <div className="card-header border-bottom border-white border-opacity-5 py-4 px-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0 fw-bold text-white">Giao dịch gần nhất</h5>
                        <small className="text-muted">Các đơn hàng vừa được thanh toán trên hệ thống</small>
                    </div>
                    <FaChartLine className="text-success opacity-50" size={24} />
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <Table hover className="organizer-table mb-0 align-middle">
                            <thead>
                                <tr>
                                    <th className="px-4">Mã Đơn</th>
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
                                        <td className="px-4">
                                            <code className="text-success fw-bold">{order.order_code}</code>
                                        </td>
                                        <td>
                                            <div className="text-white fw-semibold small">{order.customer_name}</div>
                                            <div className="text-muted" style={{ fontSize: '10px' }}>{order.customer_email}</div>
                                        </td>
                                        <td>
                                            <div className="text-truncate small text-muted" style={{ maxWidth: '200px' }}>
                                                {order.event_name}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-white fw-bold small">{formatCurrency(order.total_amount)}</span>
                                        </td>
                                        <td>
                                            <Badge bg={order.payment_method === 'VNPAY' ? 'info' : 'secondary'} className="rounded-pill px-2 py-1" style={{ fontSize: '10px' }}>
                                                {order.payment_method}
                                            </Badge>
                                        </td>
                                        <td>
                                            <span className="text-muted small">{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted fst-italic">
                                            Chưa có giao dịch nào được ghi nhận
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            <style>{`
                .fw-black { font-weight: 900; }
                .letter-spacing-1 { letter-spacing: 1px; }
                .small-box .icon { transition: all 0.3s ease; }
                .small-box:hover .icon { transform: scale(1.1); }
            `}</style>
        </div>
    );
};

export default Dashboard;
