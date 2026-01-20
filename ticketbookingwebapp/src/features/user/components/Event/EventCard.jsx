import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, ArrowRightOutlined, FireOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '@context/AuthContext';
import { useFavorites } from '@context/FavoriteContext';
import { formatCurrency } from '@shared/utils/eventUtils';
import './EventCard.css';

const { Text, Title } = Typography;

const EventCard = ({ event }) => {
    const { user, triggerLogin, isAuthenticated } = useAuth();
    const { isFavorited, toggleFavorite } = useFavorites();
    const favorited = isFavorited(event.id);

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            triggerLogin();
            return;
        }

        const result = await toggleFavorite(event.id);
        if (result.success) {
            message.success(result.message);
        }
    };

    return (
        <Link to={`/event/${event.id}`} className="event-card-link">
            <Card
                className="event-card-premium"
                hoverable
                cover={
                    <div className="event-card-image-wrapper">
                        <img src={event.image} alt={event.title} className="event-card-img" />
                        <div className="event-card-overlay">
                            <span className="event-card-buy-btn">Mua vé <ArrowRightOutlined /></span>
                        </div>
                        <div
                            className={`event-card-favorite-btn ${favorited ? 'active' : ''}`}
                            onClick={handleToggleFavorite}
                        >
                            {favorited ? <StarFilled style={{ color: '#ffb400' }} /> : <StarOutlined />}
                        </div>
                        {event.badge && (
                            <div className="event-card-badge-hot">
                                <FireOutlined className="badge-icon" /> {event.badge.toUpperCase()}
                            </div>
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
        </Link>
    );
};

export default EventCard;
