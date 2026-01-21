import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Card,
    Button,
    Input,
    Typography,
    Space,
    Alert,
    Modal,
    Tooltip,
    message,
    Divider
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
    EyeOutlined,
    ShoppingOutlined,
    ClockCircleOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import EventTable from '@features/organizer/components/EventTable';
import DeleteEventModal from '@features/organizer/components/DeleteEventModal';
import AddShowtimeForm from '@features/organizer/components/AddShowtimeForm';
import { useEventList } from '@shared/hooks/useEventList';

const { Text, Title } = Typography;

const EventList = () => {
    const navigate = useNavigate();
    const {
        events,
        loading,
        error,
        handlePublishEvent,
        handleCancelApproval,
        fetchEvents,
        handleDeleteClick,
        handleDeleteConfirm,
        handleBulkDelete,
        showDeleteModal,
        setShowDeleteModal,
        eventToDelete,
        setEventToDelete,
        deleting
    } = useEventList();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isAddShowtimeModalOpen, setIsAddShowtimeModalOpen] = useState(null);

    const filteredEvents = events.filter(event =>
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedEvents = events.filter(e => selectedRowKeys.includes(e.event_id));
    const firstSelected = selectedEvents[0];

    return (
        <div className="event-list-page">
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                    <Link to="/organizer/create-event">
                        <Button type="primary" icon={<PlusOutlined />} disabled={loading || deleting}>
                            Tạo sự kiện mới
                        </Button>
                    </Link>
                    <Button icon={<ReloadOutlined />} onClick={() => { fetchEvents(); setSelectedRowKeys([]); }} disabled={loading || deleting}>
                        Làm mới
                    </Button>
                </Space>
            </div>

            {/* Selection Toolbar */}
            {selectedRowKeys.length > 0 && firstSelected && (
                <Card
                    style={{
                        marginBottom: 16,
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: 8
                    }}
                    styles={{ body: { padding: '12px 24px' } }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space size={16}>
                            <Text strong>Đã chọn sự kiện: {firstSelected.event_name}</Text>
                            <Divider type="vertical" />
                            <Space size={8}>
                                {firstSelected.status === 'DRAFT' ? (
                                    <Tooltip title="Chỉnh sửa thông tin sự kiện">
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            onClick={() => navigate(`/organizer/edit-event/${firstSelected.event_id}`)}
                                        >Sửa sự kiện</Button>
                                    </Tooltip>
                                ) : (
                                    ['PENDING_APPROVAL', 'PUBLISHED'].includes(firstSelected.status) && (
                                        <Tooltip title="Chuyển về bản nháp để có thể chỉnh sửa">
                                            <Button
                                                icon={<ReloadOutlined />}
                                                onClick={() => handleCancelApproval(firstSelected.event_id)}
                                                loading={loading}
                                            >Lấy về sửa</Button>
                                        </Tooltip>
                                    )
                                )}
                                <Tooltip title="Xem chi tiết">
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={() => navigate(`/organizer/event/${firstSelected.event_id}`)}
                                    >Xem</Button>
                                </Tooltip>
                                <Tooltip title="Đơn hàng">
                                    <Button
                                        icon={<ShoppingOutlined />}
                                        onClick={() => navigate(`/organizer/event/${firstSelected.event_id}/orders`)}
                                    >Đơn hàng</Button>
                                </Tooltip>
                                <Tooltip title="Thêm suất diễn">
                                    <Button
                                        icon={<ClockCircleOutlined />}
                                        onClick={() => setIsAddShowtimeModalOpen(firstSelected)}
                                    >Suất diễn</Button>
                                </Tooltip>
                                {firstSelected.status === 'APPROVED' && (
                                    <Button
                                        type="primary"
                                        icon={<CloudUploadOutlined />}
                                        onClick={() => handlePublishEvent(firstSelected.event_id)}
                                        style={{ background: '#2DC275', borderColor: '#2DC275' }}
                                    >Đăng sự kiện</Button>
                                )}
                                {firstSelected.status === 'DRAFT' && (
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteClick(firstSelected)}
                                        loading={deleting}
                                    >Xóa</Button>
                                )}
                            </Space>
                        </Space>
                        <Button type="text" onClick={() => setSelectedRowKeys([])}>Hủy chọn</Button>
                    </div>
                </Card>
            )}

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
                        Tổng số: <Text strong style={{ color: '#2DC275' }}>{filteredEvents.length}</Text> sự kiện
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
                        selectedRowKeys={selectedRowKeys}
                        onSelectionChange={setSelectedRowKeys}
                        loading={loading || deleting}
                    />
                </div>
            </Card>

            {/* Delete Modal */}
            <DeleteEventModal
                open={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={async () => {
                    await handleDeleteConfirm();
                    setSelectedRowKeys([]);
                }}
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
                            setSelectedRowKeys([]);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default EventList;
