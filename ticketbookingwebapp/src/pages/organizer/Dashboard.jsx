import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Spinner, Alert } from 'react-bootstrap';
import { FaTicketAlt, FaDollarSign, FaCalendarCheck } from 'react-icons/fa';
import { api } from '../../services/api';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_tickets_sold: 0,
        ongoing_events: 0,
        recent_orders: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.getDashboardStats();

            if (response.success) {
                setStats(response.data);
            } else {
                setError(response.message || 'Không thể tải dữ liệu');
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PAID': { bg: 'success', text: 'Hoàn Thành' },
            'PENDING': { bg: 'warning', text: 'Chờ Xử Lý' },
            'CANCELLED': { bg: 'danger', text: 'Đã Hủy' },
            'REFUNDED': { bg: 'secondary', text: 'Đã Hoàn Tiền' }
        };
        const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
        return (
            <span className={`badge bg-${statusInfo.bg} rounded-pill px-3`}>
                {statusInfo.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Lỗi!</Alert.Heading>
                <p>{error}</p>
            </Alert>
        );
    }

    return (
        <div>
            <h2 className="mb-4 text-dark fw-bold">Tổng Quan Hệ Thống</h2>
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                <FaDollarSign className="text-primary h3 mb-0" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1 text-uppercase small fw-bold">Tổng Doanh Thu</h6>
                                <h3 className="mb-0 fw-bold">{formatCurrency(stats.total_revenue)}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                <FaTicketAlt className="text-success h3 mb-0" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1 text-uppercase small fw-bold">Vé Đã Bán</h6>
                                <h3 className="mb-0 fw-bold">{stats.total_tickets_sold}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm mb-3">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                                <FaCalendarCheck className="text-warning h3 mb-0" />
                            </div>
                            <div>
                                <h6 className="text-muted mb-1 text-uppercase small fw-bold">Sự Kiện Đang Chạy</h6>
                                <h3 className="mb-0 fw-bold">{stats.ongoing_events}</h3>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-bottom-0">
                    <h5 className="mb-0 fw-bold">Đơn Hàng Mới Nhất</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {stats.recent_orders && stats.recent_orders.length > 0 ? (
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Mã Đơn</th>
                                    <th>Sự Kiện</th>
                                    <th>Khách Hàng</th>
                                    <th>Ngày Đặt</th>
                                    <th>Thành Tiền</th>
                                    <th className="pe-4">Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_orders.map((order) => (
                                    <tr key={order.order_id}>
                                        <td className="ps-4 fw-medium">{order.order_code}</td>
                                        <td>{order.event_name}</td>
                                        <td>{order.customer_name || 'N/A'}</td>
                                        <td>{formatDate(order.created_at)}</td>
                                        <td>{formatCurrency(order.total_amount)}</td>
                                        <td className="pe-4">{getStatusBadge(order.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <p>Chưa có đơn hàng nào</p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Dashboard;
