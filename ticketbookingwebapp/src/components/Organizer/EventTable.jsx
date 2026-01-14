import React, { useState } from 'react';
import { Table, Button, Badge, ProgressBar, Modal } from 'react-bootstrap';
import {
    FaEdit, FaTrash, FaChair, FaEye,
    FaGlobe, FaLock, FaCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const EventTable = ({ events, handlePublishEvent }) => {
    const navigate = useNavigate();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    const getStatusBadge = (status) => {
        const statuses = {
            'PENDING_APPROVAL': { bg: 'warning text-dark', text: 'CHỜ DUYỆT' },
            'APPROVED': { bg: 'info', text: 'ĐÃ DUYỆT' },
            'REJECTED': { bg: 'danger', text: 'TỪ CHỐI' },
            'PUBLISHED': { bg: 'success', text: 'CÔNG KHAI' },
            'DRAFT': { bg: 'secondary', text: 'NHÁP' }
        };
        const s = statuses[status] || { bg: 'info', text: status };
        return <Badge bg={s.bg} className="rounded-pill px-3 py-1" style={{ fontSize: '10px' }}>{s.text}</Badge>;
    };

    const handleDeleteClick = (event) => {
        setEventToDelete(event);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const res = await api.deleteEvent(eventToDelete.event_id);
            if (res.success) {
                setShowDeleteModal(false);
                window.location.reload();
            }
        } catch (error) {
            alert("Lỗi khi xóa sự kiện");
        }
    };

    return (
        <div className="table-responsive">
            <Table hover className="organizer-table mb-0 align-middle">
                <thead>
                    <tr>
                        <th className="px-4 py-3">Tên Sự Kiện</th>
                        <th className="py-3">Thời Gian / Địa Điểm</th>
                        <th className="py-3">Vé & Doanh Số</th>
                        <th className="py-3">Trạng Thái</th>
                        <th className="py-3 text-end px-4">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    {events && events.length > 0 ? events.map((event) => {
                        const totalSold = event.total_tickets_sold || 0;
                        const totalQty = event.total_quantity || 1;
                        const soldPercent = Math.round((totalSold / totalQty) * 100);

                        return (
                            <tr key={event.event_id}>
                                <td className="px-4">
                                    <div className="d-flex align-items-center">
                                        <div className="event-img-mini bg-dark rounded border border-white border-opacity-10 me-3 position-relative overflow-hidden"
                                            style={{ width: '48px', height: '48px' }}>
                                            {event.banner_image_url && (
                                                <img
                                                    src={event.banner_image_url.startsWith('http') ? event.banner_image_url : `http://127.0.0.1:5000${event.banner_image_url}`}
                                                    alt="banner"
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-white fw-bold small mb-1">{event.event_name}</div>
                                            <div className="text-muted" style={{ fontSize: '11px' }}>ID: #{event.event_id} | {event.category?.category_name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="text-white small mb-1">{new Date(event.start_datetime).toLocaleDateString('vi-VN')}</div>
                                    <div className="text-muted d-flex align-items-center" style={{ fontSize: '11px' }}>
                                        <span className="text-truncate" style={{ maxWidth: '180px' }}>{event.venue?.venue_name}</span>
                                    </div>
                                </td>
                                <td style={{ minWidth: '150px' }}>
                                    <div className="d-flex justify-content-between align-items-center small mb-1">
                                        <span className="text-muted" style={{ fontSize: '10px' }}>{totalSold}/{totalQty} vé</span>
                                        <span className="text-success fw-bold" style={{ fontSize: '10px' }}>{soldPercent}%</span>
                                    </div>
                                    <ProgressBar
                                        now={soldPercent}
                                        variant="success"
                                        style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}
                                    />
                                </td>
                                <td>{getStatusBadge(event.status)}</td>
                                <td className="text-end px-4">
                                    <div className="d-flex justify-content-end gap-2">
                                        {event.status === 'APPROVED' && (
                                            <Button
                                                size="sm"
                                                variant="success"
                                                className="rounded-pill px-3 shadow-sm fw-bold"
                                                style={{ fontSize: '11px' }}
                                                onClick={() => handlePublishEvent(event.event_id)}
                                            >
                                                <FaGlobe className="me-1" /> ĐĂNG
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline-info"
                                            className="rounded-circle shadow-xs"
                                            title="Sơ đồ ghế"
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                            onClick={() => navigate(`/organizer/manage-seats/${event.event_id}`)}
                                        >
                                            <FaChair size={12} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-light"
                                            className="rounded-circle border-opacity-10 shadow-xs"
                                            title="Sửa"
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                            onClick={() => navigate(`/organizer/edit-event/${event.event_id}`)}
                                        >
                                            <FaEdit size={12} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            className="rounded-circle border-opacity-10 shadow-xs"
                                            title="Xóa"
                                            style={{ width: '32px', height: '32px', padding: 0 }}
                                            onClick={() => handleDeleteClick(event)}
                                        >
                                            <FaTrash size={12} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan="5" className="text-center py-5 text-muted fst-italic">
                                Không có sự kiện nào được hiển thị
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="bg-dark border border-white border-opacity-10">
                <Modal.Header closeButton closeVariant="white" className="border-bottom border-white border-opacity-10">
                    <Modal.Title className="text-white fw-bold">Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-muted p-4">
                    Bạn có chắc chắn muốn xóa sự kiện <strong>{eventToDelete?.event_name}</strong>?
                    <p className="mt-2 mb-0 small text-danger"><FaLock className="me-2" /> Lưu ý: Hành động này không thể hoàn tác.</p>
                </Modal.Body>
                <Modal.Footer className="border-top border-white border-opacity-10">
                    <Button variant="outline-light" onClick={() => setShowDeleteModal(false)} className="rounded-pill px-4 btn-sm">Hủy</Button>
                    <Button variant="danger" onClick={confirmDelete} className="rounded-pill px-4 btn-sm fw-bold">Xác nhận xóa</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EventTable;
