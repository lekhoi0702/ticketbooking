import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@services/api';

const AuthContext = createContext(null);
const USER_SESSION_KEY = 'user_session';
const ADMIN_SESSION_KEY = 'admin_session';
const ORGANIZER_SESSION_KEY = 'organizer_session';
const LEGACY_SESSION_KEY = 'session_user';

const safeParse = (value) => {
    try {
        return value ? JSON.parse(value) : null;
    } catch (_) {
        return null;
    }
};

const getRoleKey = (role = '') => {
    const normalized = String(role).toUpperCase();
    if (normalized === 'ADMIN') return ADMIN_SESSION_KEY;
    if (normalized === 'ORGANIZER') return ORGANIZER_SESSION_KEY;
    return USER_SESSION_KEY;
};

const clearSessionByKey = (key) => {
    localStorage.removeItem(key);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [organizer, setOrganizer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [redirectIntent, setRedirectIntent] = useState(null);

    useEffect(() => {
        const savedUser = safeParse(localStorage.getItem(USER_SESSION_KEY));
        const savedAdmin = safeParse(localStorage.getItem(ADMIN_SESSION_KEY));
        const savedOrganizer = safeParse(localStorage.getItem(ORGANIZER_SESSION_KEY));

        if (savedUser) setUser(savedUser);
        if (savedAdmin) setAdmin(savedAdmin);
        if (savedOrganizer) setOrganizer(savedOrganizer);

        const legacySession = safeParse(localStorage.getItem(LEGACY_SESSION_KEY));
        if (legacySession?.role) {
            const roleKey = getRoleKey(legacySession.role);
            localStorage.setItem(roleKey, JSON.stringify(legacySession));
            if (roleKey === USER_SESSION_KEY) setUser(legacySession);
            if (roleKey === ADMIN_SESSION_KEY) setAdmin(legacySession);
            if (roleKey === ORGANIZER_SESSION_KEY) setOrganizer(legacySession);
            localStorage.removeItem(LEGACY_SESSION_KEY);
        }

        ['admin_', 'org_', 'user_'].forEach((prefix) => {
            localStorage.removeItem(`${prefix}user`);
            localStorage.removeItem(`${prefix}token`);
            localStorage.removeItem(`${prefix}refresh_token`);
        });

        setLoading(false);
    }, []);

    const login = useCallback((userData) => {
        if (!userData) {
            console.error('Login failed: userData is missing');
            return;
        }

        const role = String(userData.role || 'USER').toUpperCase();
        const sessionKey = getRoleKey(role);

        if (sessionKey === ADMIN_SESSION_KEY) {
            setAdmin(userData);
        } else if (sessionKey === ORGANIZER_SESSION_KEY) {
            setOrganizer(userData);
        } else {
            setUser(userData);
        }

        localStorage.setItem(sessionKey, JSON.stringify(userData));
        setShowLoginModal(false);
    }, []);

    const loginUser = useCallback((userData) => {
        if (!userData) return;
        setUser(userData);
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
        setShowLoginModal(false);
    }, []);

    const loginAdmin = useCallback((userData) => {
        if (!userData) return;
        setAdmin(userData);
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(userData));
    }, []);

    const loginOrganizer = useCallback((userData) => {
        if (!userData) return;
        setOrganizer(userData);
        localStorage.setItem(ORGANIZER_SESSION_KEY, JSON.stringify(userData));
    }, []);

    const logoutUser = useCallback(async () => {
        try {
            await api.logout();
        } catch (error) {
            console.warn('Logout API failed, clearing local session anyway.', error);
        }
        setUser(null);
        clearSessionByKey(USER_SESSION_KEY);
    }, []);

    const logoutAdmin = useCallback(async () => {
        try {
            await api.logout();
        } catch (error) {
            console.warn('Logout API failed, clearing local session anyway.', error);
        }
        setAdmin(null);
        clearSessionByKey(ADMIN_SESSION_KEY);
    }, []);

    const logoutOrganizer = useCallback(async () => {
        try {
            await api.logout();
        } catch (error) {
            console.warn('Logout API failed, clearing local session anyway.', error);
        }
        setOrganizer(null);
        clearSessionByKey(ORGANIZER_SESSION_KEY);
    }, []);

    const updateUser = useCallback((patches) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...patches };
            try {
                const raw = localStorage.getItem(USER_SESSION_KEY);
                const stored = raw ? JSON.parse(raw) : {};
                localStorage.setItem(USER_SESSION_KEY, JSON.stringify({ ...stored, ...patches }));
            } catch (_) {}
            return updated;
        });
    }, []);

    const updateAdmin = useCallback((patches) => {
        setAdmin((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...patches };
            try {
                const raw = localStorage.getItem(ADMIN_SESSION_KEY);
                const stored = raw ? JSON.parse(raw) : {};
                localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ ...stored, ...patches }));
            } catch (_) {}
            return updated;
        });
    }, []);

    const updateOrganizer = useCallback((patches) => {
        setOrganizer((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...patches };
            try {
                const raw = localStorage.getItem(ORGANIZER_SESSION_KEY);
                const stored = raw ? JSON.parse(raw) : {};
                localStorage.setItem(ORGANIZER_SESSION_KEY, JSON.stringify({ ...stored, ...patches }));
            } catch (_) {}
            return updated;
        });
    }, []);

    const triggerLogin = useCallback((intent = null) => {
        if (intent) {
            setRedirectIntent(intent);
        }
        setShowLoginModal(true);
    }, []);

    const clearRedirectIntent = useCallback(() => {
        setRedirectIntent(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            admin,
            organizer,
            login,
            loginUser,
            loginAdmin,
            loginOrganizer,
            logout: logoutUser,
            logoutUser,
            logoutAdmin,
            logoutOrganizer,
            updateUser,
            updateAdmin,
            updateOrganizer,
            isAuthenticated: !!user,
            userAuthenticated: !!user,
            adminAuthenticated: !!admin,
            organizerAuthenticated: !!organizer,
            loading,
            showLoginModal,
            setShowLoginModal,
            triggerLogin,
            redirectIntent,
            setRedirectIntent,
            clearRedirectIntent
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context) return context;

    return {
        user: null,
        admin: null,
        organizer: null,
        login: () => {},
        loginUser: () => {},
        loginAdmin: () => {},
        loginOrganizer: () => {},
        logout: async () => {},
        logoutUser: async () => {},
        logoutAdmin: async () => {},
        logoutOrganizer: async () => {},
        updateUser: () => {},
        updateAdmin: () => {},
        updateOrganizer: () => {},
        isAuthenticated: false,
        userAuthenticated: false,
        adminAuthenticated: false,
        organizerAuthenticated: false,
        loading: false,
        showLoginModal: false,
        setShowLoginModal: () => {},
        triggerLogin: () => {},
        redirectIntent: null,
        setRedirectIntent: () => {},
        clearRedirectIntent: () => {},
    };
};
