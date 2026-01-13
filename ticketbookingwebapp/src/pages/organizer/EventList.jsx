import React from 'react';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Hooks
import { useEventList } from '../../hooks/useEventList';

// Components
import EventTable from '../../components/organizer/EventTable';
import DeleteEventModal from '../../components/organizer/DeleteEventModal';

/**
 * Organizer's Event List page component.
 * Refactored to be cleaner and more maintainable.
 */
const EventList = () => {
    const {
        events,
        loading,
        error,
        deleting,
        showDeleteModal,
        eventToDelete,
        setShowDeleteModal,
        handleDeleteClick,
        handleDeleteConfirm,
        fetchEvents
    } = useEventList();

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
                        <EventTable
                            events={events}
                            handleDeleteClick={handleDeleteClick}
                        />
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

            <DeleteEventModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                eventName={eventToDelete?.event_name}
                onConfirm={handleDeleteConfirm}
                deleting={deleting}
            />
        </div>
    );
};

export default EventList;
