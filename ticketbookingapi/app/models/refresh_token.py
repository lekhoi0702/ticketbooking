"""
Refresh Token model for JWT token refresh mechanism
"""

from app.extensions import db
from datetime import datetime, timedelta
from typing import Optional


class RefreshToken(db.Model):
    """Refresh token model for JWT authentication"""
    __tablename__ = "RefreshToken"

    token_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.user_id'), nullable=False, index=True)
    token = db.Column(db.String(500), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    revoked = db.Column(db.Boolean, default=False, nullable=False, index=True)
    revoked_at = db.Column(db.DateTime, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)

    # Relationships
    user = db.relationship('User', backref='refresh_tokens')

    def __init__(
        self,
        user_id: int,
        token: str,
        expires_in_days: int = 30,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        self.user_id = user_id
        self.token = token
        self.expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        self.ip_address = ip_address
        self.user_agent = user_agent
        self.revoked = False

    def is_valid(self) -> bool:
        """Check if token is valid (not revoked and not expired)"""
        if self.revoked:
            return False
        if datetime.utcnow() > self.expires_at:
            return False
        return True

    def revoke(self) -> None:
        """Revoke the refresh token"""
        self.revoked = True
        self.revoked_at = datetime.utcnow()

    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            'token_id': self.token_id,
            'user_id': self.user_id,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'revoked': self.revoked
        }

    @classmethod
    def cleanup_expired(cls) -> int:
        """Delete expired refresh tokens, returns count of deleted tokens"""
        expired_tokens = cls.query.filter(
            cls.expires_at < datetime.utcnow()
        ).all()
        
        count = len(expired_tokens)
        for token in expired_tokens:
            db.session.delete(token)
        
        db.session.commit()
        return count

    @classmethod
    def revoke_all_user_tokens(cls, user_id: int) -> int:
        """Revoke all refresh tokens for a user"""
        tokens = cls.query.filter(
            cls.user_id == user_id,
            cls.revoked == False
        ).all()
        
        count = len(tokens)
        for token in tokens:
            token.revoke()
        
        db.session.commit()
        return count
