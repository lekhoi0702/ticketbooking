import React from 'react';
import { Carousel } from 'react-bootstrap';
import './HeroBanner.css';

const HeroBanner = () => {
    const banners = [
        {
            id: 1,
            title: 'STUNNING TOGETHER',
            subtitle: 'IN HỒ CHÍ MINH CITY',
            image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=500&fit=crop',
            link: '#event1'
        },
        {
            id: 2,
            title: 'NHẠC HỘI ĐẦU XUÂN 2026',
            subtitle: 'KHỞI ĐẦU NĂM MỚI',
            image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=500&fit=crop',
            link: '#event2'
        },
        {
            id: 3,
            title: 'LIVE CONCERT',
            subtitle: 'TRẢI NGHIỆM ÂM NHẠC ĐỈNH CAO',
            image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=500&fit=crop',
            link: '#event3'
        }
    ];

    return (
        <section className="hero-banner">
            <Carousel fade interval={4000} controls={true} indicators={true}>
                {banners.map((banner) => (
                    <Carousel.Item key={banner.id}>
                        <div className="banner-slide">
                            <img
                                className="d-block w-100"
                                src={banner.image}
                                alt={banner.title}
                            />
                            <div className="banner-overlay">
                                <div className="banner-content">
                                    <h2 className="banner-title">{banner.title}</h2>
                                    <p className="banner-subtitle">{banner.subtitle}</p>
                                    <a href={banner.link} className="btn-view-details">
                                        Xem chi tiết
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
        </section>
    );
};

export default HeroBanner;
