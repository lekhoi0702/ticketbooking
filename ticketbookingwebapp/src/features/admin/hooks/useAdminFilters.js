import { useState, useCallback, useMemo } from 'react';

/**
 * Filter state for admin list pages.
 * @param {Object} options
 * @param {Object} [options.initial={}] - Initial filter values { search: '', status: null, ... }
 * @param {function} [options.filterFn] - Custom filter function (data, filters) => filteredData
 */
const useAdminFilters = (options = {}) => {
    const { initial = {}, filterFn } = options;
    const [filters, setFilters] = useState(initial);

    const setFilter = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const setFiltersBatch = useCallback((next) => {
        setFilters((prev) => (typeof next === 'function' ? next(prev) : { ...prev, ...next }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(initial);
    }, [initial]);

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some((v) => {
            if (v == null || v === '') return false;
            if (Array.isArray(v)) return v.length > 0;
            return true;
        });
    }, [filters]);

    const applyFilters = useCallback(
        (data) => {
            if (!Array.isArray(data)) return data;
            if (filterFn && typeof filterFn === 'function') {
                return filterFn(data, filters);
            }
            return data;
        },
        [filters, filterFn]
    );

    return {
        filters,
        setFilter,
        setFiltersBatch,
        clearFilters,
        hasActiveFilters,
        applyFilters,
    };
};

export default useAdminFilters;
