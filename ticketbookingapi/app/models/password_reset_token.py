"""
Password Reset Token model for storing reset password tokens
"""
from app.extensions import db
from datetime import datetime, timedelta
from typing import Dict, Any
import secrets
from app.utils.datetime_utils import now_gmt7


class PasswordResetToken(db.Model):
    __tablename__ = "PasswordResetToken"

    token_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('User.user_id'), nullable=False, index=True)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    used = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=now_gmt7)

    # Relationships
    user = db.relationship('User', backref='password_reset_tokens')

    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)

    @staticmethod
    def create_token(user_id: int, expires_in_minutes: int = 5) -> 'PasswordResetToken':
        """
        Create a new password reset token for a user
        
        Args:
            user_id: User ID
            expires_in_minutes: Token expiration time in minutes (default: 5)
        
        Returns:
            PasswordResetToken instance
        """
        # Invalidate any existing unused tokens for this user
        PasswordResetToken.query.filter_by(
            user_id=user_id,
            used=False
        ).update({'used': True})
        
        token = PasswordResetToken.generate_token()
        expires_at = now_gmt7() + timedelta(minutes=expires_in_minutes)
        
        reset_token = PasswordResetToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            used=False
        )
        
        db.session.add(reset_token)
        return reset_token

    @staticmethod
    def verify_token(token: str) -> 'PasswordResetToken':
        """
        Verify a password reset token
        
        Args:
            token: Token string
        
        Returns:
            PasswordResetToken instance if valid, None otherwise
        """
        reset_token = PasswordResetToken.query.filter_by(
            token=token,
            used=False
        ).first()
        
        if not reset_token:
            return None
        
        if reset_token.expires_at < now_gmt7():
            return None
        
        return reset_token

    @staticmethod
    def check_token_status(token: str) -> Dict[str, Any]:
        """
        Check token status without verifying (for frontend validation)
        
        Args:
            token: Token string
        
        Returns:
            Dict with status: 'valid', 'used', 'expired', or 'not_found'
        """
        reset_token = PasswordResetToken.query.filter_by(token=token).first()
        
        if not reset_token:
            return {'status': 'not_found', 'message': 'Token không tồn tại'}
        
        if reset_token.used:
            return {'status': 'used', 'message': 'Link đặt lại mật khẩu đã được sử dụng. Vui lòng yêu cầu link mới.'}
        
        if reset_token.expires_at < now_gmt7():
            return {'status': 'expired', 'message': 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu link mới.'}
        
        return {'status': 'valid', 'message': 'Token hợp lệ'}

    def mark_as_used(self) -> None:
        """Mark token as used"""
        self.used = True
        db.session.commit()

    def to_dict(self) -> Dict[str, Any]:
        return {
            'token_id': self.token_id,
            'user_id': self.user_id,
            'token': self.token,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'used': self.used,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
