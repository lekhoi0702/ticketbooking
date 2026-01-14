import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Spinner, Toast, ToastContainer, Row, Col, Alert } from 'react-bootstrap';
import { api } from '../../services/api';

const AdminEventsManagement = () => {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

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
            setActionLoading(true);
            const formData = new FormData();
            formData.append('status', newStatus);
            const res = await api.adminUpdateEventStatus(eventId, formData);
            if (res.success) {
                setToast({ show: true, message: `Hệ thống đã cập nhật trạng thái: ${newStatus}`, variant: 'primary' });
                setShowModal(false);
                fetchEvents();
            }
        } catch (error) {
            setToast({ show: true, message: "Lỗi thực thi: " + error.message, variant: 'danger' });
        } finally {
            setActionLoading(false);
        }
    };

    const toggleFeatured = async (event) => {
        try {
            const formData = new FormData();
            formData.append('is_featured', !event.is_featured);
            const res = await api.adminUpdateEventStatus(event.event_id, formData);
            if (res.success) {
                setToast({ show: true, message: "Cập nhật tiêu điểm thành công", variant: 'primary' });
                fetchEvents();
            }
        } catch (error) {
            setToast({ show: true, message: "Lỗi: " + error.message, variant: 'danger' });
        }
    };

    const getStatusStyles = (status) => {
        const styles = {
            'PUBLISHED': { bg: '#ecfdf5', dot: '#10b981', color: '#047857', text: 'CÔNG KHAI' },
            'PENDING_APPROVAL': { bg: '#fffbeb', dot: '#f59e0b', color: '#b45309', text: 'CHỜ DUYỆT' },
            'APPROVED': { bg: '#eff6ff', dot: '#3b82f6', color: '#1d4ed8', text: 'ĐÃ DUYỆT' },
            'REJECTED': { bg: '#fef2f2', dot: '#ef4444', color: '#b91c1c', text: 'TỪ CHỐI' },
            'DRAFT': { bg: '#f8fafc', dot: '#94a3b8', color: '#475569', text: 'BẢN NHÁP' }
        };
        return styles[status] || styles['DRAFT'];
    };

    if (loading && events.length === 0) return (
        <div className="text-center py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" style={{ color: '#6366f1' }} />
            <p className="mt-3 text-slate-500 fw-bold">Đang truy xuất danh mục sự kiện...</p>
        </div>
    );

    const pendingCount = events.filter(e => e.status === 'PENDING_APPROVAL').length;

    return (
        <div className="pb-5 animate-fade-in events-management-premium">
            {/* Contextual Alert */}
            {pendingCount > 0 && (
                <div className="premium-alert bg-indigo-gradient p-4 rounded-4 shadow-indigo mb-5 text-white d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <div className="alert-icon bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-4" style={{ width: '56px', height: '56px' }}>
                            <i className="bi bi-shield-lock-fill fs-3"></i>
                        </div>
                        <div>
                            <h4 className="fw-900 mb-1">Yêu cầu cần phê duyệt mới</h4>
                            <p className="mb-0 opacity-75 fw-medium">Hiện có <span className="fw-900">{pendingCount} sự kiện</span> đang chờ xác nhận từ ban quản trị hệ thống.</p>
                        </div>
                    </div>
                    <button className="btn btn-white rounded-pill px-4 fw-bold shadow-sm" onClick={() => {
                        const firstPending = document.querySelector('.status-pending');
                        if (firstPending) firstPending.scrollIntoView({ behavior: 'smooth' });
                    }}>Xem ngay</button>
                </div>
            )}

            <div className="card-modern bg-white rounded-4 shadow-sm border-0 border-slate-50 overflow-hidden mt-4">
                <div className="card-header-modern p-4 d-flex justify-content-between align-items-center border-bottom border-slate-50">
                    <div>
                        <h5 className="fw-900 text-slate-800 mb-1 tracking-tightest">Hệ thống Xét duyệt Sự kiện</h5>
                        <p className="text-slate-400 small mb-0 fw-medium">Phân tích, đánh giá và quản lý vòng đời sự kiện của đối tác</p>
                    </div>
                    <Button variant="slate-50" className="rounded-pill px-4 border text-slate-600 fw-bold small transition-all" onClick={fetchEvents}>
                        <i className="bi bi-arrow-clockwise me-2"></i> LÀM MỚI
                    </Button>
                </div>

                <div className="table-responsive">
                    <Table hover className="align-middle mb-0 custom-table-premium">
                        <thead className="bg-slate-50">
                            <tr className="small text-slate-400 text-uppercase fw-bold">
                                <th className="px-4 py-3 border-0">Banner</th>
                                <th className="py-3 border-0">Chi tiết Sự kiện</th>
                                <th className="py-3 border-0">Đối tác Tổ chức</th>
                                <th className="py-3 border-0 text-center">Trạng thái</th>
                                <th className="py-3 border-0 text-center">Tiêu điểm</th>
                                <th className="py-3 border-0 text-end px-4">Tác vụ Quản trị</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => {
                                const st = getStatusStyles(event.status);
                                return (
                                    <tr key={event.event_id} className={event.status === 'PENDING_APPROVAL' ? 'status-pending bg-amber-50 bg-opacity-10' : ''}>
                                        <td className="px-4 py-4">
                                            <div className="event-banner-box rounded-3 overflow-hidden shadow-xs border border-slate-100" style={{ width: '80px', height: '54px' }}>
                                                <img
                                                    src={event.banner_image_url?.startsWith('http') ? event.banner_image_url : `http://127.0.0.1:5000${event.banner_image_url}`}
                                                    className="w-100 h-100 object-fit-cover"
                                                    alt="banner"
                                                    onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=Banner&background=6366f1&color=fff'}
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fw-bold text-slate-800 fs-6">{event.event_name}</div>
                                            <div className="small text-slate-400 fw-medium">
                                                <i className="bi bi-geo-alt me-1"></i> {event.venue_name}
                                                <span className="mx-2 text-slate-200">|</span>
                                                <i className="bi bi-calendar-check me-1"></i> {new Date(event.start_datetime).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <img src={`https://ui-avatars.com/api/?name=${event.organizer_name}&background=f1f5f9&color=6366f1&bold=true`} className="rounded-circle me-2" width="24" height="24" alt="org" />
                                                <span className="fw-bold text-slate-600 small">{event.organizer_name}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="premium-status-badge d-inline-flex align-items-center rounded-pill px-3 py-1 fw-bold" style={{ backgroundColor: st.bg, color: st.color, fontSize: '10px' }}>
                                                <span className="dot me-2" style={{ backgroundColor: st.dot, width: '6px', height: '6px', borderRadius: '50%' }}></span>
                                                {st.text}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="form-check form-switch d-flex justify-content-center">
                                                <input
                                                    className="form-check-input pointer shadow-none border-slate-200"
                                                    type="checkbox"
                                                    checked={event.is_featured}
                                                    onChange={() => toggleFeatured(event)}
                                                />
                                            </div>
                                        </td>
                                        <td className="text-end px-4">
                                            <Button
                                                variant={event.status === 'PENDING_APPROVAL' ? "indigo-gradient" : "slate-50"}
                                                size="sm"
                                                className={`rounded-pill px-4 fw-bold shadow-xs transition-all ${event.status === 'PENDING_APPROVAL' ? 'text-white border-0' : 'text-slate-600 border'}`}
                                                onClick={() => { setSelectedEvent(event); setShowModal(true); }}
                                            >
                                                {event.status === 'PENDING_APPROVAL' ? 'KIỂM DUYỆT' : 'CHI TIẾT'}
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Premium Approval Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="border-0 shadow-2xl rounded-5 overflow-hidden">
                {selectedEvent && (
                    <>
                        <Modal.Body className="p-0">
                            <div className="position-relative" style={{ height: '300px' }}>
                                <img
                                    src={selectedEvent.banner_image_url?.startsWith('http') ? selectedEvent.banner_image_url : `http://127.0.0.1:5000${selectedEvent.banner_image_url}`}
                                    className="w-100 h-100 object-fit-cover shadow-inner"
                                    alt="banner"
                                />
                                <div className="modal-banner-overlay position-absolute bottom-0 start-0 w-100 p-5 bg-gradient-premium text-white d-flex align-items-end justify-content-between">
                                    <div>
                                        <div className="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-2 fw-bold small mb-2" style={{ backdropFilter: 'blur(5px)' }}>
                                            {selectedEvent.category?.category_name || 'Event Category'}
                                        </div>
                                        <h2 className="fw-900 mb-0 tracking-tightest fs-1">{selectedEvent.event_name}</h2>
                                    </div>
                                    <div className="text-end">
                                        <div className="text-white bg-white bg-opacity-10 rounded-pill px-4 py-2 small fw-bold" style={{ backdropFilter: 'blur(5px)' }}>
                                            ID: {selectedEvent.event_id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5">
                                <Row className="g-5">
                                    <Col lg={7}>
                                        <div className="mb-4 d-flex align-items-center">
                                            <div className="section-dot me-2"></div>
                                            <h6 className="fw-900 text-uppercase tracking-widest text-slate-800 small mb-0">Nội dung chi tiết</h6>
                                        </div>
                                        <div className="event-description-box p-4 bg-slate-50 rounded-4 text-slate-600 small" style={{ lineHeight: '1.8' }}>
                                            {selectedEvent.description || 'Đối tác chưa cung cấp mô tả chi tiết cho sự kiện này.'}
                                        </div>
                                    </Col>
                                    <Col lg={5}>
                                        <div className="mb-4 d-flex align-items-center">
                                            <div className="section-dot me-2 bg-indigo-500"></div>
                                            <h6 className="fw-900 text-uppercase tracking-widest text-slate-800 small mb-0">Tóm tắt Thông tin</h6>
                                        </div>
                                        <div className="info-grid g-3">
                                            <div className="info-item d-flex align-items-center mb-3 p-3 border border-slate-100 rounded-4 transition-all hover-slate-50 shadow-xs">
                                                <div className="info-icon bg-indigo-50 text-indigo-500 rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                    <i className="bi bi-person-badge-fill fs-5"></i>
                                                </div>
                                                <div>
                                                    <div className="text-slate-400 small fw-bold">NHÀ TỔ CHỨC</div>
                                                    <div className="text-slate-800 fw-bold">{selectedEvent.organizer_name}</div>
                                                </div>
                                            </div>
                                            <div className="info-item d-flex align-items-center mb-3 p-3 border border-slate-100 rounded-4 transition-all hover-slate-50 shadow-xs">
                                                <div className="info-icon bg-emerald-50 text-emerald-500 rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                    <i className="bi bi-geo-alt-fill fs-5"></i>
                                                </div>
                                                <div>
                                                    <div className="text-slate-400 small fw-bold">ĐỊA ĐIỂM</div>
                                                    <div className="text-slate-800 fw-bold">{selectedEvent.venue_name}</div>
                                                </div>
                                            </div>
                                            <div className="info-item d-flex align-items-center p-3 border border-slate-100 rounded-4 transition-all hover-slate-50 shadow-xs">
                                                <div className="info-icon bg-amber-50 text-amber-500 rounded-3 d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                    <i className="bi bi-calendar-event-fill fs-5"></i>
                                                </div>
                                                <div>
                                                    <div className="text-slate-400 small fw-bold">THỜI GIAN</div>
                                                    <div className="text-slate-800 fw-bold">{new Date(selectedEvent.start_datetime).toLocaleString('vi-VN')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="bg-slate-50 border-0 p-5 pt-0 d-flex justify-content-between">
                            <Button variant="white" className="rounded-pill px-5 border fw-bold text-slate-500 shadow-sm" onClick={() => setShowModal(false)}>QUAY LẠI</Button>

                            {selectedEvent.status === 'PENDING_APPROVAL' && (
                                <div className="d-flex gap-3">
                                    <Button
                                        variant="white"
                                        className="rounded-pill px-5 fw-bold text-danger border-danger border-opacity-25 transition-all hover-bg-danger"
                                        onClick={() => handleUpdateStatus(selectedEvent.event_id, 'REJECTED')}
                                        disabled={actionLoading}
                                    >
                                        TỪ CHỐI
                                    </Button>
                                    <Button
                                        variant="indigo-gradient"
                                        className="rounded-pill px-5 fw-bold text-white shadow-indigo border-0 transition-all active-scale"
                                        onClick={() => handleUpdateStatus(selectedEvent.event_id, 'APPROVED')}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? <Spinner animation="border" size="sm" /> : 'PHÊ DUYỆT NGAY'}
                                    </Button>
                                </div>
                            )}

                            {selectedEvent.status === 'APPROVED' && (
                                <Button
                                    variant="outline-warning"
                                    className="rounded-pill px-4 fw-bold border-opacity-25"
                                    onClick={() => handleUpdateStatus(selectedEvent.event_id, 'PENDING_APPROVAL')}
                                    disabled={actionLoading}
                                >
                                    HỦY TRẠNG THÁI PHÊ DUYỆT
                                </Button>
                            )}
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* High-end Notifications */}
            <ToastContainer position="bottom-center" className="p-5 mb-4" style={{ zIndex: 9999 }}>
                <Toast show={toast.show} onClose={() => setToast({ ...toast, show: false })} delay={4000} autohide className="premium-toast border-0 shadow-2xl rounded-pill overflow-hidden bg-slate-900 text-white">
                    <Toast.Body className="d-flex align-items-center px-4 py-3">
                        <div className={`toast-indicator me-3 bg-${toast.variant === 'danger' ? 'danger' : 'indigo-500'}`} style={{ width: '4px', height: '24px', borderRadius: '2px' }}></div>
                        <span className="fw-bold fs-6">{toast.message}</span>
                        <button className="ms-auto btn-close btn-close-white small border-0 shadow-none" onClick={() => setToast({ ...toast, show: false })}></button>
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <style>{`
                .fw-900 { font-weight: 900; }
                .tracking-tightest { letter-spacing: -0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                
                .bg-indigo-gradient { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important; }
                .shadow-indigo { box-shadow: 0 10px 30px -5px rgba(99, 102, 241, 0.45); }
                .bg-gradient-premium { background: linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.85) 100%); }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                
                .premium-alert { cursor: pointer; border: 1px solid rgba(255,255,255,0.1); }
                .btn-white { background-color: white !important; color: #6366f1 !important; border: none !important; }
                .btn-indigo-gradient { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important; }
                .hover-bg-danger:hover { background-color: #fef2f2 !important; }
                .active-scale:active { transform: scale(0.95); }
                
                .section-dot { width: 8px; height: 8px; background-color: #cbd5e1; border-radius: 50%; }
                .bg-indigo-500 { background-color: #6366f1 !important; }
                .hover-slate-50:hover { background-color: #f8fafc !important; }
                
                .custom-table-premium tbody tr { transition: all 0.2s; border-color: #f1f5f9; }
                .custom-table-premium tbody tr:hover { background-color: #f8fafc !important; transform: scale(1.002); }
                
                .premium-toast { min-width: 400px; animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                @keyframes slideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
            `}</style>
        </div>
    );
};

export default AdminEventsManagement;
