import React from 'react';
import { Modal, Button, Space, Badge, Typography, Tag, Descriptions, Divider } from 'antd';
import { CheckCircleOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TicketCheckInModal = ({
    open,
    onCancel,
    ticket,
    onConfirm,
    loading
}) => {
    return (
        <Modal
            title={[
                <Space key="title">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>Xác nhận Check-in</span>
                </Space>
            ]}
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => onConfirm(ticket?.ticket_code)}
                    loading={loading}
                    size="large"
                >
                    Xác nhận CHECK-IN
                </Button>
            ]}
        >
            {ticket && (
                <div style={{ padding: '0 20px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Badge status="processing" />
                        <Title level={3} style={{ margin: '10px 0', color: '#1890ff' }}>
                            {ticket.ticket_code}
                        </Title>
                        <Tag color="blue" style={{ fontSize: 16, padding: '5px 10px' }}>
                            {ticket.ticket_type_name}
                        </Tag>
                    </div>

                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Sự kiện">
                            <Text strong>{ticket.event_name}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">
                            {ticket.holder_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {ticket.holder_email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghế ngồi">
                            {ticket.seat_id ? `Ghế ID: ${ticket.seat_id}` : 'Tự do'}
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider plain>Thông tin kiểm soát</Divider>
                    <Space style={{ width: '100%', justifyContent: 'center' }}>
                        <Tag icon={<CalendarOutlined />}>
                            {new Date().toLocaleDateString('vi-VN')}
                        </Tag>
                        <Tag icon={<ClockCircleOutlined />}>
                            {new Date().toLocaleTimeString('vi-VN')}
                        </Tag>
                    </Space>
                </div>
            )}
        </Modal>
    );
};

export default TicketCheckInModal;
