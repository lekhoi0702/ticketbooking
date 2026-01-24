import React, { memo } from 'react';
import { Space, Typography } from 'antd';
import AdminToolbar from './AdminToolbar';

const { Title, Text } = Typography;

const AdminPageHeader = ({
    title,
    subTitle,
    actions,
    onUndo,
    onAdd,
    addLabel = 'Thêm mới',
    onRefresh,
    undoDisabled,
    undoLoading,
    refreshLoading,
    refreshDisabled,
    addDisabled,
    extra,
    className,
    style,
}) => {
    const useToolbar = !actions && (onUndo || onAdd || onRefresh);
    const hasActions = (actions && (Array.isArray(actions) ? actions.length : true)) || useToolbar;

    const toolbar = useToolbar ? (
        <AdminToolbar
            onUndo={onUndo}
            onAdd={onAdd}
            onRefresh={onRefresh}
            addLabel={addLabel}
            undoDisabled={undoDisabled}
            undoLoading={undoLoading}
            refreshLoading={refreshLoading}
            refreshDisabled={refreshDisabled}
            addDisabled={addDisabled}
        />
    ) : null;

    const mergedActions = actions
        ? (Array.isArray(actions) ? actions : [actions])
        : toolbar;

    return (
        <div
            className={className}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                marginBottom: 24,
                ...style,
            }}
        >
            <div>
                {title && (
                    <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                        {title}
                    </Title>
                )}
                {subTitle && (
                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginTop: 4 }}>
                        {subTitle}
                    </Text>
                )}
                {extra}
            </div>
            {hasActions && (
                <Space size="middle" wrap>
                    {mergedActions}
                </Space>
            )}
        </div>
    );
};

export default memo(AdminPageHeader);
