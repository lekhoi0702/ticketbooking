"""
Redis-based Seat Reservation Manager
Stores seat reservations in Redis with TTL for automatic expiration
"""

import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from app.config import Config
from app.extensions import get_redis
from app.utils.datetime_utils import now_gmt7


class RedisReservationManager:
    """Manage seat reservations with Redis storage"""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client or get_redis()
        self.reservation_prefix = Config.REDIS_SEAT_RESERVATION_PREFIX
        self.default_ttl = 300  # 5 minutes in seconds
        # Fallback in-memory storage if Redis unavailable
        self._fallback_storage = {}
        self._use_fallback = False
    
    def _get_key(self, seat_id: int) -> str:
        """Get Redis key for a seat reservation"""
        return f"{self.reservation_prefix}{seat_id}"
    
    def _check_redis_available(self) -> bool:
        """Check if Redis is available"""
        if self.redis is None:
            return False
        try:
            self.redis.ping()
            return True
        except Exception:
            return False
    
    def create_reservation(
        self,
        seat_id: int,
        user_id: int,
        event_id: int,
        duration_minutes: int = 5
    ) -> bool:
        """
        Create a seat reservation with TTL
        
        Args:
            seat_id: Seat ID
            user_id: User ID
            event_id: Event ID
            duration_minutes: Reservation duration in minutes (default: 5)
            
        Returns:
            True if created successfully
        """
        reserved_at = now_gmt7()
        expires_at = reserved_at + timedelta(minutes=duration_minutes)
        ttl_seconds = duration_minutes * 60
        
        reservation_data = {
            'seat_id': seat_id,
            'user_id': user_id,
            'event_id': event_id,
            'reserved_at': reserved_at.isoformat(),
            'expires_at': expires_at.isoformat()
        }
        
        if self._check_redis_available():
            try:
                redis_key = self._get_key(seat_id)
                self.redis.setex(
                    redis_key,
                    ttl_seconds,
                    json.dumps(reservation_data)
                )
                return True
            except Exception as e:
                print(f"Error creating reservation in Redis: {str(e)}")
                # Fall through to fallback
        
        # Fallback to in-memory storage
        self._use_fallback = True
        redis_key = self._get_key(seat_id)
        self._fallback_storage[redis_key] = {
            'data': reservation_data,
            'expires_at': expires_at
        }
        return True
    
    def get_reservation(self, seat_id: int) -> Optional[Dict[str, Any]]:
        """
        Get reservation for a seat
        
        Args:
            seat_id: Seat ID
            
        Returns:
            Reservation data or None
        """
        if self._check_redis_available():
            try:
                redis_key = self._get_key(seat_id)
                data = self.redis.get(redis_key)
                if data:
                    reservation = json.loads(data)
                    # Check if expired
                    expires_at = datetime.fromisoformat(reservation['expires_at'])
                    if expires_at < now_gmt7():
                        # Expired, delete it
                        self.delete_reservation(seat_id)
                        return None
                    return reservation
            except Exception as e:
                print(f"Error getting reservation from Redis: {str(e)}")
                # Fall through to fallback
        
        # Fallback to in-memory storage
        redis_key = self._get_key(seat_id)
        if redis_key in self._fallback_storage:
            stored = self._fallback_storage[redis_key]
            if stored['expires_at'] < now_gmt7():
                # Expired
                del self._fallback_storage[redis_key]
                return None
            return stored['data']
        
        return None
    
    def delete_reservation(self, seat_id: int) -> bool:
        """
        Delete a reservation
        
        Args:
            seat_id: Seat ID
            
        Returns:
            True if deleted successfully
        """
        if self._check_redis_available():
            try:
                redis_key = self._get_key(seat_id)
                self.redis.delete(redis_key)
                return True
            except Exception as e:
                print(f"Error deleting reservation from Redis: {str(e)}")
                # Fall through to fallback
        
        # Fallback to in-memory storage
        redis_key = self._get_key(seat_id)
        if redis_key in self._fallback_storage:
            del self._fallback_storage[redis_key]
            return True
        
        return False
    
    def get_user_reservations(self, user_id: int, event_id: int = None) -> List[Dict[str, Any]]:
        """
        Get all reservations for a user, optionally filtered by event
        
        Args:
            user_id: User ID
            event_id: Optional event ID to filter by
            
        Returns:
            List of reservation data
        """
        reservations = []
        
        if self._check_redis_available():
            try:
                pattern = f"{self.reservation_prefix}*"
                for key in self.redis.scan_iter(match=pattern):
                    try:
                        data = self.redis.get(key)
                        if not data:
                            continue
                        
                        reservation = json.loads(data)
                        if reservation.get('user_id') == user_id:
                            if event_id is None or reservation.get('event_id') == event_id:
                                # Check if expired
                                expires_at = datetime.fromisoformat(reservation['expires_at'])
                                if expires_at >= now_gmt7():
                                    reservations.append(reservation)
                                else:
                                    # Expired, delete it
                                    seat_id = reservation.get('seat_id')
                                    if seat_id:
                                        self.delete_reservation(seat_id)
                    except (json.JSONDecodeError, KeyError, TypeError, ValueError) as e:
                        print(f"Error parsing reservation data: {str(e)}")
                        continue
            except Exception as e:
                print(f"Error getting user reservations from Redis: {str(e)}")
                # Fall through to fallback
        
        # Fallback to in-memory storage
        if self._use_fallback or not self._check_redis_available():
            now = now_gmt7()
            for key, stored in list(self._fallback_storage.items()):
                if stored['expires_at'] < now:
                    # Expired, remove it
                    del self._fallback_storage[key]
                    continue
                
                reservation = stored['data']
                if reservation.get('user_id') == user_id:
                    if event_id is None or reservation.get('event_id') == event_id:
                        reservations.append(reservation)
        
        return reservations
    
    def check_reservation_exists(self, seat_id: int) -> bool:
        """
        Check if a reservation exists for a seat
        
        Args:
            seat_id: Seat ID
            
        Returns:
            True if reservation exists
        """
        reservation = self.get_reservation(seat_id)
        return reservation is not None
    
    def cleanup_expired(self) -> int:
        """
        Clean up expired reservations (Redis TTL handles this automatically,
        but this method can be used for manual cleanup of fallback storage)
        
        Returns:
            Number of reservations cleaned up
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
                pattern = f"{self.reservation_prefix}*"
                for key in self.redis.scan_iter(match=pattern):
                    try:
                        data = self.redis.get(key)
                        if not data:
                            continue
                        
                        reservation = json.loads(data)
                        expires_at = datetime.fromisoformat(reservation['expires_at'])
                        if expires_at < now:
                            self.redis.delete(key)
                            count += 1
                    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
                        continue
            except Exception:
                pass
        
        return count


# Global instance (will be initialized after Redis connection)
redis_reservation_manager: Optional[RedisReservationManager] = None


def init_redis_reservation_manager(redis_client=None) -> RedisReservationManager:
    """Initialize Redis reservation manager"""
    global redis_reservation_manager
    redis_reservation_manager = RedisReservationManager(redis_client=redis_client)
    return redis_reservation_manager


def get_redis_reservation_manager() -> Optional[RedisReservationManager]:
    """Get Redis reservation manager instance"""
    return redis_reservation_manager
