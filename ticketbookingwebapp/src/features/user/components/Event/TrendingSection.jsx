import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import './TrendingSection.css';

const TrendingSection = ({ events, title = "Sự kiện sắp diễn ra" }) => {
    // Container animation với stagger effect
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    // Card animation với scale và fade
    const cardVariants = {
        hidden: { 
            opacity: 0, 
            scale: 0.9,
            y: 40
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    // Title animation
    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="trending-section">
            <Container>
                <motion.div 
                    className="trending-header"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={titleVariants}
                >
                    <h2 className="trending-title">{title}</h2>
                </motion.div>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={containerVariants}
                >
                    <Row className="g-4">
                        {events.map((event, index) => (
                            <Col key={event.id} xs={12} sm={6} md={4}>
                                <motion.div 
                                    variants={cardVariants}
                                    whileHover={{ 
                                        y: -8,
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    <EventCard event={{ ...event, ranking: index + 1 }} />
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </motion.div>
            </Container>
        </section>
    );
};

export default TrendingSection;
