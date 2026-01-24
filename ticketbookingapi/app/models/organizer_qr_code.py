from app.extensions import db
from datetime import datetime
from app.utils.datetime_utils import now_gmt7

class OrganizerQRCode(db.Model):
    """Organizer QR Code for VietQR payments"""
    __tablename__ = "OrganizerQRCode"

    qr_code_id = db.Column(db.Integer, primary_key=True)
    manager_id = db.Column(db.BigInteger, db.ForeignKey('User.user_id', ondelete='CASCADE'), nullable=False, index=True)
    qr_name = db.Column(db.String(255), nullable=False)
    qr_image_url = db.Column(db.String(500), nullable=False)
    bank_name = db.Column(db.String(100), nullable=True)
    account_number = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=now_gmt7, nullable=False)
    updated_at = db.Column(db.DateTime, default=now_gmt7, onupdate=now_gmt7, nullable=False)

    # Relationships
    manager = db.relationship('User', backref='qr_codes')

    def to_dict(self):
        return {
            'qr_code_id': self.qr_code_id,
            'manager_id': self.manager_id,
            'qr_name': self.qr_name,
            'qr_image_url': self.qr_image_url,
            'bank_name': self.bank_name,
            'account_number': self.account_number,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
