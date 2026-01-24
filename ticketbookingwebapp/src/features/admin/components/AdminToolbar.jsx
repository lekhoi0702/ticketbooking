import React, { memo } from 'react';
import { Space, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import AdminUndoButton from './AdminUndoButton';
import AdminRefreshButton from './AdminRefreshButton';

/**
 * Toolbar thống nhất: Hoàn tác | Thêm mới | Làm mới | [Extra Actions].
 * Mỗi nút chỉ hiển thị khi có handler tương ứng.
 */
const AdminToolbar = ({
    onUndo,
    onAdd,
    onRefresh,
    addLabel = 'Thêm mới',
    undoDisabled,
    undoLoading,
    refreshLoading,
    refreshDisabled,
    addDisabled,
    extraActions,
    className,
    style,
}) => {
    const hasUndo = typeof onUndo === 'function';
    const hasAdd = typeof onAdd === 'function';
    const hasRefresh = typeof onRefresh === 'function';
    const hasExtraActions = extraActions && (Array.isArray(extraActions) ? extraActions.length > 0 : React.isValidElement(extraActions));

    if (!hasUndo && !hasAdd && !hasRefresh && !hasExtraActions) return null;

    return (
        <Space size="middle" wrap className={className} style={style}>
            {hasUndo && (
                <AdminUndoButton
                    onClick={onUndo}
                    disabled={undoDisabled}
                    loading={undoLoading}
                />
            )}
            {hasAdd && (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={onAdd}
                    disabled={addDisabled}
                    size="middle"
                >
                    {addLabel}
                </Button>
            )}
            {hasRefresh && (
                <AdminRefreshButton
                    onClick={onRefresh}
                    loading={refreshLoading}
                    disabled={refreshDisabled}
                />
            )}
            {hasExtraActions && (
                <>
                    {Array.isArray(extraActions) ? extraActions.map((action, idx) => (
                        <React.Fragment key={idx}>{action}</React.Fragment>
                    )) : extraActions}
                </>
            )}
        </Space>
    );
};

export default memo(AdminToolbar);
