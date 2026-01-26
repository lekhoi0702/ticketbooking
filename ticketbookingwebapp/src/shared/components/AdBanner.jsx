import React from 'react';
import PropTypes from 'prop-types';
import { getImageUrl } from '@shared/utils/eventUtils';
import './AdBanner.css';

/**
 * AdBanner Component
 * Displays advertisement banner
 */
const AdBanner = ({ ad, className = '', style = {} }) => {
    if (!ad) {
        return null;
    }

    const imageUrl = getImageUrl(ad.image);

    const content = (
        <div
            className={`ad-banner ${className}`}
            style={style}
        >
            <img
                src={imageUrl}
                alt="advertisement"
                className="ad-banner-image"
                loading="lazy"
                onError={(e) => {
                    console.error('Failed to load ad image:', ad.image);
                    e.target.style.display = 'none';
                }}
            />
        </div>
    );

    // If there's a link, wrap in anchor tag
    if (ad.url && ad.url !== '#') {
        return (
            <a
                href={ad.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ad-banner-link"
            >
                {content}
            </a>
        );
    }

    return content;
};

AdBanner.propTypes = {
    ad: PropTypes.shape({
        ad_id: PropTypes.number.isRequired,
        image: PropTypes.string.isRequired,
        url: PropTypes.string
    }),
    className: PropTypes.string,
    style: PropTypes.object
};

export default AdBanner;
