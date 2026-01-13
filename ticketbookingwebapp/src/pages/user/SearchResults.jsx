import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Breadcrumb } from 'react-bootstrap';
import { api } from '../../services/api';
import EventCard from '../../components/event/EventCard';
import { transformEvent } from '../../utils/eventUtils';

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
        return (
            <Container className="py-5 text-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
                <h4 className="mt-3">Đang tìm kiếm sự kiện...</h4>
            </Container>
        );
    }

    return (
        <Container className="py-4" style={{ minHeight: '70vh' }}>
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
                <Breadcrumb.Item active>Kết quả tìm kiếm</Breadcrumb.Item>
            </Breadcrumb>

            <div className="search-results-header mb-5">
                <h2 className="fw-bold">
                    Kết quả tìm kiếm cho: <span className="text-primary">"{searchQuery}"</span>
                </h2>
                <p className="text-muted">Tìm thấy {events.length} sự kiện phù hợp</p>
                <hr />
            </div>

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
                    <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.2 }}>🔍</div>
                    <h3>Rất tiếc, không tìm thấy sự kiện phù hợp</h3>
                    <p className="text-muted">Bạn hãy thử tìm kiếm với từ khóa khác nhé</p>
                    <Link to="/" className="btn btn-primary mt-3 px-4 rounded-pill">Quay lại trang chủ</Link>
                </div>
            )}
        </Container>
    );
};

export default SearchResults;
