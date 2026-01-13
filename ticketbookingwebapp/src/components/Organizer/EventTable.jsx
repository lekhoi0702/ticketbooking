import React from 'react';
import { Table, Button, Badge, ProgressBar } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye, FaChair } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const EventTable = ({ events, handleDeleteClick }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
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

    return (
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
    );
};

export default EventTable;
