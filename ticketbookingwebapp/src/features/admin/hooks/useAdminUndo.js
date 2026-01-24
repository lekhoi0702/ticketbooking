import { useState, useCallback } from 'react';

/**
 * Hook cho undo tạm thời (trong phiên).
 * Ghi nhận thao tác "thêm mới", undo = xóa bản ghi vừa tạo + refetch.
 */
const useAdminUndo = ({ onDelete, onRefetch, onSuccess, onError }) => {
    const [lastCreatedId, setLastCreatedId] = useState(null);
    const [undoing, setUndoing] = useState(false);

    const recordCreate = useCallback((id) => {
        setLastCreatedId(id);
    }, []);

    const clear = useCallback(() => {
        setLastCreatedId(null);
    }, []);

    const undo = useCallback(async () => {
        if (!lastCreatedId || !onDelete) return;
        setUndoing(true);
        try {
            await onDelete(lastCreatedId);
            if (typeof onRefetch === 'function') await onRefetch();
            setLastCreatedId(null);
            if (typeof onSuccess === 'function') onSuccess();
        } catch (e) {
            if (typeof onError === 'function') onError(e);
        } finally {
            setUndoing(false);
        }
    }, [lastCreatedId, onDelete, onRefetch, onSuccess, onError]);

    return {
        canUndo: Boolean(lastCreatedId),
        undo,
        recordCreate,
        clear,
        undoing,
    };
};

export default useAdminUndo;
