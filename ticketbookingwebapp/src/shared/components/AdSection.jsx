import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import AdBanner from './AdBanner';
import { Container } from 'react-bootstrap';
import { getStaticAdsByPosition } from '@shared/constants/staticAds';

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
    const ads = useMemo(() => getStaticAdsByPosition(position, limit), [position, limit]);

    if (ads.length === 0) {
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
