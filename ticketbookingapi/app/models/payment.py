from app.extensions import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = "Payment"

    payment_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('Order.order_id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    payment_method = db.Column(db.Enum('CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'MOMO', 'VNPAY'), nullable=False)
    transaction_id = db.Column(db.String(255))
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    payment_status = db.Column(db.Enum('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'), default='PENDING', index=True)
    payment_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'payment_id': self.payment_id,
            'order_id': self.order_id,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'amount': float(self.amount) if self.amount else 0,
            'payment_status': self.payment_status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None
        }
