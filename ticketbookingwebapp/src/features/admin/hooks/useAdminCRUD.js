import { useState, useCallback } from 'react';
import { message } from 'antd';

/**
 * Generic CRUD hook for admin pages.
 * @param {Object} options
 * @param {() => Promise<{ success: boolean; data?: any; message?: string }>} options.fetchList - Fetch list
 * @param {(payload: any) => Promise<{ success: boolean; message?: string }>} [options.create] - Create
 * @param {(id: string|number, payload: any) => Promise<{ success: boolean; message?: string }>} [options.update] - Update
 * @param {(id: string|number) => Promise<{ success: boolean; message?: string }>} [options.remove] - Delete
 * @param {string} [options.entityName] - Entity name for messages (e.g. 'danh mục', 'banner')
 * @param {boolean} [options.refreshOnMutate=true] - Refresh list after create/update/delete
 */
const useAdminCRUD = ({
    fetchList,
    create,
    update,
    remove,
    entityName = 'mục',
    refreshOnMutate = true,
}) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchList();
            if (res?.success && Array.isArray(res.data)) {
                setData(res.data);
            }
        } catch (err) {
            console.error('useAdminCRUD fetch error:', err);
            setError(err);
            message.error(err?.message || `Không thể tải danh sách ${entityName}`);
        } finally {
            setLoading(false);
        }
    }, [fetchList, entityName]);

    const createItem = useCallback(
        async (payload) => {
            if (!create) return { success: false };
            try {
                setSubmitting(true);
                const res = await create(payload);
                if (res?.success) {
                    message.success(`Tạo ${entityName} thành công`);
                    if (refreshOnMutate) await load();
                    return { success: true };
                }
                message.error(res?.message || `Lỗi khi tạo ${entityName}`);
                return { success: false };
            } catch (err) {
                console.error('useAdminCRUD create error:', err);
                message.error(err?.message || `Lỗi khi tạo ${entityName}`);
                return { success: false };
            } finally {
                setSubmitting(false);
            }
        },
        [create, entityName, load, refreshOnMutate]
    );

    const updateItem = useCallback(
        async (id, payload) => {
            if (!update) return { success: false };
            try {
                setSubmitting(true);
                const res = await update(id, payload);
                if (res?.success) {
                    message.success(`Cập nhật ${entityName} thành công`);
                    if (refreshOnMutate) await load();
                    return { success: true };
                }
                message.error(res?.message || `Lỗi khi cập nhật ${entityName}`);
                return { success: false };
            } catch (err) {
                console.error('useAdminCRUD update error:', err);
                message.error(err?.message || `Lỗi khi cập nhật ${entityName}`);
                return { success: false };
            } finally {
                setSubmitting(false);
            }
        },
        [update, entityName, load, refreshOnMutate]
    );

    const removeItem = useCallback(
        async (id) => {
            if (!remove) return { success: false };
            try {
                setSubmitting(true);
                const res = await remove(id);
                if (res?.success) {
                    message.success(`Xóa ${entityName} thành công`);
                    if (refreshOnMutate) await load();
                    return { success: true };
                }
                message.error(res?.message || `Lỗi khi xóa ${entityName}`);
                return { success: false };
            } catch (err) {
                console.error('useAdminCRUD remove error:', err);
                message.error(err?.message || `Lỗi khi xóa ${entityName}`);
                return { success: false };
            } finally {
                setSubmitting(false);
            }
        },
        [remove, entityName, load, refreshOnMutate]
    );

    return {
        data,
        loading,
        submitting,
        error,
        load,
        createItem,
        updateItem,
        removeItem,
        setData,
    };
};

export default useAdminCRUD;
