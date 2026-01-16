import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@shared/utils/eventUtils';
import './EventCard.css';

const { Text, Title } = Typography;

const EventCard = ({ event }) => {
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
                        {event.badge && (
                            <Tag color="#52c41a" className="event-card-badge">
                                {event.badge.toUpperCase()}
                            </Tag>
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
