"""
Redis-based Token Manager for refresh tokens
Stores refresh tokens in Redis with TTL for automatic expiration
"""

import jwt
import secrets
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from app.config import Config
from app.extensions import get_redis


class RedisTokenManager:
    """Manage JWT tokens with Redis storage for refresh tokens"""
    
    def __init__(self, secret_key: str = None, redis_client=None):
        self.secret_key = secret_key or Config.JWT_SECRET_KEY
        self.redis = redis_client or get_redis()
        self.refresh_token_prefix = Config.REDIS_REFRESH_TOKEN_PREFIX
        self.blacklist_prefix = Config.REDIS_BLACKLIST_PREFIX
        self.refresh_token_ttl = Config.JWT_REFRESH_TOKEN_EXPIRES  # seconds
    
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
        expires_in_days: int = 30,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> str:
        """
        Generate JWT refresh token and store in Redis
        
        Args:
            user_id: User ID
            expires_in_days: Token expiration in days
            ip_address: Optional IP address
            user_agent: Optional user agent
            
        Returns:
            JWT refresh token string
        """
        # Generate unique token ID
        token_id = secrets.token_urlsafe(32)
        
        payload = {
            'user_id': user_id,
            'type': 'refresh',
            'exp': datetime.utcnow() + timedelta(days=expires_in_days),
            'iat': datetime.utcnow(),
            'jti': token_id  # JWT ID
        }
        
        refresh_token = jwt.encode(payload, self.secret_key, algorithm="HS256")
        
        # Store in Redis with metadata
        if self.redis:
            token_data = {
                'user_id': user_id,
                'token_id': token_id,
                'ip_address': ip_address,
                'user_agent': user_agent,
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Store with TTL (convert days to seconds)
            ttl_seconds = expires_in_days * 24 * 3600
            redis_key = f"{self.refresh_token_prefix}{token_id}"
            self.redis.setex(
                redis_key,
                ttl_seconds,
                json.dumps(token_data)
            )
        
        return refresh_token
    
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
            
            # For refresh tokens, verify it exists in Redis
            if token_type == 'refresh' and self.redis:
                token_id = payload.get('jti')
                if token_id:
                    redis_key = f"{self.refresh_token_prefix}{token_id}"
                    if not self.redis.exists(redis_key):
                        return None  # Token not found in Redis (revoked or expired)
            
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def revoke_token(self, token: str) -> bool:
        """
        Revoke a refresh token by removing from Redis and adding to blacklist
        
        Args:
            token: Token to revoke
            
        Returns:
            True if revoked successfully
        """
        try:
            # Decode to get token ID
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"], options={"verify_exp": False})
            token_id = payload.get('jti')
            token_exp = payload.get('exp', 0)
            
            if not token_id:
                return False
            
            # Remove from Redis
            if self.redis:
                redis_key = f"{self.refresh_token_prefix}{token_id}"
                self.redis.delete(redis_key)
                
                # Add to blacklist until token expiration
                if token_exp:
                    expires_at = datetime.fromtimestamp(token_exp)
                    ttl = int((expires_at - datetime.utcnow()).total_seconds())
                    if ttl > 0:
                        blacklist_key = f"{self.blacklist_prefix}{token_id}"
                        self.redis.setex(blacklist_key, ttl, "1")
            
            return True
            
        except jwt.InvalidTokenError:
            return False
    
    def revoke_all_user_tokens(self, user_id: int) -> int:
        """
        Revoke all refresh tokens for a user
        
        Args:
            user_id: User ID
            
        Returns:
            Number of tokens revoked
        """
        if not self.redis:
            return 0
        
        count = 0
        tokens_to_revoke = []
        
        # Find all tokens for this user
        pattern = f"{self.refresh_token_prefix}*"
        for key in self.redis.scan_iter(match=pattern):
            try:
                token_data_str = self.redis.get(key)
                if not token_data_str:
                    continue
                    
                token_data = json.loads(token_data_str)
                if token_data.get('user_id') == user_id:
                    # Get token_id from key
                    token_id = key.replace(self.refresh_token_prefix, '')
                    tokens_to_revoke.append((key, token_id))
            except (json.JSONDecodeError, KeyError, TypeError):
                continue
        
        # Revoke all found tokens
        for key, token_id in tokens_to_revoke:
            # Delete from Redis
            self.redis.delete(key)
            
            # Add to blacklist with default TTL
            blacklist_key = f"{self.blacklist_prefix}{token_id}"
            self.redis.setex(blacklist_key, self.refresh_token_ttl, "1")
            count += 1
        
        return count
    
    def is_token_blacklisted(self, token: str) -> bool:
        """
        Check if token is in blacklist
        
        Args:
            token: Token to check
            
        Returns:
            True if token is blacklisted
        """
        if not self.redis:
            return False
        
        try:
            # Try to decode to get JWT ID
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"], options={"verify_exp": False})
            token_id = payload.get('jti')
            
            if token_id:
                blacklist_key = f"{self.blacklist_prefix}{token_id}"
                return self.redis.exists(blacklist_key) > 0
        except jwt.InvalidTokenError:
            pass
        
        return False
    
    def get_token_metadata(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a refresh token from Redis
        
        Args:
            token: Refresh token
            
        Returns:
            Token metadata or None
        """
        if not self.redis:
            return None
        
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"], options={"verify_exp": False})
            token_id = payload.get('jti')
            
            if token_id:
                redis_key = f"{self.refresh_token_prefix}{token_id}"
                data = self.redis.get(redis_key)
                if data:
                    return json.loads(data)
        except (jwt.InvalidTokenError, json.JSONDecodeError):
            pass
        
        return None
    
    def cleanup_expired_tokens(self) -> int:
        """
        Clean up expired tokens from Redis (Redis TTL handles this automatically,
        but this method can be used for manual cleanup if needed)
        
        Returns:
            Number of tokens cleaned up (0 for Redis as TTL handles it)
        """
        # Redis automatically removes expired keys, so no manual cleanup needed
        return 0


# Global instance (will be initialized after Redis connection)
redis_token_manager: Optional[RedisTokenManager] = None


def init_redis_token_manager(redis_client) -> RedisTokenManager:
    """Initialize Redis token manager"""
    global redis_token_manager
    redis_token_manager = RedisTokenManager(redis_client=redis_client)
    return redis_token_manager


def get_redis_token_manager() -> Optional[RedisTokenManager]:
    """Get Redis token manager instance"""
    return redis_token_manager
