import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, InputGroup, Form, Spinner } from 'react-bootstrap';
import { FaSearch, FaFileInvoiceDollar, FaCheckCircle, FaFilter } from 'react-icons/fa';
import { api } from '../../services/api';

const AdminOrdersManagement = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.getAllAdminOrders();
            if (res.success) setOrders(res.data);
        } catch (error) {
            console.error("Error fetching admin orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCash = async (paymentId) => {
        if (!window.confirm("Xác nhận đã nhận tiền mặt cho đơn hàng này?")) return;
        try {
            const res = await api.confirmCashPayment(paymentId);
            if (res.success) {
                alert("Đã xác nhận thanh toán thành công!");
                fetchOrders();
            }
        } catch (error) {
            alert("Lỗi khi xác nhận thanh toán");
        }
    };

    const filteredOrders = orders.filter(order =>
        order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status) => {
        const statuses = {
            'PAID': { bg: 'success', text: 'Đã thanh toán' },
            'PENDING': { bg: 'warning', text: 'Chờ thanh toán' },
            'CANCELLED': { bg: 'danger', text: 'Đã hủy' }
        };
        const s = statuses[status] || { bg: 'secondary', text: status };
        return <Badge bg={s.bg}>{s.text}</Badge>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">Quản lý Đơn hàng toàn hệ thống ({orders.length})</h3>
                <Button variant="outline-primary" onClick={fetchOrders}><FaFilter className="me-2" /> Làm mới</Button>
            </div>

            <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-0">
                    <div className="p-4 border-bottom">
                        <InputGroup className="w-50">
                            <InputGroup.Text className="bg-white border-end-0">
                                <FaSearch className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder="Tìm theo mã đơn, khách hàng hoặc sự kiện..."
                                className="border-start-0 ps-0 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Sự kiện</th>
                                <th>Tổng tiền</th>
                                <th>Hình thức</th>
                                <th>Trạng thái</th>
                                <th>Ngày đặt</th>
                                <th className="text-end px-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <tr key={order.order_id}>
                                    <td className="px-4 fw-bold text-primary">{order.order_code}</td>
                                    <td>
                                        <div className="fw-bold">{order.customer_name}</div>
                                        <div className="small text-muted">{order.customer_phone}</div>
                                    </td>
                                    <td className="small">{order.event_name || 'N/A'}</td>
                                    <td className="fw-bold">{formatCurrency(order.total_amount)}</td>
                                    <td>
                                        <Badge bg="light" text="dark" className="border">
                                            {order.payment_method === 'VNPAY' ? '💳 VNPay' : '💵 Tiền mặt'}
                                        </Badge>
                                    </td>
                                    <td>{getStatusBadge(order.order_status)}</td>
                                    <td className="small text-muted">{new Date(order.created_at).toLocaleString()}</td>
                                    <td className="text-end px-4">
                                        <Button size="sm" variant="light" className="me-2 text-primary border">
                                            <FaFileInvoiceDollar />
                                        </Button>
                                        {order.payment_method === 'CASH' && order.order_status === 'PENDING' && (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => handleConfirmCash(order.order_id)}
                                            >
                                                <FaCheckCircle className="me-1" /> Xác nhận tiền
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="text-center py-4">Không tìm thấy đơn hàng nào</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AdminOrdersManagement;
