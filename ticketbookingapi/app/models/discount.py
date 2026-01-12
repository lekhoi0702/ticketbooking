from app.extensions import db
from datetime import datetime

class Discount(db.Model):
    __tablename__ = "Discount"

    discount_id = db.Column(db.Integer, primary_key=True)
    discount_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    discount_name = db.Column(db.String(255), nullable=False)
    discount_type = db.Column(db.Enum('PERCENTAGE', 'FIXED_AMOUNT'), nullable=False)
    discount_value = db.Column(db.Numeric(15, 2), nullable=False)
    max_discount_amount = db.Column(db.Numeric(15, 2))
    min_order_amount = db.Column(db.Numeric(15, 2), default=0)
    usage_limit = db.Column(db.Integer)
    used_count = db.Column(db.Integer, default=0)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'discount_id': self.discount_id,
            'discount_code': self.discount_code,
            'discount_name': self.discount_name,
            'discount_type': self.discount_type,
            'discount_value': float(self.discount_value) if self.discount_value else 0,
            'max_discount_amount': float(self.max_discount_amount) if self.max_discount_amount else None,
            'min_order_amount': float(self.min_order_amount) if self.min_order_amount else 0,
            'is_active': self.is_active
        }
