import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Toast, ToastContainer, Modal, Row, Col, Form } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaStar, FaMapMarkerAlt, FaCalendar } from 'react-icons/fa';
import { api } from '../../services/api';

const AdminEventsManagement = () => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.getAllAdminEvents();
            if (res.success) setEvents(res.data);
        } catch (error) {
            console.error("Error fetching admin events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (eventId, newStatus) => {
        try {
            const res = await api.updateEventStatus(eventId, { status: newStatus });
            if (res.success) {
                setToastMsg(`Đã cập nhật trạng thái sự kiện thành ${newStatus}`);
                setShowToast(true);
                setShowModal(false);
                fetchEvents();
            }
        } catch (error) {
            alert("Lỗi khi cập nhật trạng thái");
        }
    };

    const handleToggleFeatured = async (event) => {
        try {
            const res = await api.updateEventStatus(event.event_id, { is_featured: !event.is_featured });
            if (res.success) {
                setToastMsg(res.data.is_featured ? "Đã đặt làm sự kiện nổi bật" : "Đã gỡ khỏi sự kiện nổi bật");
                setShowToast(true);
                fetchEvents();
            }
        } catch (error) {
            alert("Lỗi khi cập nhật trạng thái nổi bật");
        }
    };

    const handleViewDetail = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const statuses = {
            'PUBLISHED': { bg: 'success', text: 'Đã xuất bản' },
            'PENDING': { bg: 'warning', text: 'Chờ duyệt' },
            'REJECTED': { bg: 'danger', text: 'Từ chối' },
            'DRAFT': { bg: 'secondary', text: 'Bản nháp' }
        };
        const s = statuses[status] || { bg: 'info', text: status };
        return <Badge bg={s.bg} className="px-2 py-1">{s.text}</Badge>;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">Quản lý & Duyệt Sự kiện ({events.length})</h3>
                <Button variant="outline-primary" onClick={fetchEvents} className="shadow-sm">Làm mới hệ thống</Button>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th>Sự kiện</th>
                                <th>Nhà tổ chức</th>
                                <th>Địa điểm</th>
                                <th>Trạng thái</th>
                                <th className="text-center">Nổi bật</th>
                                <th className="text-end px-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length > 0 ? events.map(event => (
                                <tr key={event.event_id}>
                                    <td className="px-4 text-muted small">#{event.event_id}</td>
                                    <td>
                                        <div className="fw-bold">{event.event_name}</div>
                                        <div className="small text-muted">{event.category?.category_name}</div>
                                    </td>
                                    <td>{event.organizer_name}</td>
                                    <td className="small text-muted">{event.venue?.venue_name || 'N/A'}</td>
                                    <td>{getStatusBadge(event.status)}</td>
                                    <td className="text-center">
                                        <Button
                                            variant="link"
                                            className={`p-0 fs-5 ${event.is_featured ? 'text-warning' : 'text-light'}`}
                                            onClick={() => handleToggleFeatured(event)}
                                            title={event.is_featured ? "Gỡ nổi bật" : "Đánh dấu nổi bật"}
                                        >
                                            <FaStar />
                                        </Button>
                                    </td>
                                    <td className="text-end px-4">
                                        <Button size="sm" variant="light" className="me-2 text-primary border" onClick={() => handleViewDetail(event)}>
                                            <FaEye className="me-1" /> Chi tiết
                                        </Button>
                                        {event.status === 'PENDING' && (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => handleUpdateStatus(event.event_id, 'PUBLISHED')}
                                            >
                                                <FaCheck className="me-1" /> Duyệt
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">Chưa có dữ liệu sự kiện</td></tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Modal Chi tiết */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable>
                {selectedEvent && (
                    <>
                        <Modal.Header closeButton className="bg-light">
                            <Modal.Title className="fw-bold">Chi tiết sự kiện: {selectedEvent.event_name}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            <Row className="mb-4">
                                <Col md={5}>
                                    <img
                                        src={selectedEvent.banner_image_url ? (selectedEvent.banner_image_url.startsWith('http') ? selectedEvent.banner_image_url : `http://127.0.0.1:5000${selectedEvent.banner_image_url}`) : 'https://via.placeholder.com/400x250'}
                                        alt="Banner"
                                        className="img-fluid rounded-3 shadow-sm border"
                                    />
                                </Col>
                                <Col md={7}>
                                    <div className="mb-3">
                                        <Badge bg="info" className="mb-2">{selectedEvent.category?.category_name}</Badge>
                                        <h4 className="fw-bold mb-1">{selectedEvent.event_name}</h4>
                                        <p className="text-muted small">ID: #{selectedEvent.event_id} | Người tạo: {selectedEvent.organizer_name}</p>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaCalendar className="text-primary me-2" />
                                        <span>Bắt đầu: {new Date(selectedEvent.start_datetime).toLocaleString('vi-VN')}</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaMapMarkerAlt className="text-danger me-2" />
                                        <span>Địa điểm: {selectedEvent.venue?.venue_name}, {selectedEvent.venue?.city}</span>
                                    </div>
                                </Col>
                            </Row>

                            <hr />

                            <div className="mb-4">
                                <h6 className="fw-bold mb-2">Mô tả sự kiện:</h6>
                                <p className="text-muted small border p-3 rounded bg-light" style={{ whiteSpace: 'pre-line' }}>
                                    {selectedEvent.description || 'Không có mô tả chi tiết.'}
                                </p>
                            </div>

                            <div className="mb-3">
                                <h6 className="fw-bold mb-2">Các loại vé:</h6>
                                <Table bordered size="sm">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Tên loại vé</th>
                                            <th>Giá vé</th>
                                            <th>Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedEvent.ticket_types?.map(tt => (
                                            <tr key={tt.ticket_type_id}>
                                                <td>{tt.type_name}</td>
                                                <td className="fw-bold text-primary">{formatCurrency(tt.price)}</td>
                                                <td>{tt.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="bg-light">
                            <div className="me-auto">
                                Trạng thái hiện tại: {getStatusBadge(selectedEvent.status)}
                            </div>
                            {selectedEvent.status === 'PENDING' ? (
                                <>
                                    <Button variant="danger" onClick={() => handleUpdateStatus(selectedEvent.event_id, 'REJECTED')}>
                                        Từ chối phê duyệt
                                    </Button>
                                    <Button variant="success" onClick={() => handleUpdateStatus(selectedEvent.event_id, 'PUBLISHED')}>
                                        Duyệt & Xuất bản
                                    </Button>
                                </>
                            ) : (
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                            )}
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            <ToastContainer position="bottom-end" className="p-3">
                <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="dark" className="text-white border-0">
                    <Toast.Body className="d-flex align-items-center">
                        <FaCheck className="text-success me-2" /> {toastMsg}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

export default AdminEventsManagement;
