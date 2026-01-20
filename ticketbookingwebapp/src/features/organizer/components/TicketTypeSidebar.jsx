import React from 'react';
import {
    Card,
    Typography,
    List,
    Space,
    Progress,
    Divider,
    Badge
} from 'antd';
import {
    AppstoreOutlined,
    InfoCircleOutlined,
    CheckCircleFilled,
    VerticalAlignMiddleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const TicketTypeSidebar = ({
    ticketTypes,
    activeTicketType,
    setActiveTicketType,
    allOccupiedSeats,
    venueTemplate,
    venueName
}) => {
    return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card
                title={<span style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>HẠNG VÉ SỰ KIỆN</span>}
                styles={{ body: { padding: 0 } }}
            >
                <List
                    dataSource={ticketTypes}
                    renderItem={(tt, index) => {
                        const isActive = activeTicketType?.ticket_type_id === tt.ticket_type_id;
                        const assignedCount = allOccupiedSeats.filter(s => String(s.ticket_type_id) === String(tt.ticket_type_id)).length;
                        const isFull = assignedCount >= tt.quantity;
                        const progress = Math.min(100, (assignedCount / tt.quantity) * 100);

                        return (
                            <div
                                key={tt.ticket_type_id}
                                onClick={() => setActiveTicketType(tt)}
                                style={{
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    borderRight: isActive ? '3px solid #2DC275' : 'none',
                                    backgroundColor: isActive ? '#f6ffed' : 'transparent',
                                    transition: 'all 0.3s',
                                    borderBottom: index < ticketTypes.length - 1 ? '1px solid #f0f0f0' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <Text strong style={{ color: isActive ? '#2DC275' : 'inherit' }}>{tt.type_name}</Text>
                                    <AppstoreOutlined style={{ color: isActive ? '#2DC275' : '#d9d9d9' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: isActive ? 8 : 0 }}>
                                    <Text strong style={{ fontSize: 12, color: assignedCount > 0 ? (isFull ? '#2DC275' : '#faad14') : '#d9d9d9' }}>
                                        {assignedCount}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>/</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{tt.quantity} ghế</Text>
                                    {isFull && <CheckCircleFilled style={{ fontSize: 12, color: '#2DC275', marginLeft: 4 }} />}
                                </div>
                                {isActive && (
                                    <Progress
                                        percent={Math.round(progress)}
                                        size="small"
                                        showInfo={false}
                                        strokeColor={isFull ? '#2DC275' : '#2DC275'}
                                        trailColor="#e8e8e8"
                                    />
                                )}
                            </div>
                        );
                    }}
                />
            </Card>

            <Card size="small" style={{ background: '#f5f5f5', borderStyle: 'dashed' }}>
                <Space direction="vertical" size={8}>
                    <Space>
                        <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                        <Text strong style={{ fontSize: 11, color: '#595959' }}>HƯỚNG DẪN THIẾT LẬP</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                        {venueTemplate
                            ? `Sơ đồ được nạp từ thiết kế của ${venueName}. Kéo chuột để gán ghế nhanh cho hạng vé đang chọn.`
                            : 'Nhập thông tin lưới ghế để khởi tạo sơ đồ tự do cho sự kiện này.'}
                    </Text>
                </Space>
            </Card>
        </Space>
    );
};

export default TicketTypeSidebar;
