import React, { useState, useEffect } from 'react';
import { Row, Col, Empty, Spin, message } from 'antd';
import { useAuth } from '@context/AuthContext';
import EventCard from '@features/user/components/Event/EventCard';
import { useFavorites } from '@context/FavoriteContext';
import { eventApi } from '@services/api/event';
import { transformEvent } from '@shared/utils/eventUtils';

const MyFavoritesTab = () => {
    const { user, token } = useAuth();
    const { favorites } = useFavorites();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavoriteEvents = async () => {
            if (!user || !token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const userId = user.user_id || user.id;
                const response = await eventApi.getFavoriteEvents(userId, token);

                if (response.success) {
                    const mappedEvents = response.data.map(event => transformEvent(event));
                    setEvents(mappedEvents);
                }
            } catch (error) {
                console.error('Error fetching favorite events:', error);
                message.error('Không thể tải danh sách yêu thích');
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteEvents();
    }, [user, token, favorites]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Đang tải danh sách yêu thích..." />
            </div>
        );
    }

    return (
        <div className="favorites-tab-content" style={{ padding: '20px 0' }}>
            {events.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {events.map(event => (
                        <Col xs={24} sm={12} md={8} key={event.id}>
                            <EventCard event={event} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty
                    description={<span style={{ color: '#b0b3b8' }}>Bạn chưa yêu thích sự kiện nào</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ margin: '40px 0' }}
                />
            )}
        </div>
    );
};

export default MyFavoritesTab;
