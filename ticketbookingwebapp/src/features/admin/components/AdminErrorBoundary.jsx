import React, { Component } from 'react';
import { Result, Button, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

class AdminErrorBoundary extends Component {
    state = { hasError: false, error: null, retryKey: 0 };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('AdminErrorBoundary caught error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState((prev) => ({
            hasError: false,
            error: null,
            retryKey: prev.retryKey + 1,
        }));
        if (this.props.onRetry) this.props.onRetry();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 400,
                        padding: 24,
                        background: '#fff',
                    }}
                >
                    <Result
                        status="error"
                        title="Đã xảy ra lỗi"
                        subTitle={
                            <Text type="secondary">
                                {this.state.error?.message || 'Vui lòng thử lại hoặc tải lại trang.'}
                            </Text>
                        }
                        extra={[
                            <Button
                                key="retry"
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={this.handleRetry}
                            >
                                Thử lại
                            </Button>,
                            <Button
                                key="reload"
                                onClick={() => window.location.reload()}
                            >
                                Tải lại trang
                            </Button>,
                        ]}
                    />
                </div>
            );
        }

        return (
            <div key={this.state.retryKey} style={{ minHeight: '100%' }}>
                {this.props.children}
            </div>
        );
    }
}

export default AdminErrorBoundary;
