import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, ProgressBar, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye, FaPlus, FaChair } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const EventList = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [events, setEvents] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.getOrganizerEvents();

            if (response.success) {
                setEvents(response.data);
            } else {
                setError(response.message || 'Không thể tải danh sách sự kiện');
            }
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (event) => {
        setEventToDelete(event);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!eventToDelete) return;

        try {
            setDeleting(true);
            const response = await api.deleteEvent(eventToDelete.event_id);

            if (response.success) {
                // Remove from list
                setEvents(events.filter(e => e.event_id !== eventToDelete.event_id));
                setShowDeleteModal(false);
                setEventToDelete(null);
            } else {
                alert(response.message || 'Không thể xóa sự kiện');
            }
        } catch (err) {
            console.error('Error deleting event:', err);
            alert(err.message || 'Không thể xóa sự kiện');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'DRAFT': { bg: 'warning', text: 'Nháp' },
            'PUBLISHED': { bg: 'success', text: 'Đã Đăng' },
            'ONGOING': { bg: 'info', text: 'Đang Diễn Ra' },
            'COMPLETED': { bg: 'secondary', text: 'Đã Kết Thúc' },
            'CANCELLED': { bg: 'danger', text: 'Đã Hủy' }
        };
        const statusInfo = statusMap[status] || { bg: 'secondary', text: status };
        return <Badge bg={statusInfo.bg} pill className="px-3">{statusInfo.text}</Badge>;
    };

    const getProgressVariant = (percentage) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 50) return 'info';
        if (percentage >= 30) return 'warning';
        return 'danger';
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải danh sách sự kiện...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Lỗi!</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={fetchEvents}>Thử lại</Button>
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-dark fw-bold">Danh Sách Sự Kiện</h2>
                <Button as={Link} to="/organizer/create-event" variant="primary">
                    <FaPlus className="me-2" /> Tạo Sự Kiện Mới
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {events.length > 0 ? (
                        <Table hover responsive className="align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3">Tên Sự Kiện</th>
                                    <th>Thời Gian</th>
                                    <th>Địa Điểm</th>
                                    <th>Tiến Độ Bán Vé</th>
                                    <th>Trạng Thái</th>
                                    <th className="text-end pe-4">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => {
                                    const soldPercentage = event.tickets_sold_percentage || 0;
                                    return (
                                        <tr key={event.event_id}>
                                            <td className="ps-4 py-3">
                                                <div className="fw-bold text-dark">{event.event_name}</div>
                                                <small className="text-muted">ID: {event.event_id}</small>
                                            </td>
                                            <td>
                                                <div className="fw-medium">{formatDate(event.start_datetime)}</div>
                                                <small className="text-muted">{formatTime(event.start_datetime)}</small>
                                            </td>
                                            <td>{event.venue?.venue_name || 'N/A'}</td>
                                            <td style={{ minWidth: '150px' }}>
                                                <div className="d-flex align-items-center">
                                                    <ProgressBar
                                                        variant={getProgressVariant(soldPercentage)}
                                                        now={soldPercentage}
                                                        style={{ height: '6px', flexGrow: 1 }}
                                                    />
                                                    <span className="ms-2 small fw-medium">
                                                        {event.sold_tickets}/{event.total_capacity}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(event.status)}</td>
                                            <td className="text-end pe-4">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="me-1 text-info"
                                                    title="Quản lý ghế"
                                                    as={Link}
                                                    to={`/organizer/manage-seats/${event.event_id}`}
                                                >
                                                    <FaChair />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="me-1 text-secondary"
                                                    title="Xem"
                                                    as={Link}
                                                    to={`/event/${event.event_id}`}
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="me-1 text-primary"
                                                    title="Sửa"
                                                    as={Link}
                                                    to={`/organizer/edit-event/${event.event_id}`}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="text-danger"
                                                    title="Xóa"
                                                    onClick={() => handleDeleteClick(event)}
                                                    disabled={event.sold_tickets > 0}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <p>Chưa có sự kiện nào</p>
                            <Button as={Link} to="/organizer/create-event" variant="primary">
                                <FaPlus className="me-2" /> Tạo Sự Kiện Đầu Tiên
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác Nhận Xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa sự kiện <strong>{eventToDelete?.event_name}</strong>?
                    <br />
                    <small className="text-muted">Hành động này không thể hoàn tác.</small>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
                        {deleting ? 'Đang xóa...' : 'Xóa'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EventList;
