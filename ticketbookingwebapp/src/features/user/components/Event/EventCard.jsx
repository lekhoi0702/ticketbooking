import React from 'react';
import { Card, Typography, Space } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, ArrowRightOutlined, FireOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './EventCard.css';

const { Text, Title } = Typography;

const EventCard = ({ event }) => {


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

                        <Space orientation="vertical" size={4} className="event-card-info">
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
                                    <Text type="secondary" className="price-label">Từ </Text>
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
