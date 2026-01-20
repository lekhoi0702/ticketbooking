import React from 'react';
import { Button, Space, Typography, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SeatMapHeader = ({
    onBack,
    loading,
    venueTemplate,
    activeTicketType,
    selectedCount,
    isComplete,
    onSave,
    initializing
}) => {

    const handleSaveClick = () => {
        if (activeTicketType && selectedCount !== activeTicketType.quantity) {
            message.warning(`Vui lòng chọn đủ ${activeTicketType.quantity} ghế.`);
            return;
        }
        onSave();
    };

    return (
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size={16}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={onBack}
                    disabled={loading}
                />
                <Title level={4} style={{ margin: 0 }}>Thiết lập sơ đồ ghế</Title>
            </Space>

            {venueTemplate && (
                <Space size={24}>
                    {activeTicketType && (
                        <Text strong style={{ color: isComplete ? '#2DC275' : '#ff4d4f' }}>
                            {isComplete
                                ? <Space><CheckCircleOutlined /> Đã đủ số lượng</Space>
                                : <Space><ExclamationCircleOutlined /> Còn thiếu: {activeTicketType.quantity - selectedCount} ghế</Space>
                            }
                        </Text>
                    )}
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSaveClick}
                        disabled={initializing || !activeTicketType || loading}
                    >
                        Lưu cấu hình
                    </Button>
                </Space>
            )}
        </div>
    );
};

export default SeatMapHeader;
