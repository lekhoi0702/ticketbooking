import React from 'react';
import { Spin, Typography } from 'antd';
import './AdminLoadingScreen.css';

const { Text } = Typography;

const AdminLoadingScreen = ({ tip = "Đang tải dữ liệu..." }) => {
    return (
        <div className="admin-loading-container">
            <div className="admin-loading-wrapper">
                <div className="admin-loading-icon">
                    <Spin size="large" />
                </div>
                {tip && <Text className="admin-loading-tip">{tip}</Text>}
            </div>
        </div>
    );
};

export default AdminLoadingScreen;
