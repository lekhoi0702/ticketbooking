import React, { useState, useEffect } from 'react';
import HeroBanner from '@features/user/components/Event/HeroBanner';
import EventSection from '@features/user/components/Event/EventSection';
import TrendingSection from '@features/user/components/Event/TrendingSection';
import { api } from '@services/api';
import { transformEvent } from '@shared/utils/eventUtils';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { UPLOADS_BASE_URL } from '@shared/constants';
import { Container } from 'react-bootstrap';

function Home() {
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [popularEvents, setPopularEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [musicEvents, setMusicEvents] = useState([]);
    const [theaterEvents, setTheaterEvents] = useState([]);
    const [sportsEvents, setSportsEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);

            // Load Banners
            const bannerResponse = await api.getPublicBanners();
            console.log('Banner Response:', bannerResponse);
            if (bannerResponse.success) {
                console.log('Banners loaded:', bannerResponse.data);
                setBanners(bannerResponse.data);
            } else {
                console.error('Failed to load banners:', bannerResponse);
            }

            // Load featured events
            const featuredResponse = await api.getFeaturedEvents(4);
            if (featuredResponse.success) {
                setFeaturedEvents(featuredResponse.data);
            }

            // Load popular events (most sold)
            const popularResponse = await api.getEvents({ sort: 'popular', limit: 3 });
            if (popularResponse.success) {
                setPopularEvents(popularResponse.data);
            }

            // Load upcoming events (sorted by nearest date)
            const upcomingResponse = await api.getEvents({ sort: 'upcoming', limit: 3 });
            if (upcomingResponse.success) {
                setUpcomingEvents(upcomingResponse.data);
            }

            // Load events by category
            const musicResponse = await api.getEventsByCategory(1, 4); // Nhạc sống
            if (musicResponse.success) {
                setMusicEvents(musicResponse.data);
            }

            const theaterResponse = await api.getEventsByCategory(2, 4); // Sân khấu
            if (theaterResponse.success) {
                setTheaterEvents(theaterResponse.data);
            }

            const sportsResponse = await api.getEventsByCategory(3, 4); // Thể thao
            if (sportsResponse.success) {
                setSportsEvents(sportsResponse.data);
            }

        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen tip="Đang tải sự kiện..." />;
    }

    return (
        <main>
            <HeroBanner banners={banners} />

            {featuredEvents.length > 0 && (
                <EventSection
                    title="Sự kiện đặc biệt"
                    events={featuredEvents.map(transformEvent)}
                    viewMoreLink="/events"
                />
            )}

            {popularEvents.length > 0 && (
                <TrendingSection
                    title="Sự kiện bán chạy nhất"
                    events={popularEvents.map(transformEvent)}
                />
            )}

            <section className="home-ad-section" style={{ padding: '20px 0' }}>
                <Container>
                    <div
                        className="ad-banner-wrapper"
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <img
                            src={`${UPLOADS_BASE_URL}/quangcao.webp`}
                            alt="Quảng cáo"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                </Container>
            </section>

            {upcomingEvents.length > 0 && (
                <TrendingSection
                    title="Sự kiện sắp diễn ra"
                    events={upcomingEvents.map(transformEvent)}
                />
            )}

            {musicEvents.length > 0 && (
                <EventSection
                    title="Nhạc sống"
                    events={musicEvents.map(transformEvent)}
                    viewMoreLink="/category/1"
                />
            )}

            {theaterEvents.length > 0 && (
                <EventSection
                    title="Sân khấu & Nghệ thuật"
                    events={theaterEvents.map(transformEvent)}
                    viewMoreLink="/category/2"
                />
            )}

            {sportsEvents.length > 0 && (
                <EventSection
                    title="Thể Thao"
                    events={sportsEvents.map(transformEvent)}
                    viewMoreLink="/category/3"
                />
            )}
        </main>
    );
}

export default Home;
