import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const LoadingSpinner = ({ tip = 'Đang tải...', size = 'large' }) => {
    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 40 : 24 }} spin />;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            width: '100%',
            gap: '16px'
        }}>
            <Spin indicator={antIcon} size={size} />
            {tip && <div style={{ color: '#52c41a', fontWeight: 500 }}>{tip}</div>}
        </div>
    );
};

export default LoadingSpinner;
