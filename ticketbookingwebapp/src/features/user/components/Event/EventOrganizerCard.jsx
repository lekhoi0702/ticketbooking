import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { getImageUrl } from '@shared/utils/eventUtils';

const EventOrganizerCard = ({ organizerInfo, eventName }) => {
    return (
        <Card className="sidebar-card" id="organizer">
            <Card.Body>
                <div className="organizer-info">
                    <div className="organizer-avatar">
                        {organizerInfo?.logo_url ? (
                            <img src={getImageUrl(organizerInfo.logo_url)} alt={organizerInfo.organization_name} />
                        ) : (
                            (organizerInfo?.organization_name || eventName || 'O').charAt(0).toString().toUpperCase()
                        )}
                    </div>
                    <div className="organizer-details">
                        <h6>{organizerInfo?.organization_name || 'Ban tổ chức sự kiện'}</h6>
                        <p className="text-muted small mb-0">
                            {organizerInfo?.description || 'Chuyên tổ chức các sự kiện giải trí hàng đầu'}
                        </p>
                    </div>
                </div>

            </Card.Body>
        </Card>
    );
};

export default EventOrganizerCard;
