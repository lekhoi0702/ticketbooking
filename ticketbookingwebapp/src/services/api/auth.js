import { API_BASE_URL } from '@shared/constants';

/** Map English (or legacy) backend messages to Vietnamese for user-facing notifications. */
const MSG_VI = {
    'Invalid email or password': 'Email hoặc mật khẩu không đúng',
    'Token has expired': 'Phiên đăng nhập đã hết hạn',
    'Invalid or malformed token': 'Token không hợp lệ',
    "You don't have permission to access this resource": 'Bạn không có quyền truy cập tài nguyên này',
    'Authentication required': 'Vui lòng đăng nhập',
    'Resource not found': 'Không tìm thấy tài nguyên',
    'The requested resource was not found': 'Không tìm thấy tài nguyên',
    'An internal server error occurred': 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.',
    'An unexpected error occurred': 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
    'Method not allowed for this endpoint': 'Phương thức không được phép cho đường dẫn này',
};
const mapToVietnamese = (msg) => {
    if (!msg || typeof msg !== 'string') return msg;
    const t = msg.trim();
    const mapped = MSG_VI[t] ?? (t.toLowerCase().includes('already exists') ? 'Email hoặc số điện thoại đã được sử dụng' : null);
    return mapped ?? msg;
};

export const authApi = {
    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            
            if (!response.ok) {
                let errorMessage = 'Đăng nhập không thành công';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        // Backend returns: { success: false, error: { code, message } }
                        let raw = errorMessage;
                        if (errorData.error && errorData.error.message) raw = errorData.error.message;
                        else if (errorData.message) raw = errorData.message;
                        else if (errorData.error) raw = typeof errorData.error === 'string' ? errorData.error : raw;
                        errorMessage = mapToVietnamese(raw) || raw;
                    } else {
                        const text = await response.text();
                        errorMessage = mapToVietnamese(text) || text || errorMessage;
                    }
                } catch (e) {
                    // If parsing fails, use status-based messages
                    if (response.status === 401) {
                        errorMessage = 'Email/Số điện thoại hoặc mật khẩu không đúng';
                    } else if (response.status === 403) {
                        errorMessage = 'Bạn không có quyền truy cập';
                    } else if (response.status >= 500) {
                        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
                    } else if (response.status === 0 || response.status === 404) {
                        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.';
                    }
                }
                const error = new Error(errorMessage);
                error.status = response.status;
                throw error;
            }
            return await response.json();
        } catch (error) {
            // Handle network errors
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa (port 5000).');
            }
            throw error;
        }
    },

    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            let errorMessage = 'Đăng ký không thành công';
            let errorData = null;
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    // Backend returns: { success: false, error: { code, message, field, value } }
                    let raw = 'Đăng ký không thành công';
                    if (error.error && error.error.message) {
                        raw = error.error.message;
                        errorData = error.error;
                    } else if (error.message) raw = error.message;
                    else if (error.error) raw = typeof error.error === 'string' ? error.error : raw;
                    errorMessage = mapToVietnamese(raw) || raw;
                } else {
                    const text = await response.text();
                    errorMessage = mapToVietnamese(text) || text || errorMessage;
                }
            } catch (e) {
                // If parsing fails, use status-based messages
                if (response.status === 409) {
                    errorMessage = 'Email hoặc số điện thoại đã được sử dụng';
                } else if (response.status === 400) {
                    errorMessage = 'Thông tin đăng ký không hợp lệ';
                } else if (response.status >= 500) {
                    errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
                } else if (response.status === 0 || response.status === 404) {
                    errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.';
                }
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = errorData; // Attach error data for field-specific handling
            throw error;
        }
        return await response.json();
    },

    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: newPassword })
            });

            if (!response.ok) {
                let errorMessage = 'Đặt lại mật khẩu không thành công';
                try {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const errorData = await response.json();
                        let raw = errorMessage;
                        if (errorData.error && errorData.error.message) raw = errorData.error.message;
                        else if (errorData.message) raw = errorData.message;
                        errorMessage = mapToVietnamese(raw) || raw;
                    }
                } catch (e) {
                    if (response.status === 401 || response.status === 403) {
                        errorMessage = 'Token không hợp lệ hoặc đã hết hạn';
                    } else if (response.status === 404) {
                        errorMessage = 'Token không tồn tại';
                    }
                }
                const err = new Error(errorMessage);
                err.status = response.status;
                throw err;
            }

            const data = await response.json();
            return data;
        } catch (err) {
            if (err instanceof TypeError && err.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa (port 5000).');
            }
            throw err;
        }
    },

    async forgotPassword(email) {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: (email || '').trim() })
        });
        if (!response.ok) {
            let errorMessage = 'Không thể gửi email khôi phục mật khẩu';
            try {
                const ct = response.headers.get('content-type');
                if (ct && ct.includes('application/json')) {
                    const err = await response.json();
                    const raw = err?.error?.message || err?.message || errorMessage;
                    errorMessage = mapToVietnamese(raw) || raw;
                }
            } catch (_) {}
            const e = new Error(errorMessage);
            e.status = response.status;
            throw e;
        }
        return await response.json();
    },

    async checkResetToken(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/check-reset-token?token=${encodeURIComponent(token)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            return data;
        } catch (err) {
            if (err instanceof TypeError && err.message.includes('fetch')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa (port 5000).');
            }
            throw err;
        }
    },

    async changePassword(data, tokenOverride) {
        const path = typeof window !== 'undefined' ? window.location?.pathname || '' : '';
        const prefix = path.startsWith('/admin') ? 'admin_' : path.startsWith('/organizer') ? 'org_' : 'user_';
        const token = tokenOverride ?? localStorage.getItem(`${prefix}token`) ?? localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            let errorMessage = 'Đổi mật khẩu không thành công';
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const err = await response.json();
                    // Backend returns: { success: false, error: { code, message } }
                    let raw = errorMessage;
                    if (err.error && err.error.message) raw = err.error.message;
                    else if (err.message) raw = err.message;
                    else if (err.error) raw = typeof err.error === 'string' ? err.error : raw;
                    errorMessage = mapToVietnamese(raw) || raw;
                } else {
                    const text = await response.text();
                    errorMessage = mapToVietnamese(text) || text || errorMessage;
                }
            } catch (e) {
                // If parsing fails, use status-based messages
                if (response.status === 401) {
                    errorMessage = 'Mật khẩu hiện tại không đúng';
                } else if (response.status === 400) {
                    errorMessage = 'Thông tin không hợp lệ';
                } else if (response.status >= 500) {
                    errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
                } else if (response.status === 0 || response.status === 404) {
                    errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.';
                }
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    },
};
