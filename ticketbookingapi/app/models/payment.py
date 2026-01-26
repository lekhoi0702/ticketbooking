from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class Payment(db.Model):
    __tablename__ = "Payment"

    payment_id = db.Column(db.BigInteger, primary_key=True)
    order_id = db.Column(db.BigInteger, db.ForeignKey('Order.order_id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    payment_code = db.Column(db.String(50), unique=True, index=True, nullable=True)
    payment_method = db.Column(
        db.Enum('CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'MOMO', 'VNPAY', 'CASH', 'PAYPAL', 'VIETQR'),
        nullable=True,
    )
    transaction_id = db.Column(db.String(255))
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    payment_status = db.Column(db.Enum('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'), default='PENDING', index=True)
    payment_date = db.Column(db.DateTime)
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=now_gmt7)

    def to_dict(self):
        return {
            'payment_id': self.payment_id,
            'order_id': self.order_id,
            'payment_code': self.payment_code,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'amount': float(self.amount) if self.amount else 0,
            'payment_status': self.payment_status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None
        }
