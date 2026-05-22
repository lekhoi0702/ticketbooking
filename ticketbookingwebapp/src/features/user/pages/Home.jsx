import React, { useState, useEffect } from 'react';
import HeroBanner from '@features/user/components/Event/HeroBanner';
import EventSection from '@features/user/components/Event/EventSection';
import TrendingSection from '@features/user/components/Event/TrendingSection';
import { api } from '@services/api';
import { transformEvent } from '@shared/utils/eventUtils';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import { Container } from 'react-bootstrap';

function Home() {
    const [favoriteEvents, setFavoriteEvents] = useState([]);
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

            const loadPromises = [
                api.getPublicBanners()
                    .then((response) => {
                        if (response.success && response.data) {
                            setBanners(response.data);
                        } else {
                            console.warn('Failed to load banners:', response);
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading banners:', error);
                    }),

                api.getFavoriteEvents(4)
                    .then((response) => {
                        if (response.success && response.data) {
                            setFavoriteEvents(response.data);
                        } else {
                            console.warn('Failed to load favorite events:', response);
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading favorite events:', error);
                    }),

                api.getEvents({ sort: 'upcoming', limit: 3 })
                    .then((response) => {
                        if (response.success && response.data) {
                            setUpcomingEvents(response.data);
                        } else {
                            console.warn('Failed to load upcoming events:', response);
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading upcoming events:', error);
                    }),

                api.getEventsByCategory(1, 4)
                    .then((response) => {
                        if (response.success && response.data) {
                            setMusicEvents(response.data);
                        } else {
                            console.warn('Failed to load music events:', response);
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading music events:', error);
                    }),

                api.getEventsByCategory(2, 4)
                    .then((response) => {
                        if (response.success && response.data) {
                            setTheaterEvents(response.data);
                        } else {
                            console.warn('Failed to load theater events:', response);
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading theater events:', error);
                    }),

                api.getEventsByCategory(3, 4)
                    .then((response) => {
                        if (response.success && response.data) {
                            setSportsEvents(response.data);
                        } else {
                            console.warn('Failed to load sports events:', response);
                        }
                    })
                    .catch((error) => {
                        console.error('Error loading sports events:', error);
                    }),
            ];

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

            {favoriteEvents.length > 0 && (
                <EventSection
                    title="Sự kiện nổi bật"
                    events={favoriteEvents.map(transformEvent).filter((e) => e !== null)}
                    viewMoreLink="/events"
                />
            )}

            {upcomingEvents.length > 0 && (
                <TrendingSection
                    title="Sự kiện sắp diễn ra"
                    events={upcomingEvents.map(transformEvent).filter((e) => e !== null)}
                />
            )}

            {musicEvents.length > 0 && (
                <EventSection
                    title="Nhạc sống"
                    events={musicEvents.map(transformEvent).filter((e) => e !== null)}
                    viewMoreLink="/category/1"
                />
            )}

            {theaterEvents.length > 0 && (
                <EventSection
                    title="Sân khấu & Nghệ thuật"
                    events={theaterEvents.map(transformEvent).filter((e) => e !== null)}
                    viewMoreLink="/category/2"
                />
            )}

            {sportsEvents.length > 0 && (
                <EventSection
                    title="Thể thao"
                    events={sportsEvents.map(transformEvent).filter((e) => e !== null)}
                    viewMoreLink="/category/3"
                />
            )}
        </main>
    );
}

export default Home;

