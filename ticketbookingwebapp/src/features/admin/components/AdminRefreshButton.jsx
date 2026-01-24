import React, { memo } from 'react';
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

/**
 * Nút "Làm mới" thống nhất cho tất cả trang admin.
 * Luôn dùng icon ReloadOutlined, size middle, nhãn "Làm mới".
 */
const AdminRefreshButton = ({ onClick, disabled, loading, ...rest }) => (
    <Button
        icon={<ReloadOutlined />}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        size="middle"
        {...rest}
    >
        Làm mới
    </Button>
);

export default memo(AdminRefreshButton);
