from app.extensions import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = "Order"

    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False, index=True)
    order_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    total_amount = db.Column(db.Numeric(15, 2), nullable=False)
    final_amount = db.Column(db.Numeric(15, 2), nullable=False)
    order_status = db.Column(db.Enum('PENDING', 'PAID', 'CANCELLED', 'REFUNDED', 'COMPLETED', 'CANCELLATION_PENDING'), default='PENDING', index=True)
    customer_name = db.Column(db.String(255))
    customer_email = db.Column(db.String(255))
    customer_phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    paid_at = db.Column(db.DateTime)

    # Relationships
    tickets = db.relationship('Ticket', backref='order', lazy=True, cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='order', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'order_id': self.order_id,
            'order_code': self.order_code,
            'total_amount': float(self.total_amount) if self.total_amount else 0,
            'final_amount': float(self.final_amount) if self.final_amount else 0,
            'order_status': self.order_status,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None
        }
