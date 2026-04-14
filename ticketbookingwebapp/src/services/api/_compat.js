import { API_BASE_URL } from '@shared/constants';

const toSnakeKey = (key) =>
    key
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/-/g, '_')
        .toLowerCase();

const toPascalKey = (key) => {
    if (!key) return key;
    if (/^[A-Z][A-Za-z0-9]*$/.test(key)) return key;
    return String(key)
        .replace(/[_-\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (c) => c.toUpperCase());
};

const normalizeValue = (value) => {
    if (Array.isArray(value)) {
        return value.map(normalizeValue);
    }
    if (value && typeof value === 'object') {
        const out = {};
        Object.entries(value).forEach(([k, v]) => {
            const normalized = normalizeValue(v);
            out[k] = normalized;

            const snakeKey = toSnakeKey(k);
            if (snakeKey !== k && !Object.prototype.hasOwnProperty.call(out, snakeKey)) {
                out[snakeKey] = normalized;
            }

            const pascalKey = toPascalKey(k);
            if (pascalKey !== k && !Object.prototype.hasOwnProperty.call(out, pascalKey)) {
                out[pascalKey] = normalized;
            }
        });
        return out;
    }
    return value;
};

const extractMessage = (raw, fallback = 'Request failed') => {
    if (!raw) return fallback;
    if (typeof raw === 'string') return raw;
    return raw.Message || raw.message || raw.error?.message || raw.error || fallback;
};

export const normalizeResponse = (raw, ok = true, status = 200) => {
    if (raw && typeof raw === 'object') {
        if (Object.prototype.hasOwnProperty.call(raw, 'Success')) {
            return {
                success: !!raw.Success,
                data: normalizeValue(raw.Data),
                message: raw.Message || '',
                status,
            };
        }
        if (Object.prototype.hasOwnProperty.call(raw, 'success')) {
            return {
                success: !!raw.success,
                data: normalizeValue(raw.data),
                message: raw.message || '',
                status,
            };
        }
        return {
            success: ok,
            data: normalizeValue(raw),
            message: ok ? '' : extractMessage(raw),
            status,
        };
    }

    return {
        success: ok,
        data: normalizeValue(raw),
        message: ok ? '' : extractMessage(raw),
        status,
    };
};

export const apiRequest = async (path, options = {}) => {
    const {
        method = 'GET',
        query,
        body,
        headers = {},
    } = options;

    const queryString = query ? `?${new URLSearchParams(query).toString()}` : '';
    const url = `${API_BASE_URL}${path}${queryString}`;

    const requestHeaders = { ...headers };
    const requestInit = {
        method,
        headers: requestHeaders,
    };

    if (body !== undefined) {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        if (isFormData) {
            // Let browser set multipart boundary automatically.
            requestInit.body = body;
        } else {
            requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
            requestInit.body = requestHeaders['Content-Type'] === 'application/json' ? JSON.stringify(body) : body;
        }
    }

    try {
        const response = await fetch(url, requestInit);
        const contentType = response.headers.get('content-type') || '';

        let raw = null;
        if (contentType.includes('application/json')) {
            raw = await response.json();
        } else {
            const text = await response.text();
            raw = text || null;
        }

        const normalized = normalizeResponse(raw, response.ok, response.status);
        if (!response.ok && !normalized.message) {
            normalized.message = `HTTP ${response.status}`;
        }
        return normalized;
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error?.message || 'Network error',
            status: 0,
        };
    }
};

export const unsupported = (message = 'Tính năng này tạm thời chưa hỗ trợ ở backend mới.') => ({
    success: false,
    data: null,
    message,
});

export const mapRole = (user) => {
    const roleName = String(user?.role_name || user?.RoleName || '').toLowerCase();
    const roleId = Number(user?.role_id ?? user?.RoleID);
    if (roleName.includes('admin') || roleId === 1) return 'ADMIN';
    if (roleName.includes('organizer') || roleId === 2) return 'ORGANIZER';
    return 'USER';
};
