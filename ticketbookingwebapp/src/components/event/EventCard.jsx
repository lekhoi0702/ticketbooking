import React from 'react';
import { Card } from 'react-bootstrap';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event }) => {
    return (
        <Link to={`/event/${event.id}`} className="event-card-link-premium">
            <div className="event-card-premium">
                <div className="event-card-image-wrapper">
                    <img src={event.image} alt={event.title} className="event-card-img" />
                    <div className="event-card-overlay">
                        <span className="event-card-btn">Mua vé ngay</span>
                    </div>
                    {event.badge && (
                        <span className={`event-card-badge ${event.badge.toLowerCase()}`}>
                            {event.badge}
                        </span>
                    )}
                </div>
                <div className="event-card-content">
                    <h3 className="event-card-title">{event.title}</h3>
                    <div className="event-card-details">
                        <div className="event-card-detail-item">
                            <FaClock className="event-card-icon" />
                            <span>{event.date}</span>
                        </div>
                        <div className="event-card-detail-item">
                            <FaMapMarkerAlt className="event-card-icon" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                    <div className="event-card-footer">
                        {event.price && (
                            <div className="event-card-price">
                                <span className="price-label">Giá từ</span>
                                <span className={event.price === 'Miễn phí' ? "price-value-free" : "price-value-amount"}>
                                    {event.price}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;
