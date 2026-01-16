import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Breadcrumb } from 'react-bootstrap';
import { api } from '@services/api';
import EventCard from '@features/user/components/Event/EventCard';
import { transformEvent } from '@shared/utils/eventUtils';
import LoadingSpinner from '@shared/components/LoadingSpinner';

const CategoryEvents = () => {
    const { id } = useParams();
    const [events, setEvents] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);

    const [category, setCategory] = useState(null);

    useEffect(() => {
        loadCategoryData();
    }, [id]);

    const loadCategoryData = async () => {
        try {
            setLoading(true);
            const [eventsRes, categoryRes] = await Promise.all([
                api.getEventsByCategory(id),
                api.getCategory(id)
            ]);

            if (eventsRes.success) {
                setEvents(eventsRes.data);
            }
            if (categoryRes.success) {
                setCategory(categoryRes.data);
                setCategoryName(categoryRes.data.category_name);
            }
        } catch (error) {
            console.error('Error loading category data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner tip={`Đang tải sự kiện ${categoryName}...`} />;
    }

    return (
        <Container className="py-4" style={{ minHeight: '70vh' }}>
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
                <Breadcrumb.Item active>{categoryName}</Breadcrumb.Item>
            </Breadcrumb>

            <div className="category-header mb-5">
                <h2 className="fw-bold">{categoryName}</h2>
                <p className="text-muted">Khám phá các sự kiện {categoryName.toLowerCase()} hấp dẫn nhất</p>
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
                    <div className="mb-4" style={{ fontSize: '4rem', opacity: 0.2 }}>🎟️</div>
                    <h3>Hiện tại chưa có sự kiện nào trong mục này</h3>
                    <p className="text-muted">Vui lòng quay lại sau hoặc khám phá các danh mục khác</p>
                    <Link to="/" className="btn btn-primary mt-3 px-4 rounded-pill">Khám phá trang chủ</Link>
                </div>
            )}
        </Container>
    );
};

export default CategoryEvents;
