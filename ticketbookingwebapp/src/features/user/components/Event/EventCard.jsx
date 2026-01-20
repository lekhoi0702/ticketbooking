import React, { useEffect, useRef } from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, ArrowRightOutlined, FireOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { useAuth } from '@context/AuthContext';
import { useFavorites } from '@context/FavoriteContext';
import { formatCurrency } from '@shared/utils/eventUtils';
import './EventCard.css';

const { Text, Title } = Typography;

const EventCard = ({ event }) => {
    const { triggerLogin, isAuthenticated, redirectIntent, clearRedirectIntent } = useAuth();
    const { isFavorited, toggleFavorite } = useFavorites();
    const favorited = isFavorited(event.id);
    const pendingFavoriteRef = useRef(false);

    // Handle auto-toggle favorite after login
    useEffect(() => {
        const handlePendingFavorite = async () => {
            if (isAuthenticated && 
                redirectIntent?.action === 'favorite' && 
                redirectIntent?.eventId === event.id) {
                clearRedirectIntent();
                const result = await toggleFavorite(event.id);
                if (result.success) {
                    message.success(result.message);
                }
            }
        };
        handlePendingFavorite();
    }, [isAuthenticated, redirectIntent, event.id, toggleFavorite, clearRedirectIntent]);

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            triggerLogin({ action: 'favorite', eventId: event.id });
            return;
        }

        const result = await toggleFavorite(event.id);
        if (result.success) {
            message.success(result.message);
        }
    };

    return (
        <Link to={`/event/${event.id}`} className="event-card-link">
            <motion.div
                whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3, ease: "easeOut" }
                }}
                whileTap={{ scale: 0.98 }}
            >
                <Card
                    className="event-card-premium"
                    hoverable
                    cover={
                        <div className="event-card-image-wrapper">
                            <motion.img 
                                src={event.image} 
                                alt={event.title} 
                                className="event-card-img"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                            />
                            <motion.div 
                                className="event-card-overlay"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.span 
                                    className="event-card-buy-btn"
                                    initial={{ y: 10, opacity: 0 }}
                                    whileHover={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Mua vé <ArrowRightOutlined />
                                </motion.span>
                            </motion.div>
                            <motion.div
                                className={`event-card-favorite-btn ${favorited ? 'active' : ''}`}
                                onClick={handleToggleFavorite}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 17
                                }}
                            >
                                {favorited ? <StarFilled /> : <StarOutlined />}
                            </motion.div>
                            {event.badge && (
                                <motion.div 
                                    className="event-card-badge-hot"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <FireOutlined className="badge-icon" /> {event.badge.toUpperCase()}
                                </motion.div>
                            )}
                        </div>
                    }
                >
                    <div className="event-card-body">
                        <Title level={5} className="event-card-title" ellipsis={{ rows: 2 }}>
                            {event.title}
                        </Title>

                        <Space direction="vertical" size={4} className="event-card-info">
                            <Text type="secondary" className="info-item">
                                <ClockCircleOutlined /> {event.date}
                            </Text>
                            <Text type="secondary" className="info-item" ellipsis>
                                <EnvironmentOutlined /> {event.location}
                            </Text>
                        </Space>

                        <div className="event-card-footer">
                            {event.price && (
                                <div className="price-tag">
                                    <Text type="secondary" size="small">Từ </Text>
                                    <Text strong className={event.price === 'Miễn phí' ? "price-free" : "price-amount"}>
                                        {event.price}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>
        </Link>
    );
};

export default EventCard;
