from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class Discount(db.Model):
    __tablename__ = "Discount"

    discount_id = db.Column(db.BigInteger, primary_key=True)
    manager_id = db.Column(db.BigInteger, db.ForeignKey('User.user_id'), nullable=True)
    event_id = db.Column(db.BigInteger, db.ForeignKey('Event.event_id'), nullable=True)
    discount_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    discount_name = db.Column(db.String(255), nullable=False)
    discount_type = db.Column(db.Enum('PERCENTAGE', 'FIXED_AMOUNT'), nullable=False)
    discount_value = db.Column(db.Numeric(15, 2), nullable=False)
    min_order_amount = db.Column(db.Numeric(15, 2), default=0)
    usage_limit = db.Column(db.Integer)
    used_count = db.Column(db.Integer, default=0)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    is_active = db.Column(db.Boolean, default=True, index=True)

    def to_dict(self):
        return {
            'discount_id': self.discount_id,
            'discount_code': self.discount_code,
            'discount_name': self.discount_name,
            'discount_type': self.discount_type,
            'discount_value': float(self.discount_value) if self.discount_value else 0,
            'min_order_amount': float(self.min_order_amount) if self.min_order_amount else 0,
            'is_active': self.is_active
        }
