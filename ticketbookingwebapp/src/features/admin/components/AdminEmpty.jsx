import React, { memo } from 'react';
import { Empty, Button, Typography, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const AdminEmpty = ({
    description = 'Không có dữ liệu',
    image = Empty.PRESENTED_IMAGE_SIMPLE,
    actionLabel,
    onAction,
    onRetry,
    retryLabel = 'Thử lại',
    ...rest
}) => {
    const hasAction = Boolean(onAction && actionLabel);
    const hasRetry = Boolean(onRetry);

    return (
        <Empty
            image={image}
            description={
                <Space direction="vertical" size={12} align="center" style={{ width: '100%' }}>
                    <Text type="secondary">{description}</Text>
                    {(hasAction || hasRetry) && (
                        <Space>
                            {hasAction && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
                                    {actionLabel}
                                </Button>
                            )}
                            {hasRetry && (
                                <Button icon={<ReloadOutlined />} onClick={onRetry}>
                                    {retryLabel}
                                </Button>
                            )}
                        </Space>
                    )}
                </Space>
            }
            {...rest}
        />
    );
};

export default memo(AdminEmpty);
