import React from 'react';
import { Carousel, Button, Typography, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
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
                                <div className="banner-content">
                                    <Title level={1} style={{ color: 'white', marginBottom: 16 }}>TICKETBOOKING</Title>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 18 }}>
                                        Trải nghiệm những sự kiện đẳng cấp nhất
                                    </Text>
                                </div>
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
                                    <div className="banner-content">
                                        {banner.title && (
                                            <Title level={1} className="banner-title">
                                                {banner.title}
                                            </Title>
                                        )}

                                        {banner.link && (
                                            <Button
                                                type="primary"
                                                size="large"
                                                className="banner-button"
                                                onClick={() => navigate(banner.link)}
                                            >
                                                Xem Chi Tiết
                                            </Button>
                                        )}
                                    </div>
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
