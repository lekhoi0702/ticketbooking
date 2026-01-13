import React, { useState, useEffect } from 'react';
import HeroBanner from '../../components/event/HeroBanner';
import EventSection from '../../components/event/EventSection';
import TrendingSection from '../../components/event/TrendingSection';
import { api } from '../../services/api';
import { transformEvent } from '../../utils/eventUtils';

function Home() {
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [trendingEvents, setTrendingEvents] = useState([]);
    const [musicEvents, setMusicEvents] = useState([]);
    const [theaterEvents, setTheaterEvents] = useState([]);
    const [sportsEvents, setSportsEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);

            // Load featured events
            const featuredResponse = await api.getFeaturedEvents(4);
            if (featuredResponse.success) {
                setFeaturedEvents(featuredResponse.data);
            }

            // Load trending events (first 3 featured)
            const trendingResponse = await api.getFeaturedEvents(3);
            if (trendingResponse.success) {
                setTrendingEvents(trendingResponse.data);
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
        return (
            <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-border text-success mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h2>Đang tải...</h2>
                    <p>Vui lòng đợi trong giây lát</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <HeroBanner />

            {featuredEvents.length > 0 && (
                <EventSection
                    title="Sự kiện đặc biệt"
                    events={featuredEvents.map(transformEvent)}
                />
            )}

            {trendingEvents.length > 0 && (
                <TrendingSection
                    events={trendingEvents.map(transformEvent)}
                />
            )}

            {musicEvents.length > 0 && (
                <EventSection
                    title="Nhạc sống"
                    events={musicEvents.map(transformEvent)}
                />
            )}

            {theaterEvents.length > 0 && (
                <EventSection
                    title="Sân khấu & Nghệ thuật"
                    events={theaterEvents.map(transformEvent)}
                />
            )}

            {sportsEvents.length > 0 && (
                <EventSection
                    title="Thể Thao"
                    events={sportsEvents.map(transformEvent)}
                />
            )}
        </main>
    );
}

export default Home;
