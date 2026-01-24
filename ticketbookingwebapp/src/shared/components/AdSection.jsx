import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { advertisementAPI } from '@services/advertisementService';
import AdBanner from './AdBanner';
import { Container } from 'react-bootstrap';

/**
 * AdSection Component
 * Displays advertisements for a specific position
 */
const AdSection = ({
    position,
    limit = 1,
    className = '',
    containerClassName = '',
    showContainer = true,
    spacing = '20px'
}) => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAds();
    }, [position, limit]);

    const loadAds = async () => {
        try {
            setLoading(true);
            const response = await advertisementAPI.getAdsByPosition(position, limit);
            if (response.success && response.data) {
                setAds(response.data);
            }
        } catch (error) {
            console.error('Error loading advertisements:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || ads.length === 0) {
        return null;
    }

    const adContent = (
        <div className={`ad-section ${className}`} style={{ padding: spacing }}>
            {ads.map((ad, index) => (
                <div key={ad.ad_id} style={{ marginBottom: index < ads.length - 1 ? '20px' : '0' }}>
                    <AdBanner ad={ad} />
                </div>
            ))}
        </div>
    );

    if (showContainer) {
        return (
            <section className={containerClassName}>
                <Container>
                    {adContent}
                </Container>
            </section>
        );
    }

    return adContent;
};

AdSection.propTypes = {
    position: PropTypes.string.isRequired,
    limit: PropTypes.number,
    className: PropTypes.string,
    containerClassName: PropTypes.string,
    showContainer: PropTypes.bool,
    spacing: PropTypes.string
};

export default AdSection;
