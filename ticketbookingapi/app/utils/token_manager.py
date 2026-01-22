"""
Token Manager - Stateless JWT-based refresh tokens with optional blacklist
Supports multiple storage strategies without requiring database
"""

import jwt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from app.config import Config

# In-memory blacklist for revoked tokens (use Redis in production)
_token_blacklist: Dict[str, datetime] = {}


class TokenManager:
    """Manage JWT access and refresh tokens"""
    
    def __init__(self, secret_key: str = None):
        self.secret_key = secret_key or Config.JWT_SECRET_KEY
    
    def generate_access_token(
        self,
        user_id: int,
        role: str,
        expires_in_hours: int = 24
    ) -> str:
        """
        Generate JWT access token
        
        Args:
            user_id: User ID
            role: User role
            expires_in_hours: Token expiration in hours
            
        Returns:
            JWT token string
        """
        payload = {
            'user_id': user_id,
            'role': role,
            'type': 'access',
            'exp': datetime.utcnow() + timedelta(hours=expires_in_hours),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")
    
    def generate_refresh_token(
        self,
        user_id: int,
        expires_in_days: int = 30
    ) -> str:
        """
        Generate JWT refresh token (stateless)
        
        Args:
            user_id: User ID
            expires_in_days: Token expiration in days
            
        Returns:
            JWT refresh token string
        """
        payload = {
            'user_id': user_id,
            'type': 'refresh',
            'exp': datetime.utcnow() + timedelta(days=expires_in_days),
            'iat': datetime.utcnow(),
            'jti': secrets.token_urlsafe(16)  # JWT ID for blacklisting
        }
        return jwt.encode(payload, self.secret_key, algorithm="HS256")
    
    def verify_token(self, token: str, token_type: str = 'access') -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token string
            token_type: Expected token type ('access' or 'refresh')
            
        Returns:
            Decoded payload if valid, None otherwise
        """
        try:
            # Check blacklist first
            if self.is_token_blacklisted(token):
                return None
            
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            
            # Verify token type
            if payload.get('type') != token_type:
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def revoke_token(self, token: str, expires_in_days: int = 30) -> bool:
        """
        Revoke a token by adding to blacklist
        
        Args:
            token: Token to revoke
            expires_in_days: How long to keep in blacklist (should match token expiration)
            
        Returns:
            True if revoked successfully
        """
        try:
            # Decode to get expiration
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"], options={"verify_exp": False})
            token_exp = datetime.utcnow() + timedelta(days=expires_in_days)
            
            # Add to blacklist with token's expiration time
            _token_blacklist[token] = token_exp
            
            # Also blacklist by JWT ID if present (for refresh tokens)
            if 'jti' in payload:
                _token_blacklist[f"jti:{payload['jti']}"] = token_exp
            
            return True
        except jwt.InvalidTokenError:
            return False
    
    def revoke_all_user_tokens(self, user_id: int) -> int:
        """
        Revoke all tokens for a user
        Note: This only works for tokens in blacklist.
        For stateless tokens, we can't revoke existing ones,
        but we can prevent new tokens from being issued.
        
        Args:
            user_id: User ID
            
        Returns:
            Number of tokens revoked (0 for stateless approach)
        """
        # In stateless approach, we can't revoke existing tokens
        # But we can track this user_id to prevent new token generation
        # For now, return 0 as we can't track all tokens
        return 0
    
    def is_token_blacklisted(self, token: str) -> bool:
        """
        Check if token is in blacklist
        
        Args:
            token: Token to check
            
        Returns:
            True if token is blacklisted
        """
        # Clean expired entries
        now = datetime.utcnow()
        expired_keys = [k for k, exp in _token_blacklist.items() if exp < now]
        for key in expired_keys:
            _token_blacklist.pop(key, None)
        
        # Check if token is blacklisted
        if token in _token_blacklist:
            return True
        
        # Check by JWT ID
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"], options={"verify_exp": False})
            if 'jti' in payload:
                jti_key = f"jti:{payload['jti']}"
                if jti_key in _token_blacklist:
                    return True
        except jwt.InvalidTokenError:
            pass
        
        return False
    
    def cleanup_blacklist(self) -> int:
        """
        Clean up expired entries from blacklist
        
        Returns:
            Number of entries removed
        """
        now = datetime.utcnow()
        expired_keys = [k for k, exp in _token_blacklist.items() if exp < now]
        for key in expired_keys:
            _token_blacklist.pop(key, None)
        return len(expired_keys)


# Global instance
token_manager = TokenManager()
