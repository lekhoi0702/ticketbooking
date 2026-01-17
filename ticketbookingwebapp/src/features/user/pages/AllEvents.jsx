import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import { api } from '@services/api';
import EventCard from '@features/user/components/Event/EventCard';
import { transformEvent } from '@shared/utils/eventUtils';
import LoadingSpinner from '@shared/components/LoadingSpinner';
import './AllEvents.css';

const AllEvents = () => {
    const [categories, setCategories] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            // Fetch more events to show the classification better
            const response = await api.getEvents({ limit: 100 });

            if (response.success) {
                // Group events by category
                const groups = response.data.reduce((acc, event) => {
                    const catName = event.category?.category_name || 'Khác';
                    if (!acc[catName]) {
                        acc[catName] = [];
                    }
                    acc[catName].push(event);
                    return acc;
                }, {});

                // Sort events within each category by date
                Object.keys(groups).forEach(cat => {
                    groups[cat].sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
                });

                setCategories(groups);
            }
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner tip="Đang tải tất cả sự kiện..." />;
    }

    const categoryNames = Object.keys(categories).sort();

    return (
        <div className="all-events-wrapper">
            <Container>
                <Breadcrumb className="mb-4">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
                    <Breadcrumb.Item active>Tất cả sự kiện</Breadcrumb.Item>
                </Breadcrumb>

                <div className="all-events-header text-center mb-5">
                    <h2 className="all-events-title">Khám Phá Sự Kiện</h2>
                    <p className="all-events-subtitle">Tìm kiếm và lựa chọn những trải nghiệm tuyệt vời nhất dành cho bạn</p>
                    <div className="all-events-divider mx-auto"></div>
                </div>

                {categoryNames.length > 0 ? (
                    categoryNames.map(catName => (
                        <div key={catName} className="category-section mb-5">
                            <div className="category-header d-flex align-items-center mb-4">
                                <h3 className="category-title mb-0">{catName}</h3>
                                <div className="category-line ms-3 flex-grow-1"></div>
                                <span className="category-count ms-3">{categories[catName].length} sự kiện</span>
                            </div>
                            <Row className="g-4">
                                {categories[catName].map(event => (
                                    <Col key={event.event_id} xs={12} sm={6} md={4} lg={3}>
                                        <EventCard event={transformEvent(event)} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ))
                ) : (
                    <div className="empty-events-state">
                        <div className="empty-icon">📅</div>
                        <h3 className="empty-title">Không có sự kiện nào</h3>
                        <p className="empty-text">Vui lòng quay lại sau</p>
                    </div>
                )}
            </Container>
        </div>
    );
};

export default AllEvents;
