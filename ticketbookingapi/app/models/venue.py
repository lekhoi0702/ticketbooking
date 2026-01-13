from app.extensions import db
from datetime import datetime

class Venue(db.Model):
    __tablename__ = "Venue"

    venue_id = db.Column(db.Integer, primary_key=True)
    venue_name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    capacity = db.Column(db.Integer, nullable=False)
    seat_map_template = db.Column(db.JSON, nullable=True) # Template for seat layout
    contact_phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    events = db.relationship('Event', backref='venue', lazy=True)

    def to_dict(self):
        return {
            'venue_id': self.venue_id,
            'venue_name': self.venue_name,
            'address': self.address,
            'city': self.city,
            'capacity': self.capacity,
            'seat_map_template': self.seat_map_template,
            'contact_phone': self.contact_phone,
            'is_active': self.is_active
        }
