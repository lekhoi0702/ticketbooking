import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Modal,
    message,
    Typography,
    Input,
    Descriptions,
    Divider
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { api } from '@services/api';
import AdminPortal from '@shared/components/AdminPortal';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const { Title, Text } = Typography;
const { TextArea } = Input;

const EventDeletionRequests = () => {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.getEventDeletionRequests();
            if (res.success) {
                setRequests(res.data);
            }
        } catch (error) {
            message.error('Không thể tải danh sách yêu cầu xóa sự kiện');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;

        try {
            setProcessing(true);
            const res = await api.approveEventDeletionRequest(selectedRequest.request_id, {
                admin_id: 1, // TODO: Get from auth context
                admin_note: adminNote
            });

            if (res.success) {
                message.success('Đã phê duyệt yêu cầu xóa sự kiện');
                setShowApproveModal(false);
                setShowDetailModal(false);
                setAdminNote('');
                fetchRequests();
            } else {
                message.error(res.message || 'Không thể phê duyệt yêu cầu');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi phê duyệt');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;

        if (!adminNote.trim()) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            setProcessing(true);
            const res = await api.rejectEventDeletionRequest(selectedRequest.request_id, {
                admin_id: 1, // TODO: Get from auth context
                admin_note: adminNote
            });

            if (res.success) {
                message.success('Đã từ chối yêu cầu xóa sự kiện');
                setShowRejectModal(false);
                setShowDetailModal(false);
                setAdminNote('');
                fetchRequests();
            } else {
                message.error(res.message || 'Không thể từ chối yêu cầu');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra khi từ chối');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            'PENDING': { color: 'processing', text: 'Chờ xử lý' },
            'APPROVED': { color: 'success', text: 'Đã phê duyệt' },
            'REJECTED': { color: 'error', text: 'Đã từ chối' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Sự kiện',
            dataIndex: 'event_name',
            key: 'event_name',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Vé đã bán',
            dataIndex: 'sold_tickets',
            key: 'sold_tickets',
            align: 'center',
            render: (count) => <Tag color="orange">{count} vé</Tag>,
        },
        {
            title: 'Đơn hàng chưa hủy',
            dataIndex: 'active_orders',
            key: 'active_orders',
            align: 'center',
            render: (count) => <Tag color="red">{count} đơn</Tag>,
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => dayjs.utc(date).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'request_status',
            key: 'request_status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedRequest(record);
                            setShowDetailModal(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.request_status === 'PENDING' && (
                        <>
                            <Button
                                type="text"
                                icon={<CheckCircleOutlined />}
                                style={{ color: '#2DC275' }}
                                onClick={() => {
                                    setSelectedRequest(record);
                                    setShowApproveModal(true);
                                }}
                            >
                                Phê duyệt
                            </Button>
                            <Button
                                type="text"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => {
                                    setSelectedRequest(record);
                                    setShowRejectModal(true);
                                }}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <Button icon={<ReloadOutlined />} onClick={fetchRequests} size="middle">
                    Làm mới yêu cầu
                </Button>
            </div>


            <Card>
                <Table
                    columns={columns}
                    dataSource={requests}
                    rowKey="request_id"
                    loading={loading}
                    pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} yêu cầu` }}
                    locale={{ emptyText: 'Chưa có yêu cầu nào' }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu xóa sự kiện"
                open={showDetailModal}
                onCancel={() => {
                    setShowDetailModal(false);
                    setSelectedRequest(null);
                }}
                footer={null}
                width={700}
            >
                {selectedRequest && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Sự kiện" span={2}>
                                <Text strong>{selectedRequest.event_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái sự kiện">
                                <Tag color="blue">{selectedRequest.event_status}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái yêu cầu">
                                {getStatusTag(selectedRequest.request_status)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Vé đã bán">
                                {selectedRequest.sold_tickets} vé
                            </Descriptions.Item>
                            <Descriptions.Item label="Đơn hàng chưa hủy">
                                {selectedRequest.active_orders} đơn
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày yêu cầu" span={2}>
                                {dayjs.utc(selectedRequest.created_at).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lý do từ organizer" span={2}>
                                {selectedRequest.reason || 'Không có'}
                            </Descriptions.Item>
                            {selectedRequest.reviewed_at && (
                                <>
                                    <Descriptions.Item label="Ngày xét duyệt" span={2}>
                                        {dayjs.utc(selectedRequest.reviewed_at).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ghi chú từ admin" span={2}>
                                        {selectedRequest.admin_note || 'Không có'}
                                    </Descriptions.Item>
                                </>
                            )}
                        </Descriptions>

                        {selectedRequest.request_status === 'PENDING' && (
                            <div style={{ marginTop: 24, textAlign: 'right' }}>
                                <Space>
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={() => setShowRejectModal(true)}
                                    >
                                        Từ chối
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => setShowApproveModal(true)}
                                    >
                                        Phê duyệt
                                    </Button>
                                </Space>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Approve Modal */}
            <Modal
                title="Xác nhận phê duyệt"
                open={showApproveModal}
                onOk={handleApprove}
                onCancel={() => {
                    setShowApproveModal(false);
                    setAdminNote('');
                }}
                confirmLoading={processing}
                okText="Phê duyệt"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Bạn có chắc chắn muốn phê duyệt yêu cầu xóa sự kiện{' '}
                    <strong>{selectedRequest?.event_name}</strong>?
                </p>
                <p style={{ color: '#ff4d4f' }}>
                    <ExclamationCircleOutlined /> Sự kiện sẽ bị xóa vĩnh viễn và không thể khôi phục!
                </p>
                <Divider />
                <Text>Ghi chú (tùy chọn):</Text>
                <TextArea
                    rows={3}
                    placeholder="Nhập ghi chú nếu cần..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    style={{ marginTop: 8 }}
                />
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Xác nhận từ chối"
                open={showRejectModal}
                onOk={handleReject}
                onCancel={() => {
                    setShowRejectModal(false);
                    setAdminNote('');
                }}
                confirmLoading={processing}
                okText="Từ chối"
                cancelText="Hủy"
            >
                <p>
                    Bạn có chắc chắn muốn từ chối yêu cầu xóa sự kiện{' '}
                    <strong>{selectedRequest?.event_name}</strong>?
                </p>
                <Divider />
                <Text>Lý do từ chối (bắt buộc):</Text>
                <TextArea
                    rows={3}
                    placeholder="Nhập lý do từ chối..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    style={{ marginTop: 8 }}
                    required
                />
            </Modal>
        </div>
    );
};

export default EventDeletionRequests;
