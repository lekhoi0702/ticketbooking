import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import EventCard from './EventCard';
import './TrendingSection.css';

const TrendingSection = ({ events }) => {
    return (
        <section className="trending-section">
            <Container>
                <div className="trending-header">
                    <div className="awards-badge">
                        <span className="awards-icon">🏆</span>
                        <span className="awards-text">TICKETBOOKING AWARDS</span>
                    </div>
                    <h2 className="trending-title">Sự kiện xu hướng</h2>
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
