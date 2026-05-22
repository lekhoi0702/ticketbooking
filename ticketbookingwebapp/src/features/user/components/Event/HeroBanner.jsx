import React from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getImageUrl } from '@shared/utils/eventUtils';
import './HeroBanner.css';

const HeroBanner = ({ banners = [] }) => {
    const displayBanners = banners && banners.length > 0 ? banners : [];
    const carouselRef = React.useRef(null);

    if (displayBanners.length === 0) {
        return null;
    }

    const handlePrev = () => {
        if (carouselRef.current) {
            carouselRef.current.prev();
        }
    };

    const handleNext = () => {
        if (carouselRef.current) {
            carouselRef.current.next();
        }
    };

    return (
        <div className="hero-banner-container">
            <Carousel ref={carouselRef} autoplay effect="fade" autoplaySpeed={4500} dots arrows={false}>
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
                                {banner.title && <div className="banner-title">{banner.title}</div>}
                            </div>
                        </div>
                    );
                })}
            </Carousel>

            {displayBanners.length > 1 && (
                <>
                    <button
                        className="hero-carousel-arrow hero-carousel-prev"
                        onClick={handlePrev}
                        aria-label="Slide trước"
                        type="button"
                    >
                        <LeftOutlined />
                    </button>
                    <button
                        className="hero-carousel-arrow hero-carousel-next"
                        onClick={handleNext}
                        aria-label="Slide sau"
                        type="button"
                    >
                        <RightOutlined />
                    </button>
                </>
            )}
        </div>
    );
};

export default HeroBanner;
