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
import EventTable from '../../components/Organizer/EventTable';
import { useEventList } from '../../hooks/useEventList';

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
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <Spin spinning={loading || deleting} tip={deleting ? "Đang xóa sự kiện..." : "Vui lòng đợi..."}>
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
                            <span>Xác nhận xóa</span>
                        </Space>
                    }
                    open={showDeleteModal}
                    onOk={handleDeleteConfirm}
                    onCancel={() => setShowDeleteModal(false)}
                    confirmLoading={deleting}
                    okText="Xác nhận"
                    cancelText="Hủy bỏ"
                    okButtonProps={{ danger: true }}
                >
                    <p>
                        Bạn có chắc chắn muốn xóa sự kiện <strong>{eventToDelete?.event_name}</strong>? Hành động này không thể hoàn tác.
                    </p>
                </Modal>
            </div>
        </Spin>
    );
};

export default EventList;
