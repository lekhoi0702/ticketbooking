import React, { memo } from 'react';
import { Table, Empty } from 'antd';
import { PAGINATION } from '../constants';
import AdminEmpty from './AdminEmpty';

const AdminTable = ({
    columns,
    dataSource,
    rowKey = 'id',
    loading = false,
    rowSelection,
    selectionType = 'single',
    selectedRowKeys,
    setSelectedRowKeys,
    pagination = true,
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    total,
    showSizeChanger = true,
    showTotal,
    locale,
    emptyText = 'Không có dữ liệu',
    emptyAction,
    emptyActionLabel,
    emptyRetry,
    scroll,
    size = 'middle',
    bordered = false,
    virtual = false,
    ...rest
}) => {
    const paginationConfig = pagination === false
        ? false
        : {
            pageSize: Number(pageSize) || PAGINATION.DEFAULT_PAGE_SIZE,
            showSizeChanger,
            pageSizeOptions: PAGINATION.PAGE_SIZE_OPTIONS,
            showTotal: showTotal ?? ((t) => `Tổng ${t} bản ghi`),
            total: total ?? (Array.isArray(dataSource) ? dataSource.length : 0),
            ...(typeof pagination === 'object' ? pagination : {}),
        };

    const EmptyComponent =
        emptyAction && emptyActionLabel ? (
            <AdminEmpty
                description={emptyText}
                actionLabel={emptyActionLabel}
                onAction={emptyAction}
                onRetry={emptyRetry}
                retryLabel="Thử lại"
            />
        ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
        );

    const mergedLocale = {
        emptyText: EmptyComponent,
        ...locale,
    };

    // Auto-generate rowSelection if selectedRowKeys and setSelectedRowKeys are provided
    const autoRowSelection = selectedRowKeys !== undefined && setSelectedRowKeys
        ? {
              type: selectionType === 'single' ? 'radio' : 'checkbox',
              selectedRowKeys,
              onChange: (keys) => {
                  if (selectionType === 'single') {
                      setSelectedRowKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
                  } else {
                      setSelectedRowKeys(keys);
                  }
              },
          }
        : undefined;

    const mergedRowSelection = rowSelection
        ? {
              ...rowSelection,
              type: selectionType === 'single' ? 'radio' : selectionType === 'multiple' ? 'checkbox' : rowSelection.type || 'checkbox',
          }
        : autoRowSelection;

    return (
        <Table
            columns={columns}
            dataSource={dataSource}
            rowKey={rowKey}
            loading={loading}
            rowSelection={mergedRowSelection}
            pagination={paginationConfig}
            locale={mergedLocale}
            scroll={scroll}
            size={size}
            bordered={bordered}
            virtual={virtual}
            {...rest}
        />
    );
};

export default memo(AdminTable);
