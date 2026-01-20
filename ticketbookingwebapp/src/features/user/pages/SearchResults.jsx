import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa';
import { api } from '@services/api';
import EventCard from '@features/user/components/Event/EventCard';
import AntBreadcrumb from '@features/user/components/AntBreadcrumb';
import { transformEvent } from '@shared/utils/eventUtils';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const SearchResults = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (searchQuery) {
            performSearch();
        } else {
            setLoading(false);
        }
    }, [searchQuery]);

    const performSearch = async () => {
        try {
            setLoading(true);
            const response = await api.searchEvents(searchQuery);
            if (response.success) {
                setEvents(response.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen tip="Đang tìm kiếm sự kiện..." />;
    }

    return (
        <Container className="py-4" style={{ minHeight: '70vh' }}>
            <AntBreadcrumb
                items={[
                    { label: 'Trang chủ', path: '/', icon: <FaHome /> },
                    { label: 'Kết quả tìm kiếm', path: `/search?q=${searchQuery}` }
                ]}
            />

            {events.length > 0 ? (
                <Row className="g-4">
                    {events.map(event => (
                        <Col key={event.event_id} xs={12} sm={6} md={4} lg={3}>
                            <EventCard event={transformEvent(event)} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="text-center py-5">
                    <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.5, filter: 'brightness(0) invert(1)' }}>🔍</div>
                    <h3>Rất tiếc, không tìm thấy sự kiện phù hợp</h3>
                    <p className="text-muted">Bạn hãy thử tìm kiếm với từ khóa khác nhé</p>
                    <Link to="/" className="btn btn-primary mt-3 px-4 rounded-pill">Quay lại trang chủ</Link>
                </div>
            )}
        </Container>
    );
};

export default SearchResults;
