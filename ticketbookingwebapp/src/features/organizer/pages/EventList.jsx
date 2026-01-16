import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    Button,
    Input,
    Typography,
    Space,
    Alert,
    Modal,
    Spin,
    message
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import EventTable from '@features/organizer/components/EventTable';
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
        deleting
    } = useEventList();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = events.filter(event =>
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <LoadingSpinner tip="Đang tải dữ liệu..." />;
    }

    return (
        <>
            <Spin spinning={loading || deleting} fullscreen tip={deleting ? "Đang xóa sự kiện..." : "Vui lòng đợi..."} />
            <div>
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
                        />
                    }
                >
                    <div style={{ padding: '0 0px' }}>
                        <EventTable
                            events={filteredEvents}
                            handlePublishEvent={handlePublishEvent}
                            handleCancelApproval={handleCancelApproval}
                            handleDeleteClick={handleDeleteClick}
                        />
                    </div>
                </Card>

                <Modal
                    title={
                        <Space>
                            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                            <span>Yêu cầu xóa sự kiện</span>
                        </Space>
                    }
                    open={showDeleteModal}
                    onOk={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                    confirmLoading={deleting}
                    okText="Gửi yêu cầu"
                    cancelText="Hủy bỏ"
                    okButtonProps={{ danger: true }}
                >
                    <p>
                        Bạn muốn xóa sự kiện <strong>{eventToDelete?.event_name}</strong>?
                    </p>

                    {eventToDelete?.sold_tickets > 0 && (
                        <Text type="warning" strong style={{ display: 'block', marginBottom: 8 }}>
                            Sự kiện này đã có {eventToDelete.sold_tickets} vé được bán.
                        </Text>
                    )}

                    <div style={{ marginTop: 16 }}>
                        <Text strong>Lý do xóa sự kiện:</Text>
                        <Input.TextArea
                            placeholder="Vui lòng nhập lý do xóa sự kiện..."
                            rows={3}
                            style={{ marginTop: 8 }}
                            onChange={(e) => {
                                setEventToDelete(prev => ({
                                    ...prev,
                                    deleteReason: e.target.value
                                }));
                            }}
                        />
                    </div>

                    {eventToDelete?.status === 'PUBLISHED' && (
                        <Alert
                            message="Không thể xóa"
                            description="Sự kiện đang ở trạng thái CÔNG KHAI. Vui lòng chuyển về BẢN NHÁP trước khi xóa."
                            type="error"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    )}
                </Modal>
            </div>
        </>
    );
};

export default EventList;
