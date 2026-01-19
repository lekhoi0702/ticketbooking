import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { eventApi } from '@services/api/event';

const FavoriteContext = createContext(null);

export const FavoriteProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFavorites = useCallback(async () => {
        if (!user || !token) {
            setFavorites([]);
            return;
        }

        try {
            setLoading(true);
            const userId = user.user_id || user.id;
            const response = await eventApi.getFavoriteEventIds(userId, token);
            if (response.success) {
                setFavorites(response.data);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const toggleFavorite = async (eventId) => {
        if (!user || !token) {
            return { success: false, message: 'Vui lòng đăng nhập để thực hiện chức năng này' };
        }

        try {
            const userId = user.user_id || user.id;
            const response = await eventApi.toggleFavorite(userId, eventId, token);

            if (response.success) {
                const isFavorite = response.is_favorite;
                if (isFavorite) {
                    setFavorites(prev => [...prev, eventId]);
                } else {
                    setFavorites(prev => prev.filter(id => id !== eventId));
                }
                return { success: true, isFavorite, message: response.message };
            }
            return { success: false, message: response.message };
        } catch (error) {
            console.error('Error toggling favorite:', error);
            return { success: false, message: 'Đã có lỗi xảy ra' };
        }
    };

    const isFavorited = (eventId) => favorites.includes(eventId);

    return (
        <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorited, loading, refreshFavorites: fetchFavorites }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoriteContext);
