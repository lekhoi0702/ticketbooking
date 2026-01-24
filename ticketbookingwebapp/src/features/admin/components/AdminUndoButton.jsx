import React, { memo } from 'react';
import { Button } from 'antd';
import { UndoOutlined } from '@ant-design/icons';

/**
 * Nút "Hoàn tác" (Undo) thống nhất cho toolbar admin.
 * Dùng cho undo tạm thời trong phiên (session).
 */
const AdminUndoButton = ({ onClick, disabled, loading, ...rest }) => (
    <Button
        icon={<UndoOutlined />}
        onClick={onClick}
        disabled={disabled}
        loading={loading}
        size="middle"
        {...rest}
    >
        Hoàn tác
    </Button>
);

export default memo(AdminUndoButton);
