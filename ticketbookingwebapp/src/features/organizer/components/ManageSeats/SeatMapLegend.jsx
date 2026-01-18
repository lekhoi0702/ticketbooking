import React from 'react';
import { Space, Typography, Badge } from 'antd';

const { Text } = Typography;

const SeatMapLegend = () => {
    return (
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
            <Space size={32}>
                <Space>
                    <Badge color="#d9d9d9" />
                    <Text type="secondary" style={{ fontSize: 12 }}>Chưa gán</Text>
                </Space>
                <Space>
                    <Badge color="#52c41a" />
                    <Text type="secondary" style={{ fontSize: 12 }}>Đã gán hạng này</Text>
                </Space>
                <Space>
                    <Badge color="#ff4d4f" />
                    <Text type="secondary" style={{ fontSize: 12 }}>Hạng vé khác</Text>
                </Space>
            </Space>
        </div>
    );
};

export default SeatMapLegend;
