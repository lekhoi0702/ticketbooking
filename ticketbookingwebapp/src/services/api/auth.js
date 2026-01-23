import { API_BASE_URL } from '@shared/constants';

export const authApi = {
    async login(credentials) {
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
                    const error = await response.json();
                    errorMessage = error.message || error.error || errorMessage;
                } else {
                    const text = await response.text();
                    errorMessage = text || errorMessage;
                }
            } catch (e) {
                // If parsing fails, use status-based messages
                if (response.status === 401) {
                    errorMessage = 'Email/Số điện thoại hoặc mật khẩu không đúng';
                } else if (response.status === 403) {
                    errorMessage = 'Bạn không có quyền truy cập';
                } else if (response.status >= 500) {
                    errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
                }
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }
        return await response.json();
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
                    if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                        errorData = error.error;
                    } else if (error.message) {
                        errorMessage = error.message;
                    } else if (error.error) {
                        errorMessage = typeof error.error === 'string' ? error.error : 'Đăng ký không thành công';
                    }
                } else {
                    const text = await response.text();
                    errorMessage = text || errorMessage;
                }
            } catch (e) {
                // If parsing fails, use status-based messages
                if (response.status === 409) {
                    errorMessage = 'Email hoặc số điện thoại đã được sử dụng';
                } else if (response.status === 400) {
                    errorMessage = 'Thông tin đăng ký không hợp lệ';
                } else if (response.status >= 500) {
                    errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
                }
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = errorData; // Attach error data for field-specific handling
            throw error;
        }
        return await response.json();
    },

    async changePassword(data) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            let errorMessage = 'Đổi mật khẩu không thành công';
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const error = await response.json();
                    errorMessage = error.message || error.error || errorMessage;
                } else {
                    const text = await response.text();
                    errorMessage = text || errorMessage;
                }
            } catch (e) {
                // If parsing fails, use status-based messages
                if (response.status === 401) {
                    errorMessage = 'Mật khẩu hiện tại không đúng';
                } else if (response.status === 400) {
                    errorMessage = 'Thông tin không hợp lệ';
                } else if (response.status >= 500) {
                    errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau';
                }
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }
        return await response.json();
    },
};
