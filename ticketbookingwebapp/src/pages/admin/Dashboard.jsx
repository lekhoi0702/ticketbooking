import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import {
    FaUsers, FaCalendarAlt, FaMoneyBillWave,
    FaTicketAlt, FaArrowUp
} from 'react-icons/fa';
import { api } from '../../services/api';

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
                // Lấy 5 sự kiện gần nhất
                setRecentEvents(eventsRes.data.slice(0, 5));
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
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Đang tải dữ liệu thực tế...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">Hệ thống Tổng quan</h3>
                <Button variant="primary" onClick={fetchData} className="shadow-sm">Làm mới dữ liệu</Button>
            </div>

            {/* Quick Stats */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                        <Card.Body className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 p-3 rounded-4 me-3">
                                <FaUsers className="text-primary fs-3" />
                            </div>
                            <div>
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '12px' }}>Người dùng</small>
                                <h4 className="fw-bold mb-0">{stats.total_users.toLocaleString()}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                        <Card.Body className="d-flex align-items-center">
                            <div className="bg-success bg-opacity-10 p-3 rounded-4 me-3">
                                <FaCalendarAlt className="text-success fs-3" />
                            </div>
                            <div>
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '12px' }}>Sự kiện</small>
                                <h4 className="fw-bold mb-0">{stats.total_events}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                        <Card.Body className="d-flex align-items-center">
                            <div className="bg-info bg-opacity-10 p-3 rounded-4 me-3">
                                <FaMoneyBillWave className="text-info fs-3" />
                            </div>
                            <div>
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '12px' }}>Doanh thu</small>
                                <h4 className="fw-bold mb-0">{formatCurrency(stats.total_revenue)}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm rounded-4 h-100 p-2">
                        <Card.Body className="d-flex align-items-center">
                            <div className="bg-warning bg-opacity-10 p-3 rounded-4 me-3">
                                <FaTicketAlt className="text-warning fs-3" />
                            </div>
                            <div>
                                <small className="text-muted fw-bold text-uppercase" style={{ fontSize: '12px' }}>Vé đã bán</small>
                                <h4 className="fw-bold mb-0">{stats.total_tickets_sold.toLocaleString()}</h4>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col lg={12}>
                    <Card className="border-0 shadow-sm rounded-4">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold">Duyệt sự kiện gần đây</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="px-4">Sự kiện</th>
                                        <th>Người tổ chức</th>
                                        <th>Trạng thái</th>
                                        <th>Thời gian bắt đầu</th>
                                        <th className="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEvents.length > 0 ? recentEvents.map(event => (
                                        <tr key={event.event_id}>
                                            <td className="px-4 fw-bold">{event.event_name}</td>
                                            <td className="text-muted">{event.organizer_name}</td>
                                            <td>
                                                <Badge bg={
                                                    event.status === 'PUBLISHED' ? 'success' :
                                                        event.status === 'PENDING' ? 'warning' : 'danger'
                                                }>
                                                    {event.status === 'PUBLISHED' ? 'APPROVED' : event.status}
                                                </Badge>
                                            </td>
                                            <td>{new Date(event.start_datetime).toLocaleDateString()}</td>
                                            <td className="text-center">
                                                <Button size="sm" variant="outline-primary">Xem chi tiết</Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center py-4 text-muted">Chưa có sự kiện nào</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;
