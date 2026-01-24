import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { advertisementAPI } from '@services/advertisementService';
import { getImageUrl } from '@shared/utils/eventUtils';
import './AdBanner.css';

/**
 * AdBanner Component
 * Displays advertisement banner with tracking
 */
const AdBanner = ({ ad, className = '', style = {} }) => {
    const viewTracked = useRef(false);

    useEffect(() => {
        // Track view only once when component mounts
        if (ad && ad.ad_id && !viewTracked.current) {
            advertisementAPI.trackView(ad.ad_id);
            viewTracked.current = true;
        }
    }, [ad]);

    const handleClick = () => {
        if (ad && ad.ad_id) {
            advertisementAPI.trackClick(ad.ad_id);
        }
    };

    if (!ad) {
        return null;
    }

    const imageUrl = getImageUrl(ad.image_url);

    const content = (
        <div
            className={`ad-banner ${className}`}
            style={style}
        >
            <img
                src={imageUrl}
                alt={ad.title}
                className="ad-banner-image"
                loading="lazy"
                onError={(e) => {
                    console.error('Failed to load ad image:', ad.image_url);
                    e.target.style.display = 'none';
                }}
            />
        </div>
    );

    // If there's a link, wrap in anchor tag
    if (ad.link_url && ad.link_url !== '#') {
        return (
            <a
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ad-banner-link"
                onClick={handleClick}
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
        title: PropTypes.string.isRequired,
        image_url: PropTypes.string.isRequired,
        link_url: PropTypes.string
    }),
    className: PropTypes.string,
    style: PropTypes.object
};

export default AdBanner;
