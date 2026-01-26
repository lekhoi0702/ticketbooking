"""
Redis-based Password Reset Token Manager
Stores password reset tokens in Redis with TTL for automatic expiration
"""

import json
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.config import Config
from app.extensions import get_redis
from app.utils.datetime_utils import now_gmt7


class RedisPasswordResetManager:
    """Manage password reset tokens with Redis storage"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or get_redis()
        self.token_prefix = Config.REDIS_PASSWORD_RESET_TOKEN_PREFIX
        self.default_ttl = 300  # 5 minutes in seconds
        # Fallback in-memory storage if Redis unavailable
        self._fallback_storage = {}
        self._use_fallback = False
    
    def _get_key(self, token: str) -> str:
        """Get Redis key for a password reset token"""
        return f"{self.token_prefix}{token}"
    
    def _check_redis_available(self) -> bool:
        """Check if Redis is available"""
        if self.redis is None:
            return False
        try:
            self.redis.ping()
            return True
        except Exception:
            return False
    
    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    def create_token(
        self,
        user_id: int,
        expires_in_minutes: int = 5
    ) -> str:
        """
        Create a password reset token with TTL
        
        Args:
            user_id: User ID
            expires_in_minutes: Token expiration time in minutes (default: 5)
            
        Returns:
            Token string
        """
        # Invalidate any existing unused tokens for this user
        self.invalidate_user_tokens(user_id)
        
        token = self.generate_token()
        created_at = now_gmt7()
        expires_at = created_at + timedelta(minutes=expires_in_minutes)
        ttl_seconds = expires_in_minutes * 60
        
        token_data = {
            'user_id': user_id,
            'expires_at': expires_at.isoformat(),
            'created_at': created_at.isoformat()
        }
        
        if self._check_redis_available():
            try:
                redis_key = self._get_key(token)
                self.redis.setex(
                    redis_key,
                    ttl_seconds,
                    json.dumps(token_data)
                )
                return token
            except Exception as e:
                print(f"Error creating password reset token in Redis: {str(e)}")
                # Fall through to fallback
        
        # Fallback to in-memory storage
        self._use_fallback = True
        redis_key = self._get_key(token)
        self._fallback_storage[redis_key] = {
            'data': token_data,
            'expires_at': expires_at
        }
        return token
    
    def verify_token(self, token: str) -> Optional[int]:
        """
        Verify a password reset token
        
        Args:
            token: Token string
            
        Returns:
            user_id if valid, None otherwise
        """
        token_data = self._get_token_data(token)
        if not token_data:
            return None
        
        # Check if expired
        expires_at = datetime.fromisoformat(token_data['expires_at'])
        if expires_at < now_gmt7():
            # Expired, delete it
            self.mark_token_as_used(token)
            return None
        
        return token_data.get('user_id')
    
    def check_token_status(self, token: str) -> Dict[str, Any]:
        """
        Check token status without verifying (for frontend validation)
        
        Args:
            token: Token string
            
        Returns:
            Dict with status: 'valid', 'used', 'expired', or 'not_found'
        """
        token_data = self._get_token_data(token)
        
        if not token_data:
            return {'status': 'not_found', 'message': 'Token không tồn tại'}
        
        # Check if expired
        expires_at = datetime.fromisoformat(token_data['expires_at'])
        if expires_at < now_gmt7():
            return {'status': 'expired', 'message': 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu link mới.'}
        
        return {'status': 'valid', 'message': 'Token hợp lệ'}
    
    def mark_token_as_used(self, token: str) -> bool:
        """
        Mark token as used (delete from Redis)
        
        Args:
            token: Token string
            
        Returns:
            True if deleted successfully
        """
        if self._check_redis_available():
            try:
                redis_key = self._get_key(token)
                self.redis.delete(redis_key)
                return True
            except Exception as e:
                print(f"Error deleting password reset token from Redis: {str(e)}")
                # Fall through to fallback
        
        # Fallback to in-memory storage
        redis_key = self._get_key(token)
        if redis_key in self._fallback_storage:
            del self._fallback_storage[redis_key]
            return True
        
        return False
    
    def invalidate_user_tokens(self, user_id: int) -> int:
        """
        Invalidate all tokens for a user (when creating a new token)
        
        Args:
            user_id: User ID
            
        Returns:
            Number of tokens invalidated
        """
        count = 0
        
        if self._check_redis_available():
            try:
                pattern = f"{self.token_prefix}*"
                tokens_to_delete = []
                
                for key in self.redis.scan_iter(match=pattern):
                    try:
                        data = self.redis.get(key)
                        if not data:
                            continue
                        
                        token_data = json.loads(data)
                        if token_data.get('user_id') == user_id:
                            tokens_to_delete.append(key)
                    except (json.JSONDecodeError, KeyError, TypeError):
                        continue
                
                # Delete all tokens for this user
                for key in tokens_to_delete:
                    self.redis.delete(key)
                    count += 1
            except Exception as e:
                print(f"Error invalidating user tokens from Redis: {str(e)}")
                # Fall through to fallback
        
        # Fallback to in-memory storage
        if self._use_fallback or not self._check_redis_available():
            keys_to_delete = []
            for key, stored in self._fallback_storage.items():
                if stored['data'].get('user_id') == user_id:
                    keys_to_delete.append(key)
            
            for key in keys_to_delete:
                del self._fallback_storage[key]
                count += 1
        
        return count
    
    def _get_token_data(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Get token data from Redis or fallback storage
        
        Args:
            token: Token string
            
        Returns:
            Token data or None
        """
        if self._check_redis_available():
            try:
                redis_key = self._get_key(token)
                data = self.redis.get(redis_key)
                if data:
                    return json.loads(data)
            except Exception as e:
                print(f"Error getting password reset token from Redis: {str(e)}")
                # Fall through to fallback
        
        # Fallback to in-memory storage
        redis_key = self._get_key(token)
        if redis_key in self._fallback_storage:
            stored = self._fallback_storage[redis_key]
            if stored['expires_at'] < now_gmt7():
                # Expired
                del self._fallback_storage[redis_key]
                return None
            return stored['data']
        
        return None
    
    def cleanup_expired(self) -> int:
        """
        Clean up expired tokens (Redis TTL handles this automatically,
        but this method can be used for manual cleanup of fallback storage)
        
        Returns:
            Number of tokens cleaned up
        """
        count = 0
        now = now_gmt7()
        
        # Cleanup fallback storage
        for key in list(self._fallback_storage.keys()):
            if self._fallback_storage[key]['expires_at'] < now:
                del self._fallback_storage[key]
                count += 1
        
        # Redis automatically handles TTL, but we can scan for any expired keys
        if self._check_redis_available():
            try:
                pattern = f"{self.token_prefix}*"
                for key in self.redis.scan_iter(match=pattern):
                    try:
                        data = self.redis.get(key)
                        if not data:
                            continue
                        
                        token_data = json.loads(data)
                        expires_at = datetime.fromisoformat(token_data['expires_at'])
                        if expires_at < now:
                            self.redis.delete(key)
                            count += 1
                    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
                        continue
            except Exception:
                pass
        
        return count


# Global instance (will be initialized after Redis connection)
redis_password_reset_manager: Optional[RedisPasswordResetManager] = None


def init_redis_password_reset_manager(redis_client=None) -> RedisPasswordResetManager:
    """Initialize Redis password reset manager"""
    global redis_password_reset_manager
    redis_password_reset_manager = RedisPasswordResetManager(redis_client=redis_client)
    return redis_password_reset_manager


def get_redis_password_reset_manager() -> Optional[RedisPasswordResetManager]:
    """Get Redis password reset manager instance"""
    return redis_password_reset_manager
