import { apiRequest, mapRole, unsupported } from './_compat';

const roleMatches = (actualRole, requiredRole) => {
    if (!requiredRole) return true;
    return actualRole === requiredRole;
};

const buildSessionPayload = (user) => {
    const role = mapRole(user);
    return {
        user: { ...user, role },
    };
};

const SESSION_KEYS = ['user_session', 'admin_session', 'organizer_session', 'session_user'];

export const authApi = {
    async login(credentials = {}) {
        const invalidLoginMessage = 'Sai thông tin đăng nhập.';
        const email = credentials.email || credentials.Email;
        const password = credentials.password || credentials.Password;

        const res = await apiRequest('/auth/login', {
            method: 'POST',
            body: {
                Email: email,
                Password: password,
                RequiredRole: credentials.required_role || credentials.RequiredRole || null,
            },
        });

        if (!res.success || !res.data) {
            return { success: false, data: null, message: invalidLoginMessage };
        }

        const sessionData = buildSessionPayload(res.data);
        const role = sessionData.user.role;
        if (!roleMatches(role, credentials.required_role)) {
            return {
                success: false,
                data: null,
                message: invalidLoginMessage,
            };
        }

        return {
            success: true,
            data: sessionData,
            message: 'Đăng nhập thành công',
        };
    },

    async register(userData = {}) {
        const payload = {
            Password: userData.password || userData.Password,
            RoleID: userData.role_id || userData.RoleID || 3,
            Email: userData.email || userData.Email,
            Phone: userData.phone || userData.Phone,
            FullName: userData.full_name || userData.FullName,
            CreateID: userData.create_id || userData.CreateID || 1,
            Status: userData.status || userData.Status || 'Active',
        };

        const res = await apiRequest('/auth/register', {
            method: 'POST',
            body: payload,
        });

        if (!res.success) {
            return { ...res, message: res.message || 'Đăng ký không thành công' };
        }

        return {
            success: true,
            data: buildSessionPayload(res.data),
            message: 'Đăng ký thành công',
        };
    },

    async resetPassword() {
        return unsupported('Backend mới chưa hỗ trợ đặt lại mật khẩu qua token.');
    },

    async forgotPassword() {
        return {
            success: true,
            data: null,
            message: 'Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.',
        };
    },

    async checkResetToken() {
        return { success: false, data: null, message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' };
    },

    async changePassword(payload = {}) {
        let userId = payload.user_id || payload.UserID;
        if (!userId) {
            try {
                for (const key of SESSION_KEYS) {
                    const sessionRaw = localStorage.getItem(key);
                    if (!sessionRaw) continue;
                    const sessionUser = JSON.parse(sessionRaw);
                    userId = sessionUser?.user_id || sessionUser?.UserID || null;
                    if (userId) break;
                }
            } catch (_) {}
        }

        return apiRequest('/auth/change-password', {
            method: 'POST',
            body: {
                UserID: userId,
                OldPassword: payload.old_password || payload.OldPassword || null,
                NewPassword: payload.new_password || payload.NewPassword,
                Force: payload.force || payload.Force || false,
            },
        });
    },

    async logout() {
        return { success: true, data: null, message: 'Đăng xuất thành công' };
    },
};
