from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
import redis
from typing import Optional

db = SQLAlchemy()
migrate = Migrate()
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')
redis_client: Optional[redis.Redis] = None


def init_redis(app) -> Optional[redis.Redis]:
    """
    Initialize Redis connection
    
    Args:
        app: Flask application instance
        
    Returns:
        Redis client instance or None if connection fails
    """
    global redis_client
    
    try:
        from app.config import Config
        
        redis_client = redis.Redis(
            host=Config.REDIS_HOST,
            port=Config.REDIS_PORT,
            password=Config.REDIS_PASSWORD,
            db=Config.REDIS_DB,
            decode_responses=Config.REDIS_DECODE_RESPONSES,
            socket_timeout=Config.REDIS_SOCKET_TIMEOUT,
            socket_connect_timeout=Config.REDIS_SOCKET_CONNECT_TIMEOUT,
            health_check_interval=30
        )
        
        # Test connection
        redis_client.ping()
        app.logger.info(f"Redis connected successfully to {Config.REDIS_HOST}:{Config.REDIS_PORT}")
        return redis_client
        
    except Exception as e:
        app.logger.warning(f"Redis connection failed: {str(e)}. Continuing without Redis.")
        redis_client = None
        return None


def get_redis() -> Optional[redis.Redis]:
    """Get Redis client instance"""
    return redis_client


def get_redis_token_manager():
    """Get Redis token manager instance"""
    from app.utils.redis_token_manager import get_redis_token_manager
    return get_redis_token_manager()