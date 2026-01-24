import React, { memo } from 'react';
import { Space, Input, Select, DatePicker, Button, Divider, Row, Col } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import AdminToolbar from './AdminToolbar';

const { RangePicker } = DatePicker;

const FILTER_TYPES = {
    SEARCH: 'search',
    SELECT: 'select',
    DATE_RANGE: 'dateRange',
};

const AdminFilterBar = ({
    filters = [],
    onClear,
    onUndo,
    onAdd,
    onRefresh,
    addLabel,
    undoDisabled,
    undoLoading,
    refreshLoading,
    refreshDisabled,
    addDisabled,
    bulkActions,
    extra,
    layout = 'flex',
    gutter = 16,
    className,
    style,
}) => {
    const hasFilters = filters.length > 0;
    const hasBulkActions = bulkActions && React.isValidElement(bulkActions);
    const hasExtra = extra && (React.isValidElement(extra) || Array.isArray(extra));

    const handleClear = () => {
        filters.forEach((f) => {
            if (f.onChange) f.onChange(null);
        });
        if (onClear) onClear();
    };

    const hasToolbar = [onUndo, onAdd, onRefresh].some((fn) => typeof fn === 'function');
    if (!hasFilters && !hasBulkActions && !hasExtra && !hasToolbar) return null;

    const filterNodes = filters.map((f, idx) => {
        if (f.type === FILTER_TYPES.SEARCH) {
            return (
                <Input
                    key={f.key || idx}
                    placeholder={f.placeholder ?? 'Tìm kiếm...'}
                    prefix={f.prefix ?? <SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={f.value}
                    onChange={(e) => f.onChange?.(e.target.value)}
                    allowClear
                    size="large"
                    style={f.style ?? { minWidth: 200 }}
                    {...f.inputProps}
                />
            );
        }
        if (f.type === FILTER_TYPES.SELECT) {
            return (
                <Select
                    key={f.key || idx}
                    placeholder={f.placeholder ?? 'Chọn...'}
                    value={f.value}
                    onChange={f.onChange}
                    allowClear
                    size="large"
                    style={f.style ?? { minWidth: 160 }}
                    options={f.options}
                    {...f.selectProps}
                />
            );
        }
        if (f.type === FILTER_TYPES.DATE_RANGE) {
            return (
                <RangePicker
                    key={f.key || idx}
                    value={f.value}
                    onChange={f.onChange}
                    size="large"
                    style={f.style}
                    {...f.dateProps}
                />
            );
        }
        return typeof f.render === 'function' ? f.render() : null;
    });

    const left = (
        <Space size="middle" wrap>
            {hasFilters && filterNodes}
            {hasBulkActions && (
                <>
                    {hasFilters && <Divider type="vertical" />}
                    {bulkActions}
                </>
            )}
        </Space>
    );

    const right = (
        <Space>
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
            {hasFilters && onClear && (
                <Button icon={<ClearOutlined />} onClick={handleClear} size="large">
                    Xóa bộ lọc
                </Button>
            )}
            {hasExtra && (Array.isArray(extra) ? <>{extra}</> : extra)}
        </Space>
    );

    if (layout === 'grid') {
        return (
            <Row gutter={gutter} className={className} style={style}>
                <Col flex="1">{left}</Col>
                <Col>{right}</Col>
            </Row>
        );
    }

    return (
        <div
            className={className}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                ...style,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                {left}
            </div>
            <div>{right}</div>
        </div>
    );
};

export default memo(AdminFilterBar);
export { FILTER_TYPES };
