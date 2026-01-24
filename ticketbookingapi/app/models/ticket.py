from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class Ticket(db.Model):
    __tablename__ = "Ticket"

    ticket_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('Order.order_id', ondelete='CASCADE'), nullable=False, index=True)
    ticket_type_id = db.Column(db.Integer, db.ForeignKey('TicketType.ticket_type_id'), nullable=False)
    ticket_code = db.Column(db.String(100), unique=True, nullable=False, index=True)
    ticket_status = db.Column(db.Enum('ACTIVE', 'USED', 'CANCELLED', 'REFUNDED'), default='ACTIVE', index=True)
    seat_id = db.Column(db.Integer, db.ForeignKey('Seat.seat_id'), nullable=True)
    price = db.Column(db.Numeric(15, 2), nullable=False)
    qr_code_url = db.Column(db.String(500))
    holder_name = db.Column(db.String(255))
    holder_email = db.Column(db.String(255))
    checked_in_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=now_gmt7)

    # Relationships
    seat = db.relationship('Seat', backref='tickets', lazy=True)

    def to_dict(self):
        data = {
            'ticket_id': self.ticket_id,
            'order_id': self.order_id,
            'ticket_type_id': self.ticket_type_id,
            'ticket_code': self.ticket_code,
            'ticket_status': self.ticket_status,
            'seat_id': self.seat_id,
            'price': float(self.price) if self.price else 0,
            'qr_code_url': self.qr_code_url,
            'holder_name': self.holder_name,
            'holder_email': self.holder_email,
            'checked_in_at': self.checked_in_at.isoformat() if self.checked_in_at else None
        }
        
        if self.seat:
            data['seat'] = self.seat.to_dict()
            
        return data
