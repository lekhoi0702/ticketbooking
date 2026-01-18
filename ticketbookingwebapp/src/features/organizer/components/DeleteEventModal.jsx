import React from 'react';
import { Modal, Input, Typography, Alert, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const DeleteEventModal = ({
    open,
    onCancel,
    onConfirm,
    loading,
    event,
    setEvent
}) => {
    if (!event) return null;

    return (
        <Modal
            title={
                <Space>
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    <span>Yêu cầu xóa sự kiện</span>
                </Space>
            }
            open={open}
            onOk={onConfirm}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Gửi yêu cầu"
            cancelText="Hủy bỏ"
            okButtonProps={{ danger: true }}
        >
            <p>
                Bạn muốn xóa sự kiện <strong>{event.event_name}</strong>?
            </p>

            {event.sold_tickets > 0 && (
                <Text type="warning" strong style={{ display: 'block', marginBottom: 8 }}>
                    Sự kiện này đã có {event.sold_tickets} vé được bán.
                </Text>
            )}

            <div style={{ marginTop: 16 }}>
                <Text strong>Lý do xóa sự kiện:</Text>
                <Input.TextArea
                    placeholder="Vui lòng nhập lý do xóa sự kiện..."
                    rows={3}
                    style={{ marginTop: 8 }}
                    onChange={(e) => {
                        setEvent(prev => ({
                            ...prev,
                            deleteReason: e.target.value
                        }));
                    }}
                    value={event.deleteReason || ''}
                />
            </div>

            {event.status === 'PUBLISHED' && (
                <Alert
                    message="Không thể xóa"
                    description="Sự kiện đang ở trạng thái CÔNG KHAI. Vui lòng chuyển về BẢN NHÁP trước khi xóa."
                    type="error"
                    showIcon
                    style={{ marginTop: 16 }}
                />
            )}
        </Modal>
    );
};

export default DeleteEventModal;
