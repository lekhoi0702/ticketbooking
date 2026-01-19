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
                    <span>Xác nhận xóa sự kiện</span>
                </Space>
            }
            open={open}
            onOk={onConfirm}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Xác nhận"
            cancelText="Hủy bỏ"
            okButtonProps={{ danger: true }}
        >
            <p>
                Bạn muốn xóa sự kiện <strong>{event.event_name}</strong>?
            </p>

            {event.sold_tickets > 0 && (
                <Alert
                    message="Cảnh báo: Đã có vé được bán"
                    description={`Sự kiện này đã có ${event.sold_tickets} vé được bán. Việc xóa sự kiện sẽ yêu cầu Admin phê duyệt.`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

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
