import React from 'react';
import { Card } from 'react-bootstrap';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
    return (
        <Link to={`/event/${event.id}`} className="event-card-link">
            <Card className="event-card">
                <div className="event-image-wrapper">
                    <Card.Img variant="top" src={event.image} alt={event.title} />
                    {event.badge && (
                        <span className={`event-badge ${event.badge.toLowerCase()}`}>
                            {event.badge}
                        </span>
                    )}
                    {event.ranking && (
                        <div className="event-ranking">{event.ranking}</div>
                    )}
                </div>
                <Card.Body>
                    <Card.Title className="event-title">{event.title}</Card.Title>
                    <div className="event-info">
                        <div className="event-date">
                            <FaClock className="icon" />
                            <span>{event.date}</span>
                        </div>
                        <div className="event-location">
                            <FaMapMarkerAlt className="icon" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                    {event.price && (
                        <div className="event-price">
                            {event.price === 'Miễn phí' ? (
                                <span className="price-free">{event.price}</span>
                            ) : (
                                <span className="price-amount">Từ {event.price}</span>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Link>
    );
};

export default EventCard;
