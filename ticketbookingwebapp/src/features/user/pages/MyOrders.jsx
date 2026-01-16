import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FaTicketAlt, FaHistory, FaEye, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { api } from '@services/api';
import { formatCurrency } from '@shared/utils/eventUtils';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import './MyOrders.css';

const MyOrders = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchUserOrders();
    }, [isAuthenticated]);

    const fetchUserOrders = async () => {
        try {
            setLoading(true);
            const res = await api.getUserOrders(user?.user_id || 0);
            if (res.success) {
                setOrders(res.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statuses = {
            'PAID': { bg: 'success', text: 'Đã thanh toán' },
            'PENDING': { bg: 'warning', text: 'Chờ thanh toán' },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy' },
            'COMPLETED': { bg: 'primary', text: 'Hoàn thành' },
            'CANCELLATION_PENDING': { bg: 'info', text: 'Chờ duyệt hủy' }
        };
        const s = statuses[status] || { bg: 'secondary', text: status };
        return <Badge bg={s.bg} className="px-3 py-2 lh-1 rounded-pill">{s.text}</Badge>;
    };

    const handleCancelOrder = async (orderId, orderStatus) => {
        Modal.confirm({
            title: orderStatus === 'PAID' ? 'Xác nhận yêu cầu hoàn tiền' : 'Xác nhận hủy đơn hàng',
            icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
            content: orderStatus === 'PAID'
                ? 'Bạn có chắc chắn muốn gửi yêu cầu hoàn tiền cho đơn hàng này không? Quá trình duyệt có thể mất một ít thời gian.'
                : 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
            okText: orderStatus === 'PAID' ? 'Yêu cầu hoàn tiền' : 'Hủy đơn hàng',
            cancelText: 'Đóng',
            okButtonProps: {
                danger: true,
                size: 'large'
            },
            cancelButtonProps: {
                size: 'large'
            },
            centered: true,
            onOk: async () => {
                try {
                    const hide = message.loading('Đang xử lý yêu cầu...', 0);
                    const res = await api.cancelOrder(orderId);
                    hide();

                    if (res.success) {
                        message.success({
                            content: orderStatus === 'PAID'
                                ? 'Đã gửi yêu cầu hoàn tiền thành công! Chúng tôi sẽ xử lý trong thời gian sớm nhất.'
                                : 'Đã hủy đơn hàng thành công!',
                            duration: 4,
                            style: {
                                marginTop: '20vh',
                            }
                        });
                        fetchUserOrders();
                    } else {
                        message.error({
                            content: res.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.',
                            duration: 4,
                            style: {
                                marginTop: '20vh',
                            }
                        });
                    }
                } catch (err) {
                    message.error({
                        content: err.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.',
                        duration: 4,
                        style: {
                            marginTop: '20vh',
                        }
                    });
                }
            }
        });
    };


    if (loading) {
        return <LoadingSpinner tip="Đang tải lịch sử đặt vé..." />;
    }

    return (
        <div className="my-orders-page">
            <Container className="py-5">
                <div className="d-flex align-items-center mb-4 orders-page-header">
                    <div className="orders-header-icon">
                        <FaHistory className="text-white fs-4" />
                    </div>
                    <div>
                        <h2 className="orders-page-title">Vé đã mua</h2>
                        <p className="orders-page-subtitle">Quản lý các đơn hàng và vé điện tử của bạn</p>
                    </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                {orders.length === 0 ? (
                    <Card className="border-0 shadow-sm rounded-4 text-center py-5 empty-orders-card">
                        <Card.Body>
                            <FaTicketAlt className="empty-orders-icon mb-3 opacity-25" size={80} />
                            <h4>Bạn chưa có đơn hàng nào</h4>
                            <p className="text-muted">Hãy khám phá các sự kiện hấp dẫn và đặt vé ngay!</p>
                            <Link to="/" className="btn btn-success px-4 mt-2 shadow-sm">Khám phá ngay</Link>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row>
                        {orders.map((order) => (
                            <Col lg={12} key={order.order_id} className="mb-4">
                                <Card className="border-0 shadow-sm rounded-4 overflow-hidden order-card transition-all">
                                    <Card.Body className="p-0">
                                        <Row className="g-0">
                                            <Col md={3} className="bg-light d-flex flex-column justify-content-center align-items-center p-4 border-end">
                                                <div className="text-muted small mb-1 uppercase fw-bold">Mã đơn hàng</div>
                                                <div className="fw-bold text-primary fs-5 mb-2">{order.order_code}</div>
                                                {getStatusBadge(order.order_status)}
                                            </Col>
                                            <Col md={9} className="p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="fw-bold mb-1 hover-text-success cursor-pointer">
                                                            {order.event_name || 'Đơn hàng dịch vụ'}
                                                        </h5>
                                                        <div className="d-flex gap-3 text-muted small">
                                                            <span><FaCalendarAlt className="me-1 text-primary" /> {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                                            <span><FaTicketAlt className="me-1 text-success" /> Tổng tiền: <strong>{formatCurrency(order.total_amount)}</strong></span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-column gap-2">
                                                        <Button
                                                            as={Link}
                                                            to={`/order-success/${order.order_code}`}
                                                            variant="outline-primary"
                                                            className="rounded-pill px-4"
                                                            size="sm"
                                                        >
                                                            <FaEye className="me-2" /> Chi tiết vé
                                                        </Button>

                                                        {((order.order_status === 'PAID' && order.is_sale_active) || order.order_status === 'PENDING') && (
                                                            <Button
                                                                variant="link"
                                                                className="text-danger x-small text-decoration-none p-0 fw-bold border-0"
                                                                size="sm"
                                                                onClick={() => handleCancelOrder(order.order_id, order.order_status)}
                                                            >
                                                                {order.order_status === 'PAID' ? 'Yêu cầu hoàn tiền' : 'Hủy đơn hàng'}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <hr className="my-3 opacity-10" />
                                                <div className="small text-muted d-flex align-items-center gap-2">
                                                    <div className="bg-info bg-opacity-10 p-2 rounded-3">
                                                        📧 Gửi tới: <strong>{order.customer_email}</strong>
                                                    </div>
                                                    <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                                                        📞 SĐT: <strong>{order.customer_phone}</strong>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </div>
    );
};

export default MyOrders;
