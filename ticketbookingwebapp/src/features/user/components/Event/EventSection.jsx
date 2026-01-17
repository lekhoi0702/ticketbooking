import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import './EventSection.css';

const EventSection = ({ title, events, showViewMore = true, viewMoreLink = "/events" }) => {
    return (
        <section className="event-section">
            <Container>
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    {showViewMore && (
                        <Link to={viewMoreLink} className="view-more-link">
                            Xem thêm →
                        </Link>
                    )}
                </div>
                <Row className="g-4">
                    {events.map((event) => (
                        <Col key={event.id} xs={12} sm={6} md={4} lg={3}>
                            <EventCard event={event} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default EventSection;
