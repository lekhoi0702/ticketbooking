import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EventCard from './EventCard';
import './TrendingSection.css';

const TrendingSection = ({ events, title = "Sự kiện sắp diễn ra" }) => {
    return (
        <section className="trending-section">
            <Container>
                <div className="trending-header">
                    <h2 className="trending-title">{title}</h2>
                </div>
                <Row className="g-4">
                    {events.map((event, index) => (
                        <Col key={event.id} xs={12} sm={6} md={4}>
                            <EventCard event={{ ...event, ranking: index + 1 }} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default TrendingSection;
