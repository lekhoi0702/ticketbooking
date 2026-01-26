from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class Order(db.Model):
    __tablename__ = "Order"

    order_id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('User.user_id'), nullable=False, index=True)
    order_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    total_amount = db.Column(db.Numeric(15, 2), nullable=False)
    final_amount = db.Column(db.Numeric(15, 2), nullable=False)
    order_status = db.Column(db.Enum('PENDING', 'PAID', 'CANCELLED', 'REFUNDED', 'COMPLETED', 'REFUND_PENDING'), default='PENDING', index=True)
    customer_name = db.Column(db.String(255))
    customer_email = db.Column(db.String(255))
    customer_phone = db.Column(db.String(30))
    created_at = db.Column(db.DateTime, default=now_gmt7)
    updated_at = db.Column(db.DateTime, default=now_gmt7, onupdate=now_gmt7)
    paid_at = db.Column(db.DateTime)
    deleted_at = db.Column(db.DateTime, nullable=True)

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
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None,
        }
