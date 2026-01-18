import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const EventVenueInfo = ({ venue }) => {
    if (!venue) return null;

    return (
        <section className="detail-section" id="venue">
            <h3 className="section-title">Địa điểm</h3>
            <div className="venue-info">
                <h5>{venue.venue_name}</h5>
                <p className="text-muted"><FaMapMarkerAlt className="me-2" />{venue.address}, {venue.city}</p>
                {venue.map_embed_code ? (
                    <div
                        className="venue-map-embed"
                        dangerouslySetInnerHTML={{ __html: venue.map_embed_code }}
                    />
                ) : (
                    <div className="venue-map-embed">
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight="0"
                            marginWidth="0"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.address + ', ' + venue.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            title="Bản đồ địa điểm"
                            aria-label="Bản đồ địa điểm"
                        ></iframe>
                    </div>
                )}
            </div>
        </section>
    );
};

export default EventVenueInfo;
