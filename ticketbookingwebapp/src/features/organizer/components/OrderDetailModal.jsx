import React from 'react';
import { Modal, Descriptions, Divider, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Configure dayjs for Vietnam timezone
dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;

const OrderDetailModal = ({
    open,
    onCancel,
    order,
    getStatusTag
}) => {
    if (!order) return null;

    return (
        <Modal
            title="Chi tiết đơn hàng"
            open={open}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <div>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Mã đơn hàng" span={2}>
                        <Text strong>{order.order_code}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Khách hàng">
                        {order.customer_name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {order.customer_email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                        {order.customer_phone}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        {getStatusTag(order.order_status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền" span={2}>
                        <Text strong style={{ color: '#2DC275', fontSize: 16 }}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_amount)}
                        </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày đặt">
                        {dayjs.utc(order.created_at).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số vé">
                        {order.tickets_count} vé
                    </Descriptions.Item>
                </Descriptions>

                <Divider>Danh sách vé</Divider>

                <Table
                    dataSource={order.tickets}
                    rowKey="ticket_id"
                    pagination={false}
                    size="small"
                    columns={[
                        {
                            title: 'Mã vé',
                            dataIndex: 'ticket_code',
                            key: 'ticket_code',
                        },
                        {
                            title: 'Loại vé',
                            dataIndex: 'ticket_type_name',
                            key: 'ticket_type_name',
                        },
                        {
                            title: 'Giá',
                            dataIndex: 'price',
                            key: 'price',
                            render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (status) => (
                                <Tag color={status === 'ACTIVE' ? 'success' : status === 'CANCELLED' ? 'error' : 'default'}>
                                    {status === 'ACTIVE' ? 'Có hiệu lực' : status === 'CANCELLED' ? 'Đã hủy' : status}
                                </Tag>
                            ),
                        },
                    ]}
                />
            </div>
        </Modal>
    );
};

export default OrderDetailModal;
