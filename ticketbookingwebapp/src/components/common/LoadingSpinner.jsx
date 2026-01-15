import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import './LoadingSpinner.css';

const { Text, Title } = Typography;

const LoadingSpinner = ({ tip = "Đang tải...", size = "large", fullScreen = false }) => {
    const containerStyle = fullScreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999
    } : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
        padding: '40px'
    };

    return (
        <div style={containerStyle} className="loading-spinner-container">
            <div className="spinner-wrapper">
                {/* Custom animated spinner */}
                <div className="custom-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-logo">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)" />
                            <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="url(#gradient2)" />
                            <defs>
                                <linearGradient id="gradient1" x1="2" y1="2" x2="22" y2="12">
                                    <stop offset="0%" stopColor="#2dc275" />
                                    <stop offset="100%" stopColor="#29a664" />
                                </linearGradient>
                                <linearGradient id="gradient2" x1="2" y1="12" x2="22" y2="22">
                                    <stop offset="0%" stopColor="#29a664" />
                                    <stop offset="100%" stopColor="#228b50" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                {/* Loading text */}
                <div className="loading-text-wrapper">
                    <Title level={4} className="loading-title">{tip}</Title>
                    <Text className="loading-subtitle">Vui lòng đợi trong giây lát</Text>

                    {/* Animated dots */}
                    <div className="loading-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
