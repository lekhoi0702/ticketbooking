import React, { useState, useEffect } from 'react';
import { Carousel, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@shared/utils/eventUtils';
import './HeroBanner.css';

const HeroBanner = ({ banners = [] }) => {
    const navigate = useNavigate();
    const displayBanners = banners && banners.length > 0 ? banners : [];
    const [slidesToShow, setSlidesToShow] = useState(2);
    const carouselRef = React.useRef(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setSlidesToShow(1);
            } else {
                setSlidesToShow(2);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (displayBanners.length === 0) {
        return null;
    }

    return (
        <div className="hero-banner-container" ref={carouselRef}>
            <Carousel 
                autoplay 
                effect="scrollx" 
                autoplaySpeed={4000} 
                dots={true}
                arrows={false}
                slidesToShow={slidesToShow}
                slidesToScroll={slidesToShow}
                infinite={displayBanners.length > slidesToShow}
            >
                {displayBanners.map((banner, index) => {
                    const imageUrl = getImageUrl(banner.image_url || banner.image);

                    return (
                        <div key={banner.banner_id || index} className="banner-item-wrapper">
                            <div className="banner-slide">
                                <img
                                    src={imageUrl}
                                    alt={banner.title || 'Banner'}
                                    className="banner-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.style.backgroundColor = '#1f1f1f';
                                    }}
                                />
                                {banner.link && (
                                    <div className="banner-button-wrapper">
                                        <Button
                                            className="banner-button"
                                            onClick={() => navigate(banner.link)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </Carousel>
        </div>
    );
};

export default HeroBanner;
