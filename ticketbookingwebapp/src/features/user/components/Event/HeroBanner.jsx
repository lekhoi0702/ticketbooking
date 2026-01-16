import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './HeroBanner.css';

const HeroBanner = () => {
    const banners = [
        {
            id: 1,
            title: 'STUNNING TOGETHER',
            subtitle: 'IN HỒ CHÍ MINH CITY',
            image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&h=600&fit=crop',
            link: '#event1'
        },
        {
            id: 2,
            title: 'NHẠC HỘI ĐẦU XUÂN 2026',
            subtitle: 'KHỞI ĐẦU NĂM MỚI',
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&h=600&fit=crop',
            link: '#event2'
        },
        {
            id: 3,
            title: 'LIVE CONCERT',
            subtitle: 'TRẢI NGHIỆM ÂM NHẠC ĐỈNH CAO',
            image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600&h=600&fit=crop',
            link: '#event3'
        },
        {
            id: 4,
            title: 'TECH CONFERENCE 2026',
            subtitle: 'KHÁM PHÁ CÔNG NGHỆ MỚI',
            image: 'https://images.unsplash.com/photo-1505373630103-821c70e3864c?w=1600&h=600&fit=crop',
            link: '#event4'
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    return (
        <section className="hero-banner-section">
            <div className="hero-carousel">
                <div
                    className="carousel-inner"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {banners.map((banner) => (
                        <div className="carousel-item-custom" key={banner.id}>
                            <img src={banner.image} alt={banner.title} className="banner-img" />
                            <div className="banner-overlay-custom">
                                <Container>
                                    <div className="banner-text">
                                        <h1 className="banner-title-custom">{banner.title}</h1>
                                        <p className="banner-subtitle-custom">{banner.subtitle}</p>
                                        <button className="btn-view-details-custom">
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </Container>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Arrow Controls */}
                <button className="carousel-control-prev" onClick={handlePrev}>
                    <FaChevronLeft />
                </button>
                <button className="carousel-control-next" onClick={handleNext}>
                    <FaChevronRight />
                </button>
            </div>
        </section>
    );
};

export default HeroBanner;
