from app.extensions import db
from datetime import datetime, timedelta

class SeatReservation(db.Model):
    """Track seat reservations with expiry time"""
    __tablename__ = "SeatReservation"

    reservation_id = db.Column(db.Integer, primary_key=True)
    seat_id = db.Column(db.Integer, db.ForeignKey('Seat.seat_id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id', ondelete='CASCADE'), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey('Event.event_id', ondelete='CASCADE'), nullable=False, index=True)
    reserved_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    
    # Relationships
    seat = db.relationship('Seat', backref='reservations')
    user = db.relationship('User', backref='seat_reservations')
    event = db.relationship('Event', backref='seat_reservations')

    def __init__(self, seat_id, user_id, event_id, reservation_duration_minutes=5):
        self.seat_id = seat_id
        self.user_id = user_id
        self.event_id = event_id
        self.reserved_at = datetime.utcnow()
        self.expires_at = datetime.utcnow() + timedelta(minutes=reservation_duration_minutes)
        self.is_active = True

    def is_expired(self):
        """Check if reservation has expired"""
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        return {
            'reservation_id': self.reservation_id,
            'seat_id': self.seat_id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'reserved_at': self.reserved_at.isoformat() if self.reserved_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active,
            'is_expired': self.is_expired()
        }
