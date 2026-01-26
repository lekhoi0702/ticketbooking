from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class Venue(db.Model):
    __tablename__ = "Venue"

    venue_id = db.Column(db.BigInteger, primary_key=True)
    venue_name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    capacity = db.Column(db.Integer, nullable=False)
    # DB columns
    seat_map = db.Column(db.JSON, nullable=True)
    contact_phone = db.Column(db.String(30), nullable=True)
    is_active = db.Column(db.Boolean, default=True, index=True)  # stored as tinyint(1)
    status = db.Column(db.String(50), default='ACTIVE', index=True)
    created_at = db.Column(db.DateTime, default=now_gmt7)
    organizer_id = db.Column(db.BigInteger, nullable=False, default=1, index=True)
    map_embed = db.Column(db.Text, nullable=True)

    # Relationships
    events = db.relationship('Event', backref='venue', lazy=True)

    def to_dict(self):
        return {
            'venue_id': self.venue_id,
            'venue_name': self.venue_name,
            'address': self.address,
            'city': self.city,
            'capacity': self.capacity,
            'contact_phone': self.contact_phone,
            'seat_map': self.seat_map,
            'map_embed': self.map_embed,
            'is_active': self.is_active,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'organizer_id': self.organizer_id,
        }
