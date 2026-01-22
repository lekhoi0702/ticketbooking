import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import './EventSection.css';

const EventSection = ({ title, events = [], showViewMore = true, viewMoreLink = "/events" }) => {
    // Safety check: ensure events is an array
    const safeEvents = Array.isArray(events) ? events.filter(e => e !== null && e !== undefined) : [];
    
    if (safeEvents.length === 0) {
        return null; // Don't render if no events
    }

    // Container animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    // Individual card animation
    const itemVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    // Title animation
    const titleVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="event-section">
            <Container>
                <motion.div 
                    className="section-header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={titleVariants}
                >
                    <h2 className="section-title">{title}</h2>
                    {showViewMore && (
                        <Link to={viewMoreLink} className="view-more-link">
                            Xem thêm →
                        </Link>
                    )}
                </motion.div>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <Row className="g-4">
                        {safeEvents.map((event) => (
                            <Col key={event.id || `event-${Math.random()}`} xs={12} sm={6} md={4} lg={3}>
                                <motion.div variants={itemVariants}>
                                    <EventCard event={event} />
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </motion.div>
            </Container>
        </section>
    );
};

export default EventSection;
