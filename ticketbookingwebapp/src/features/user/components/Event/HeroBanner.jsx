import React from 'react';
import { Carousel, Button, Typography, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getImageUrl } from '@shared/utils/eventUtils';
import './HeroBanner.css';

const { Title, Text } = Typography;

const HeroBanner = ({ banners = [] }) => {
    const navigate = useNavigate();
    const displayBanners = banners && banners.length > 0 ? banners : [];

    const contentStyle = {
        height: '480px',
        color: '#fff',
        lineHeight: '160px',
        textAlign: 'center',
        background: '#364d79',
        position: 'relative',
        overflow: 'hidden',
    };

    if (displayBanners.length === 0) {
        // Fallback banner if no banners are loaded
        return (
            <div className="hero-banner-container">
                <Carousel autoplay effect="fade">
                    <div>
                        <div style={contentStyle}>
                            <img
                                src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
                                alt="Default Banner"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div className="banner-overlay">
                                <motion.div 
                                    className="banner-content"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.3 }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.6, delay: 0.5 }}
                                    >
                                        <Title level={1} style={{ color: 'white', marginBottom: 16 }}>TICKETBOOKING</Title>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.6, delay: 0.7 }}
                                    >
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18 }}>
                                            Trải nghiệm những sự kiện đẳng cấp nhất
                                        </Text>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </Carousel>
            </div>
        );
    }

    return (
        <div className="hero-banner-container">
            <Carousel autoplay effect="fade" autoplaySpeed={5000}>
                {displayBanners.map((banner, index) => {
                    const imageUrl = getImageUrl(banner.image_url || banner.image);

                    return (
                        <div key={banner.banner_id || index}>
                            <div style={contentStyle} className="banner-slide">
                                <img
                                    src={imageUrl}
                                    alt={banner.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.style.backgroundColor = '#1f1f1f';
                                    }}
                                />
                                <div className="banner-overlay">
                                    <motion.div 
                                        className="banner-content"
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                    >
                                        {banner.title && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.6, delay: 0.4 }}
                                            >
                                                <Title level={1} className="banner-title">
                                                    {banner.title}
                                                </Title>
                                            </motion.div>
                                        )}

                                        {banner.link && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.5, delay: 0.6 }}
                                            >
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    className="banner-button"
                                                    onClick={() => navigate(banner.link)}
                                                >
                                                    Xem Chi Tiết
                                                </Button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Carousel>
        </div>
    );
};

export default HeroBanner;
