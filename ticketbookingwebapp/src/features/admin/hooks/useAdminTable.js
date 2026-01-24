import { useState, useCallback, useMemo } from 'react';
import { PAGINATION } from '../constants';

/**
 * Table state for admin pages: row selection, pagination, sorting.
 * @param {Object} options
 * @param {string} [options.rowKey='id'] - Row key field
 * @param {number} [options.pageSize] - Default page size
 * @param {boolean} [options.enableSelection=true] - Enable row selection
 * @param {string} [options.selectionType='single'] - Selection type: 'single' or 'multiple'
 */
const useAdminTable = ({
    rowKey = 'id',
    pageSize = PAGINATION.DEFAULT_PAGE_SIZE,
    enableSelection = true,
    selectionType = 'single',
} = {}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: Number(pageSize) || PAGINATION.DEFAULT_PAGE_SIZE,
        total: 0,
    });
    const [sorter, setSorter] = useState(null);
    const [filters, setFilters] = useState({});

    const clearSelection = useCallback(() => {
        setSelectedRowKeys([]);
    }, []);

    const handleSelectionChange = useCallback((keys) => {
        if (selectionType === 'single') {
            setSelectedRowKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
        } else {
            setSelectedRowKeys(keys);
        }
    }, [selectionType]);

    const handleTableChange = useCallback((pag, filt, sort) => {
        if (pag) {
            setPagination((prev) => ({
                ...prev,
                current: pag.current,
                pageSize: pag.pageSize ?? prev.pageSize,
                total: pag.total ?? prev.total,
            }));
        }
        if (filt) setFilters(filt);
        if (sort && sort.field) {
            setSorter({
                field: sort.field,
                order: sort.order,
            });
        } else {
            setSorter(null);
        }
    }, []);

    const rowSelection = useMemo(() => {
        if (!enableSelection) return undefined;
        return {
            type: selectionType === 'single' ? 'radio' : 'checkbox',
            selectedRowKeys,
            onChange: handleSelectionChange,
        };
    }, [enableSelection, selectionType, selectedRowKeys, handleSelectionChange]);

    const selectedRows = useCallback(
        (dataSource) => {
            if (!Array.isArray(dataSource) || !enableSelection) return [];
            const key = rowKey;
            return dataSource.filter((row) => selectedRowKeys.includes(row[key]));
        },
        [enableSelection, rowKey, selectedRowKeys]
    );

    const getFirstSelected = useCallback(
        (dataSource) => {
            const rows = selectedRows(dataSource);
            return rows.length > 0 ? rows[0] : null;
        },
        [selectedRows]
    );

    return {
        selectedRowKeys,
        setSelectedRowKeys,
        clearSelection,
        pagination,
        setPagination,
        sorter,
        filters,
        rowSelection,
        handleTableChange,
        selectedRows,
        getFirstSelected,
    };
};

export default useAdminTable;
