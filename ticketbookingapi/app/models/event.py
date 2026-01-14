from app.extensions import db
from datetime import datetime

class Event(db.Model):
    __tablename__ = "Event"

    event_id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('EventCategory.category_id'), nullable=False, index=True)
    venue_id = db.Column(db.Integer, db.ForeignKey('Venue.venue_id'), nullable=False, index=True)
    manager_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False)
    event_name = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    start_datetime = db.Column(db.DateTime, nullable=False, index=True)
    end_datetime = db.Column(db.DateTime, nullable=False)
    sale_start_datetime = db.Column(db.DateTime)
    sale_end_datetime = db.Column(db.DateTime)
    banner_image_url = db.Column(db.String(500))
    total_capacity = db.Column(db.Integer, nullable=False)
    sold_tickets = db.Column(db.Integer, default=0)
    status = db.Column(db.Enum('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'PENDING_DELETION'), default='PENDING_APPROVAL', index=True)
    is_featured = db.Column(db.Boolean, default=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    ticket_types = db.relationship('TicketType', backref='event', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='event', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_details=False):
        data = {
            'event_id': self.event_id,
            'category_id': self.category_id,
            'venue_id': self.venue_id,
            'event_name': self.event_name,
            'description': self.description,
            'start_datetime': self.start_datetime.isoformat() if self.start_datetime else None,
            'end_datetime': self.end_datetime.isoformat() if self.end_datetime else None,
            'banner_image_url': self.banner_image_url,
            'total_capacity': self.total_capacity,
            'sold_tickets': self.sold_tickets,
            'status': self.status,
            'is_featured': self.is_featured
        }
        
        if include_details:
            data['category'] = self.category.to_dict() if self.category else None
            data['venue'] = self.venue.to_dict() if self.venue else None
            data['ticket_types'] = [tt.to_dict() for tt in self.ticket_types] if self.ticket_types else []
        
        return data
