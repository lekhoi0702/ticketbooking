from app.extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils.datetime_utils import now_gmt7
from typing import Dict, Any

class User(db.Model):
    __tablename__ = "User"

    user_id = db.Column(db.BigInteger, primary_key=True)
    role_id = db.Column(db.Integer, db.ForeignKey('Role.role_id'), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=now_gmt7)
    updated_at = db.Column(db.DateTime, default=now_gmt7, onupdate=now_gmt7)
    is_active = db.Column(db.Boolean, default=True, index=True)
    must_change_password = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    role = db.relationship('Role', backref='users')
    events = db.relationship('Event', backref='manager', lazy=True)
    orders = db.relationship('Order', backref='user', lazy=True)

    def set_password(self, password: str) -> None:
        """Set user password with hashing"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> Dict[str, Any]:
        role_map = {1: 'ADMIN', 2: 'ORGANIZER', 3: 'USER'}
        return {
            'user_id': self.user_id,
            'role_id': self.role_id,
            'role': role_map.get(self.role_id, 'USER'),
            'email': self.email,
            'full_name': self.full_name,
            'phone': self.phone,
            'is_active': self.is_active,
            'must_change_password': self.must_change_password,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
