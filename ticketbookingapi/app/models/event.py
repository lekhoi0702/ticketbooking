from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class Event(db.Model):
    __tablename__ = "Event"

    event_id = db.Column(db.BigInteger, primary_key=True)
    # NOTE: In current DB (`ticketbookingdb.sql`), category_id is nullable and may be set to NULL on delete.
    category_id = db.Column(
        db.BigInteger,
        db.ForeignKey('EventCategory.category_id', ondelete='SET NULL', onupdate='RESTRICT'),
        nullable=True,
        index=True,
    )
    venue_id = db.Column(db.BigInteger, db.ForeignKey('Venue.venue_id'), nullable=False, index=True)
    manager_id = db.Column(db.BigInteger, db.ForeignKey('User.user_id'), nullable=False)
    event_name = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    start_datetime = db.Column(db.DateTime, nullable=False, index=True)
    end_datetime = db.Column(db.DateTime, nullable=False)
    banner_image_url = db.Column(db.String(1000), nullable=True)
    # DB column is `qr_image_url` (not `vietqr_image_url`)
    qr_image_url = db.Column(db.String(1000), nullable=True)
    total_capacity = db.Column(db.Integer, nullable=False)
    sold_tickets = db.Column(db.Integer, default=0)
    status = db.Column(
        db.Enum('DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'),
        default='PENDING_APPROVAL',
        index=True,
    )
    is_featured = db.Column(db.Boolean, default=False, index=True)  # TiDB/MySQL stores as tinyint(1)
    group_id = db.Column(db.String(100), index=True, nullable=True) # For grouping recurrent events (showtimes)
    created_at = db.Column(db.DateTime, default=now_gmt7)
    updated_at = db.Column(db.DateTime, default=now_gmt7, onupdate=now_gmt7)

    # Relationships
    ticket_types = db.relationship('TicketType', backref='event', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_details=False):
        data = {
            'event_id': self.event_id,
            'category_id': self.category_id,
            'venue_id': self.venue_id,
            'manager_id': self.manager_id,
            'event_name': self.event_name,
            'description': self.description,
            'start_datetime': self.start_datetime.isoformat() if self.start_datetime else None,
            'end_datetime': self.end_datetime.isoformat() if self.end_datetime else None,
            'banner_image_url': self.banner_image_url,
            'qr_image_url': self.qr_image_url,
            'total_capacity': self.total_capacity,
            'sold_tickets': self.sold_tickets,
            'status': self.status,
            'is_featured': self.is_featured,
            'group_id': self.group_id
        }
        
        if include_details:
            data['category'] = self.category.to_dict() if self.category else None
            data['venue'] = self.venue.to_dict() if self.venue else None
            data['ticket_types'] = [tt.to_dict() for tt in self.ticket_types] if self.ticket_types else []
            data['organizer_info'] = self.manager.organizer_info.to_dict() if self.manager and self.manager.organizer_info else None
        
        return data
