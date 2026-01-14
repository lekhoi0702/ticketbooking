import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, InputGroup, Form, Spinner } from 'react-bootstrap';
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

    const handleConfirmCash = async (orderId) => {
        if (!window.confirm("Xác nhận đã nhận tiền mặt cho đơn hàng này? Hệ thống sẽ cập nhật trạng thái PAID.")) return;
        try {
            const res = await api.confirmCashPayment(orderId);
            if (res.success) {
                alert("Đã xác nhận thanh toán thành công!");
                fetchOrders();
            }
        } catch (error) {
            alert("Lỗi thực thi: " + error.message);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        const styles = {
            'PAID': { bg: '#ecfdf5', color: '#047857', text: 'ĐÃ THANH TOÁN', icon: 'bi-check-all' },
            'PENDING': { bg: '#fffbeb', color: '#b45309', text: 'CHỜ THANH TOÁN', icon: 'bi-clock-history' },
            'CANCELLED': { bg: '#fef2f2', color: '#b91c1c', text: 'ĐÃ HỦY', icon: 'bi-x-lg' }
        };
        return styles[status] || { bg: '#f8fafc', color: '#64748b', text: status, icon: 'bi-question-circle' };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading && orders.length === 0) return (
        <div className="text-center py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" style={{ color: '#6366f1' }} />
            <p className="mt-3 text-slate-500 fw-bold">Đang tải lịch sử giao dịch toàn hệ thống...</p>
        </div>
    );

    return (
        <div className="pb-5 animate-fade-in orders-premium">
            <div className="card-modern bg-white rounded-4 shadow-sm border-0 border-slate-50 overflow-hidden mt-4">
                <div className="card-header-modern p-4 border-bottom border-slate-50">
                    <Row className="align-items-center">
                        <Col lg={4}>
                            <h5 className="fw-900 text-slate-800 mb-1 tracking-tightest">Nhật ký Giao dịch</h5>
                            <p className="text-slate-400 small mb-0 fw-medium">Theo dõi dòng tiền và trạng thái thanh toán vé</p>
                        </Col>
                        <Col lg={5}>
                            <div className="input-group input-group-sm bg-slate-50 rounded-pill px-3 py-1 border border-slate-100">
                                <span className="input-group-text bg-transparent border-0 text-slate-400"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control bg-transparent border-0 shadow-none text-slate-600 fw-medium"
                                    placeholder="Tìm mã đơn, khách hàng hoặc tên sự kiện..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col lg={3} className="text-lg-end mt-3 mt-lg-0">
                            <Button variant="white" className="rounded-pill px-4 border text-slate-600 fw-bold small transition-all" onClick={fetchOrders}>
                                <i className="bi bi-arrow-clockwise me-2"></i> Làm mới
                            </Button>
                        </Col>
                    </Row>
                </div>

                <div className="table-responsive">
                    <Table hover className="align-middle mb-0 custom-table-premium">
                        <thead className="bg-slate-50">
                            <tr className="small text-slate-400 text-uppercase fw-bold">
                                <th className="px-4 py-3 border-0">Chi tiết Giao dịch</th>
                                <th className="py-3 border-0">Khách hàng</th>
                                <th className="py-3 border-0">Thông tin Sự kiện</th>
                                <th className="py-3 border-0">Hình thức</th>
                                <th className="py-3 border-0">Giá trị</th>
                                <th className="py-3 border-0">Trạng thái</th>
                                <th className="py-3 border-0 text-end px-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? filteredOrders.map(order => {
                                const st = getStatusStyle(order.order_status);
                                return (
                                    <tr key={order.order_id}>
                                        <td className="px-4 py-4">
                                            <div className="fw-900 text-indigo-500 fs-6">{order.order_code}</div>
                                            <div className="text-slate-400 fw-medium" style={{ fontSize: '11px' }}>
                                                {new Date(order.created_at).toLocaleString('vi-VN')}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-slate-700">{order.customer_name}</div>
                                            <div className="text-slate-400 small fw-medium">{order.customer_phone || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div className="text-truncate text-slate-600 fw-semibold small" style={{ maxWidth: '180px' }} title={order.event_name}>
                                                {order.event_name || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            {order.payment_method === 'VNPAY' ? (
                                                <span className="badge bg-indigo-50 text-indigo-500 rounded-pill px-3 py-2 fw-bold border-0" style={{ fontSize: '10px' }}>
                                                    <i className="bi bi-credit-card-2-front me-1"></i> VNPay
                                                </span>
                                            ) : (
                                                <span className="badge bg-slate-100 text-slate-600 rounded-pill px-3 py-2 fw-bold border-0" style={{ fontSize: '10px' }}>
                                                    <i className="bi bi-cash-stack me-1"></i> Cash
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="fw-900 text-slate-800">{formatCurrency(order.total_amount)}</div>
                                        </td>
                                        <td>
                                            <span className="d-inline-flex align-items-center rounded-pill px-3 py-1 fw-bold" style={{ backgroundColor: st.bg, color: st.color, fontSize: '10px' }}>
                                                <i className={`bi ${st.icon} me-1`}></i> {st.text}
                                            </span>
                                        </td>
                                        <td className="text-end px-4">
                                            <div className="d-flex justify-content-end gap-2">
                                                <button className="btn btn-slate-50 btn-sm rounded-circle shadow-xs border" style={{ width: '32px', height: '32px', padding: 0 }} title="Xem hóa đơn">
                                                    <i className="bi bi-file-earmark-diff text-slate-600"></i>
                                                </button>
                                                {order.payment_method === 'CASH' && order.order_status === 'PENDING' && (
                                                    <Button
                                                        variant="indigo-gradient"
                                                        size="sm"
                                                        className="rounded-pill px-3 fw-bold text-white border-0 shadow-indigo"
                                                        onClick={() => handleConfirmCash(order.order_id)}
                                                    >
                                                        XÁC NHẬN TIỀN
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="7" className="text-center py-5 text-slate-400 fst-italic">Chưa có giao dịch nào được tìm thấy</td></tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            <style>{`
                .fw-900 { font-weight: 900; }
                .tracking-tightest { letter-spacing: -0.05em; }
                .bg-indigo-gradient { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important; }
                .shadow-indigo { box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
                .text-indigo-500 { color: #6366f1 !important; }
                
                .custom-table-premium thead th { border-bottom: 1px solid #f1f5f9 !important; }
                .custom-table-premium tbody tr { transition: all 0.2s; border-color: #f1f5f9; }
                .custom-table-premium tbody tr:hover { background-color: #f8fafc !important; transform: scale(1.001); }
                
                .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .btn-white { background-color: white !important; }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default AdminOrdersManagement;
