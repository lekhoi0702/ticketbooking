"""
Fallback Token Manager - In-memory storage when Redis is not available
This provides basic functionality without Redis dependency
"""

import jwt
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.config import Config

# In-memory storage (fallback)
_token_storage: Dict[str, Dict[str, Any]] = {}
_token_blacklist: Dict[str, datetime] = {}


class FallbackTokenManager:
    """Fallback token manager using in-memory storage"""
    
    def __init__(self, secret_key: str = None):
        self.secret_key = secret_key or Config.JWT_SECRET_KEY
    
    def generate_access_token(
        self,
        user_id: int,
        role: str,
        expires_in_hours: int = 24
    ) -> str:
        """Generate JWT access token"""
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
        expires_in_days: int = 30,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> str:
        """Generate JWT refresh token and store in memory"""
        token_id = secrets.token_urlsafe(32)
        
        payload = {
            'user_id': user_id,
            'type': 'refresh',
            'exp': datetime.utcnow() + timedelta(days=expires_in_days),
            'iat': datetime.utcnow(),
            'jti': token_id
        }
        
        refresh_token = jwt.encode(payload, self.secret_key, algorithm="HS256")
        
        # Store in memory
        _token_storage[token_id] = {
            'user_id': user_id,
            'token_id': token_id,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(days=expires_in_days)).isoformat()
        }
        
        return refresh_token
    
    def verify_token(self, token: str, token_type: str = 'access') -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            if self.is_token_blacklisted(token):
                return None
            
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            
            if payload.get('type') != token_type:
                return None
            
            # For refresh tokens, verify it exists in storage
            if token_type == 'refresh':
                token_id = payload.get('jti')
                if token_id and token_id not in _token_storage:
                    return None
                
                # Check expiration
                token_data = _token_storage.get(token_id)
                if token_data:
                    expires_at = datetime.fromisoformat(token_data['expires_at'])
                    if datetime.utcnow() > expires_at:
                        del _token_storage[token_id]
                        return None
            
            return payload
            
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return None
    
    def revoke_token(self, token: str) -> bool:
        """Revoke a refresh token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"], options={"verify_exp": False})
            token_id = payload.get('jti')
            token_exp = payload.get('exp', 0)
            
            if not token_id:
                return False
            
            # Remove from storage
            if token_id in _token_storage:
                del _token_storage[token_id]
            
            # Add to blacklist
            if token_exp:
                expires_at = datetime.fromtimestamp(token_exp)
                _token_blacklist[token_id] = expires_at
            
            return True
        except jwt.InvalidTokenError:
            return False
    
    def revoke_all_user_tokens(self, user_id: int) -> int:
        """Revoke all refresh tokens for a user"""
        count = 0
        tokens_to_remove = []
        
        for token_id, token_data in _token_storage.items():
            if token_data.get('user_id') == user_id:
                tokens_to_remove.append(token_id)
        
        for token_id in tokens_to_remove:
            del _token_storage[token_id]
            count += 1
        
        return count
    
    def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is in blacklist"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"], options={"verify_exp": False})
            token_id = payload.get('jti')
            
            if token_id:
                # Clean expired entries
                now = datetime.utcnow()
                expired_keys = [k for k, exp in _token_blacklist.items() if exp < now]
                for key in expired_keys:
                    _token_blacklist.pop(key, None)
                
                return token_id in _token_blacklist
        except jwt.InvalidTokenError:
            pass
        
        return False
    
    def get_token_metadata(self, token: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a refresh token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"], options={"verify_exp": False})
            token_id = payload.get('jti')
            
            if token_id:
                return _token_storage.get(token_id)
        except jwt.InvalidTokenError:
            pass
        
        return None
