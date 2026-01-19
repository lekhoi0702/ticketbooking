import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    Button,
    Input,
    Typography,
    Space,
    Alert,
    Modal
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import EventTable from '@features/organizer/components/EventTable';
import DeleteEventModal from '@features/organizer/components/DeleteEventModal';
import AddShowtimeForm from '@features/organizer/components/AddShowtimeForm';
import { useEventList } from '@shared/hooks/useEventList';

const { Text } = Typography;

const EventList = () => {
    const {
        events,
        loading,
        error,
        handlePublishEvent,
        handleCancelApproval,
        fetchEvents,
        handleDeleteClick,
        handleDeleteConfirm,
        showDeleteModal,
        setShowDeleteModal,
        eventToDelete,
        setEventToDelete,
        deleting
    } = useEventList();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddShowtimeModalOpen, setIsAddShowtimeModalOpen] = useState(null);

    const filteredEvents = events.filter(event =>
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="event-list-page">
            {/* Header Actions */}
            <Space style={{ marginBottom: 24 }}>
                <Link to="/organizer/create-event">
                    <Button type="primary" icon={<PlusOutlined />} disabled={loading || deleting}>
                        Tạo sự kiện mới
                    </Button>
                </Link>
                <Button icon={<ReloadOutlined />} onClick={fetchEvents} disabled={loading || deleting}>
                    Làm mới
                </Button>
            </Space>

            {error && (
                <Alert
                    message="Lỗi"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            <Card
                styles={{ body: { padding: 0 } }}
                extra={
                    <Text type="secondary">
                        Tổng số: <Text strong style={{ color: '#52c41a' }}>{filteredEvents.length}</Text> sự kiện
                    </Text>
                }
                title={
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                        placeholder="Tìm kiếm sự kiện..."
                    />
                }
            >
                <div style={{ padding: '0 0px' }}>
                    <EventTable
                        events={filteredEvents}
                        handlePublishEvent={handlePublishEvent}
                        handleCancelApproval={handleCancelApproval}
                        handleDeleteClick={handleDeleteClick}
                        setIsAddShowtimeModalOpen={setIsAddShowtimeModalOpen}
                        loading={loading || deleting}
                    />
                </div>
            </Card>

            {/* Delete Modal */}
            <DeleteEventModal
                open={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                loading={deleting}
                event={eventToDelete}
                setEvent={setEventToDelete}
            />

            {/* Add Showtime Modal */}
            <Modal
                title="Thêm suất diễn mới"
                open={!!isAddShowtimeModalOpen}
                onCancel={() => setIsAddShowtimeModalOpen(null)}
                footer={null}
            >
                {isAddShowtimeModalOpen && (
                    <AddShowtimeForm
                        sourceEvent={isAddShowtimeModalOpen}
                        onSuccess={() => {
                            setIsAddShowtimeModalOpen(null);
                            fetchEvents();
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default EventList;
