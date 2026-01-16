from app.extensions import db
from datetime import datetime

class Venue(db.Model):
    __tablename__ = "Venue"

    venue_id = db.Column(db.Integer, primary_key=True)
    venue_name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    capacity = db.Column(db.Integer, nullable=False)
    manager_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False, default=1) # Default to 1 for migration
    vip_seats = db.Column(db.Integer, default=0)
    standard_seats = db.Column(db.Integer, default=0)
    economy_seats = db.Column(db.Integer, default=0)
    seat_map_template = db.Column(db.JSON, nullable=True) # Template for seat layout
    contact_phone = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True, index=True)
    status = db.Column(db.String(50), default='ACTIVE', index=True) # ACTIVE, MAINTENANCE, INACTIVE
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
            'vip_seats': self.vip_seats,
            'standard_seats': self.standard_seats,
            'economy_seats': self.economy_seats,
            'seat_map_template': self.seat_map_template,
            'contact_phone': self.contact_phone,
            'is_active': self.is_active,
            'status': self.status
        }
