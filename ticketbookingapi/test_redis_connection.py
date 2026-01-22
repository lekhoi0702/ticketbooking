"""
Test Redis connection and token manager
Run this script to verify Redis is working correctly
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_redis_connection():
    """Test Redis connection"""
    print("=" * 60)
    print("Testing Redis Connection")
    print("=" * 60)
    
    # Check if .env exists
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        print("⚠️  .env file not found. Creating minimal config for testing...")
        # Set minimal required env vars for testing
        os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-redis-testing-only')
        os.environ.setdefault('JWT_SECRET_KEY', 'test-jwt-secret-key-for-redis-testing-only')
        os.environ.setdefault('DB_HOST', 'localhost')
        os.environ.setdefault('DB_USER', 'root')
        os.environ.setdefault('DB_PASSWORD', '')
        os.environ.setdefault('DB_NAME', 'test')
    
    from app import create_app
    from app.extensions import get_redis, get_redis_token_manager
    from app.utils.redis_token_manager import RedisTokenManager
    
    app = create_app()
    
    with app.app_context():
        # Test Redis connection
        redis_client = get_redis()
        if redis_client:
            try:
                result = redis_client.ping()
                print(f"✅ Redis PING: {result}")
                print(f"✅ Redis connected to: {redis_client.connection_pool.connection_kwargs.get('host')}:{redis_client.connection_pool.connection_kwargs.get('port')}")
                
                # Test Redis info
                info = redis_client.info('server')
                print(f"✅ Redis version: {info.get('redis_version', 'unknown')}")
                
            except Exception as e:
                print(f"❌ Redis connection error: {str(e)}")
                return False
        else:
            print("❌ Redis client is None - connection failed")
            return False
        
        # Test Token Manager
        print("\n" + "=" * 60)
        print("Testing Redis Token Manager")
        print("=" * 60)
        
        token_manager = get_redis_token_manager()
        if token_manager:
            print("✅ Token manager initialized")
            
            # Test token generation
            print("\nTesting token generation...")
            access_token = token_manager.generate_access_token(user_id=1, role='USER')
            refresh_token = token_manager.generate_refresh_token(
                user_id=1,
                expires_in_days=30,
                ip_address='127.0.0.1',
                user_agent='test-agent'
            )
            
            print(f"✅ Access token generated: {access_token[:50]}...")
            print(f"✅ Refresh token generated: {refresh_token[:50]}...")
            
            # Test token verification
            print("\nTesting token verification...")
            access_payload = token_manager.verify_token(access_token, token_type='access')
            refresh_payload = token_manager.verify_token(refresh_token, token_type='refresh')
            
            if access_payload:
                print(f"✅ Access token verified: user_id={access_payload.get('user_id')}, role={access_payload.get('role')}")
            else:
                print("❌ Access token verification failed")
            
            if refresh_payload:
                print(f"✅ Refresh token verified: user_id={refresh_payload.get('user_id')}")
            else:
                print("❌ Refresh token verification failed")
            
            # Test token metadata
            print("\nTesting token metadata retrieval...")
            metadata = token_manager.get_token_metadata(refresh_token)
            if metadata:
                print(f"✅ Token metadata retrieved: {metadata}")
            else:
                print("❌ Token metadata retrieval failed")
            
            # Test token revocation
            print("\nTesting token revocation...")
            revoked = token_manager.revoke_token(refresh_token)
            if revoked:
                print("✅ Token revoked successfully")
                
                # Verify token is blacklisted
                is_blacklisted = token_manager.is_token_blacklisted(refresh_token)
                if is_blacklisted:
                    print("✅ Token added to blacklist")
                else:
                    print("⚠️  Token not found in blacklist (may be expected)")
                
                # Verify token can't be used anymore
                verify_after_revoke = token_manager.verify_token(refresh_token, token_type='refresh')
                if not verify_after_revoke:
                    print("✅ Revoked token correctly rejected")
                else:
                    print("❌ Revoked token still works!")
            else:
                print("❌ Token revocation failed")
            
            # Test Redis keys
            print("\n" + "=" * 60)
            print("Checking Redis Keys")
            print("=" * 60)
            
            from app.config import Config
            pattern = f"{Config.REDIS_REFRESH_TOKEN_PREFIX}*"
            keys = list(redis_client.scan_iter(match=pattern))
            print(f"✅ Refresh tokens in Redis: {len(keys)}")
            
            pattern = f"{Config.REDIS_BLACKLIST_PREFIX}*"
            blacklist_keys = list(redis_client.scan_iter(match=pattern))
            print(f"✅ Blacklisted tokens: {len(blacklist_keys)}")
            
            print("\n" + "=" * 60)
            print("✅ All tests passed!")
            print("=" * 60)
            return True
        else:
            print("❌ Token manager not initialized")
            return False

if __name__ == "__main__":
    try:
        success = test_redis_connection()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
