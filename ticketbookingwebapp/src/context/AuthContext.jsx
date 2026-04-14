import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@services/api';

const AuthContext = createContext(null);
const SESSION_USER_KEY = 'session_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    
    // Redirect intent: stores where user wants to go after login
    // { path: string, state?: object, action?: string }
    const [redirectIntent, setRedirectIntent] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem(SESSION_USER_KEY);

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        // Clean up legacy multi-scope keys from the previous auth model.
        ['admin_', 'org_', 'user_'].forEach((prefix) => {
            localStorage.removeItem(`${prefix}user`);
            localStorage.removeItem(`${prefix}token`);
            localStorage.removeItem(`${prefix}refresh_token`);
        });
        setLoading(false);
    }, []);

    const login = (userData) => {
        if (!userData) {
            console.error('Login failed: userData is missing');
            return;
        }
        setUser(userData);
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(userData));
        setShowLoginModal(false);
    };

    const logout = useCallback(async () => {
        try {
            await api.logout();
        } catch (error) {
            console.warn('Logout API failed, clearing local session anyway.', error);
        }
        setUser(null);
        localStorage.removeItem(SESSION_USER_KEY);
    }, []);

    const updateUser = useCallback((patches) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...patches };
            try {
                const raw = localStorage.getItem(SESSION_USER_KEY);
                const stored = raw ? JSON.parse(raw) : {};
                localStorage.setItem(SESSION_USER_KEY, JSON.stringify({ ...stored, ...patches }));
            } catch (_) {}
            return updated;
        });
    }, []);

    // Trigger login with optional redirect intent
    // Usage: triggerLogin() or triggerLogin({ path: '/checkout/123', state: {...}, action: 'checkout' })
    const triggerLogin = useCallback((intent = null) => {
        if (intent) {
            setRedirectIntent(intent);
        }
        setShowLoginModal(true);
    }, []);

    // Clear redirect intent after it's been used
    const clearRedirectIntent = useCallback(() => {
        setRedirectIntent(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            user, login, logout, updateUser,
            isAuthenticated: !!user, loading,
            showLoginModal, setShowLoginModal, triggerLogin,
            redirectIntent, setRedirectIntent, clearRedirectIntent
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
