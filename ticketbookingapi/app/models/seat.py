from app.extensions import db
from datetime import datetime

class Seat(db.Model):
    __tablename__ = "Seat"

    seat_id = db.Column(db.BigInteger, primary_key=True)
    ticket_type_id = db.Column(db.BigInteger, db.ForeignKey('TicketType.ticket_type_id', ondelete='CASCADE'), nullable=False, index=True)
    row_name = db.Column(db.String(10), nullable=False) # e.g., 'A', 'B'
    seat_number = db.Column(db.String(10), nullable=False) # e.g., '1', '2'
    status = db.Column(db.Enum('AVAILABLE', 'LOCKED', 'BOOKED', 'RESERVED'), default='AVAILABLE', index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=True)
    area_name = db.Column(db.String(100), nullable=True) # e.g., 'Khán đài A', 'Khu vực VIP'
    
    # Optional: x, y coordinates for custom map drawing
    x_pos = db.Column(db.Integer)
    y_pos = db.Column(db.Integer)

    def to_dict(self):
        return {
            'seat_id': self.seat_id,
            'ticket_type_id': self.ticket_type_id,
            'row_name': self.row_name,
            'seat_number': self.seat_number,
            'area_name': self.area_name,
            'seat_label': f"{self.area_name + ' ' if self.area_name else ''}{self.row_name}{self.seat_number}",
            'status': self.status,
            'is_active': self.is_active,
            'x_pos': self.x_pos,
            'y_pos': self.y_pos
        }
