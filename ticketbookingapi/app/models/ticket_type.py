from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class TicketType(db.Model):
    __tablename__ = "TicketType"

    ticket_type_id = db.Column(db.BigInteger, primary_key=True)
    event_id = db.Column(db.BigInteger, db.ForeignKey('Event.event_id', ondelete='CASCADE'), nullable=False, index=True)
    type_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(15, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    sold_quantity = db.Column(db.Integer, default=0)
    max_per_order = db.Column(db.Integer, default=10, nullable=True)
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=now_gmt7)

    # Relationships
    tickets = db.relationship('Ticket', backref='ticket_type', lazy=True)

    def to_dict(self):
        return {
            'ticket_type_id': self.ticket_type_id,
            'event_id': self.event_id,
            'type_name': self.type_name,
            'description': self.description,
            'price': float(self.price) if self.price else 0,
            'quantity': self.quantity,
            'sold_quantity': self.sold_quantity,
            'available_quantity': self.quantity - self.sold_quantity,
            'max_per_order': self.max_per_order,
            'is_active': self.is_active
        }
