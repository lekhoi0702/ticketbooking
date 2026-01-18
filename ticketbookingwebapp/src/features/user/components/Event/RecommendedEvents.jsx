import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { getImageUrl } from '@shared/utils/eventUtils';
import { api } from '@services/api';

const RecommendedEvents = ({ eventId }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(4);

    useEffect(() => {
        const fetchRecommended = async () => {
            try {
                const response = await api.getRecommendedEvents(eventId, 12);
                if (response.success) {
                    setEvents(response.data);
                }
            } catch (error) {
                console.error('Error fetching recommended events:', error);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchRecommended();
        }
    }, [eventId]);

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 4);
    };

    if (loading || events.length === 0) {
        return null;
    }

    const visibleEvents = events.slice(0, visibleCount);
    const hasMore = visibleCount < events.length;

    return (
        <div className="recommended-section mt-5">
            <h5 className="section-title-sm mb-4">Có thể bạn cũng thích</h5>

            <div className="recommended-grid">
                {visibleEvents.map(event => (
                    <Link to={`/event/${event.event_id}`} key={event.event_id} className="recommended-card-link">
                        <div className="recommended-card">
                            <div className="rec-img-wrapper">
                                <img
                                    src={getImageUrl(event.banner_image_url)}
                                    alt={event.event_name}
                                    loading="lazy"
                                />
                            </div>
                            <div className="rec-content">
                                <h6 className="rec-title">{event.event_name}</h6>
                                <div className="rec-price">
                                    Từ {event.min_price ? event.min_price.toLocaleString('vi-VN') : '0'}đ
                                </div>
                                <div className="rec-date">
                                    <svg width="14" height="14" viewBox="0 0 16 17" fill="none" className="me-2">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M5.333 1.958c.369 0 .667.299.667.667v.667h4v-.667a.667.667 0 111.334 0v.667H12a2.667 2.667 0 012.667 2.666v8c0 .737-.597 1.334-1.333 1.334H2.667a1.333 1.333 0 01-1.333-1.334v-8A2.667 2.667 0 014 3.292h.667v-.667c0-.368.298-.667.667-.667zM10 4.625v.667a.667.667 0 101.334 0v-.667H12c.736 0 1.334.597 1.334 1.333v1.334H2.667V5.958c0-.736.597-1.333 1.333-1.333h.667v.667a.667.667 0 001.333 0v-.667h4zm-7.333 4h10.666v5.333H2.668V8.625z" fill="#fff" opacity="0.8"></path>
                                    </svg>
                                    {event.start_datetime ? new Date(event.start_datetime).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'TBA'}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {hasMore && (
                <div className="text-center mt-4">
                    <Button
                        variant="outline-light"
                        className="btn-view-more"
                        onClick={handleShowMore}
                    >
                        Xem thêm sự kiện
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RecommendedEvents;
