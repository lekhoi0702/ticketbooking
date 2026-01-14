import React from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { FaPlus, FaSearch, FaSync } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import EventTable from '../../components/Organizer/EventTable';
import { useEventList } from '../../hooks/useEventList';

const EventList = () => {
    const { events, loading, error, handlePublishEvent, fetchEvents } = useEventList();

    if (loading) return (
        <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-3 text-muted">Đang tải danh sách sự kiện...</p>
        </div>
    );

    return (
        <div className="pb-5">
            {/* Header Area */}
            <div className="row mb-4 align-items-end">
                <div className="col-md-6">
                    <h5 className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-2">Quản lý nội dung</h5>
                    <h3 className="fw-black text-white mb-0">Sự kiện của tôi</h3>
                </div>
                <div className="col-md-6 d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
                    <Button variant="outline-light" size="sm" className="rounded-pill px-3 border-opacity-10" onClick={fetchEvents}>
                        <FaSync className="me-2" /> TẢI LẠI
                    </Button>
                    <Link to="/organizer/create-event" className="btn btn-success btn-sm rounded-pill px-4 fw-bold shadow-sm">
                        <FaPlus className="me-2" /> TẠO MỚI
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="card content-card border-0 shadow-lg mb-0">
                <div className="card-header border-bottom border-white border-opacity-5 py-4 px-4 overflow-hidden position-relative">
                    <div className="row align-items-center">
                        <div className="col-md-5">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-dark border-0 text-muted"><FaSearch /></span>
                                <input type="text" className="form-control bg-dark border-0 text-white" placeholder="Tìm kiếm tên sự kiện..." />
                            </div>
                        </div>
                        <div className="col-md-7 text-md-end mt-2 mt-md-0">
                            <div className="small text-muted">Tổng cộng: <strong className="text-success">{events.length}</strong> sự kiện</div>
                        </div>
                    </div>
                </div>
                <div className="card-body p-0">
                    <EventTable
                        events={events}
                        handlePublishEvent={handlePublishEvent}
                    />
                </div>
            </div>

            {error && (
                <div className="alert alert-danger mt-4 bg-danger bg-opacity-10 border-danger border-opacity-25 text-white">
                    <strong>Lỗi:</strong> {error}
                </div>
            )}

            <style>{`
                .fw-black { font-weight: 900; }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </div>
    );
};

export default EventList;
