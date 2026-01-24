import React, { useState, useEffect } from 'react';
import HeroBanner from '@features/user/components/Event/HeroBanner';
import EventSection from '@features/user/components/Event/EventSection';
import TrendingSection from '@features/user/components/Event/TrendingSection';
import AdSection from '@shared/components/AdSection';
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

            // Load all data in parallel for better performance
            const loadPromises = [
                // Load Banners
                api.getPublicBanners()
                    .then(response => {
                        if (response.success && response.data) {
                            setBanners(response.data);
                        } else {
                            console.warn('Failed to load banners:', response);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading banners:', error);
                    }),

                // Load featured events
                api.getFeaturedEvents(4)
                    .then(response => {
                        if (response.success && response.data) {
                            setFeaturedEvents(response.data);
                        } else {
                            console.warn('Failed to load featured events:', response);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading featured events:', error);
                    }),

                // Load popular events (most sold)
                api.getEvents({ sort: 'popular', limit: 3 })
                    .then(response => {
                        if (response.success && response.data) {
                            setPopularEvents(response.data);
                        } else {
                            console.warn('Failed to load popular events:', response);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading popular events:', error);
                    }),

                // Load upcoming events (sorted by nearest date)
                api.getEvents({ sort: 'upcoming', limit: 3 })
                    .then(response => {
                        if (response.success && response.data) {
                            setUpcomingEvents(response.data);
                        } else {
                            console.warn('Failed to load upcoming events:', response);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading upcoming events:', error);
                    }),

                // Load events by category - Nhạc sống
                api.getEventsByCategory(1, 4)
                    .then(response => {
                        if (response.success && response.data) {
                            setMusicEvents(response.data);
                        } else {
                            console.warn('Failed to load music events:', response);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading music events:', error);
                    }),

                // Load events by category - Sân khấu
                api.getEventsByCategory(2, 4)
                    .then(response => {
                        if (response.success && response.data) {
                            setTheaterEvents(response.data);
                        } else {
                            console.warn('Failed to load theater events:', response);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading theater events:', error);
                    }),

                // Load events by category - Thể thao
                api.getEventsByCategory(3, 4)
                    .then(response => {
                        if (response.success && response.data) {
                            setSportsEvents(response.data);
                        } else {
                            console.warn('Failed to load sports events:', response);
                        }
                    })
                    .catch(error => {
                        console.error('Error loading sports events:', error);
                    })
            ];

            // Wait for all requests to complete (or fail)
            await Promise.allSettled(loadPromises);

        } catch (error) {
            console.error('Unexpected error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen tip="Đang tải sự kiện..." />;
    }

    return (
        <main>
            <Container className="hero-banner-wrapper">
                <HeroBanner banners={banners} />
            </Container>

            {featuredEvents.length > 0 && (
                <EventSection
                    title="Sự kiện đặc biệt"
                    events={featuredEvents.map(transformEvent).filter(e => e !== null)}
                    viewMoreLink="/events"
                />
            )}

            {popularEvents.length > 0 && (
                <>
                    <TrendingSection
                        title="Sự kiện bán chạy nhất"
                        events={popularEvents.map(transformEvent).filter(e => e !== null)}
                    />

                    {/* Advertisement between sections */}
                    <AdSection
                        position="HOME_BETWEEN_SECTIONS"
                        limit={1}
                        containerClassName="home-ad-section"
                    />
                </>
            )}

            {upcomingEvents.length > 0 && (
                <TrendingSection
                    title="Sự kiện sắp diễn ra"
                    events={upcomingEvents.map(transformEvent).filter(e => e !== null)}
                />
            )}

            {musicEvents.length > 0 && (
                <EventSection
                    title="Nhạc sống"
                    events={musicEvents.map(transformEvent).filter(e => e !== null)}
                    viewMoreLink="/category/1"
                />
            )}

            {theaterEvents.length > 0 && (
                <EventSection
                    title="Sân khấu & Nghệ thuật"
                    events={theaterEvents.map(transformEvent).filter(e => e !== null)}
                    viewMoreLink="/category/2"
                />
            )}

            {sportsEvents.length > 0 && (
                <EventSection
                    title="Thể Thao"
                    events={sportsEvents.map(transformEvent).filter(e => e !== null)}
                    viewMoreLink="/category/3"
                />
            )}
        </main>
    );
}

export default Home;
