import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper to get storage key prefix based on current URL or user role
const getScopePrefix = (role) => {
    if (role) {
        if (role === 'ADMIN') return 'admin_';
        if (role === 'ORGANIZER') return 'org_';
        return 'user_';
    }
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return 'admin_';
    if (path.startsWith('/organizer')) return 'org_';
    return 'user_';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    useEffect(() => {
        const prefix = getScopePrefix();
        const savedToken = localStorage.getItem(`${prefix}token`);
        const savedUser = localStorage.getItem(`${prefix}user`);

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, userToken) => {
        const prefix = getScopePrefix(userData.role);
        setUser(userData);
        setToken(userToken);
        localStorage.setItem(`${prefix}token`, userToken);
        localStorage.setItem(`${prefix}user`, JSON.stringify(userData));
        setShowLoginModal(false);
    };

    const logout = () => {
        const prefix = getScopePrefix(user?.role);
        setUser(null);
        setToken(null);
        localStorage.removeItem(`${prefix}token`);
        localStorage.removeItem(`${prefix}user`);
    };

    const triggerLogin = () => setShowLoginModal(true);

    return (
        <AuthContext.Provider value={{
            user, token, login, logout,
            isAuthenticated: !!token, loading,
            showLoginModal, setShowLoginModal, triggerLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
