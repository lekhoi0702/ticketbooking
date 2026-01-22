"""
Simple Redis connection test - doesn't require full app setup
"""

import sys
import os

def test_redis_simple():
    """Simple Redis connection test"""
    print("=" * 60)
    print("Simple Redis Connection Test")
    print("=" * 60)
    
    try:
        import redis
    except ImportError:
        print("[ERROR] redis package not installed")
        print("Run: pip install redis>=5.0.0")
        return False
    
    # Get config from env or use defaults
    redis_host = os.getenv('REDIS_HOST', 'localhost')
    redis_port = int(os.getenv('REDIS_PORT', 6379))
    redis_password = os.getenv('REDIS_PASSWORD', None)
    redis_db = int(os.getenv('REDIS_DB', 0))
    
    print(f"\nConnecting to Redis at {redis_host}:{redis_port}...")
    
    try:
        redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            password=redis_password,
            db=redis_db,
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5
        )
        
        # Test connection
        result = redis_client.ping()
        print(f"[OK] Redis PING: {result}")
        
        # Get Redis info
        info = redis_client.info('server')
        print(f"[OK] Redis version: {info.get('redis_version', 'unknown')}")
        print(f"[OK] Redis mode: {info.get('redis_mode', 'standalone')}")
        
        # Test basic operations
        test_key = "ticketbooking:test:simple"
        redis_client.setex(test_key, 10, "test_value")
        value = redis_client.get(test_key)
        redis_client.delete(test_key)
        
        if value == "test_value":
            print("[OK] Redis read/write test: PASSED")
        else:
            print("[ERROR] Redis read/write test: FAILED")
            return False
        
        # Test token storage pattern
        print("\nTesting token storage pattern...")
        test_token_id = "test_token_123"
        test_token_data = {
            'user_id': 1,
            'token_id': test_token_id,
            'ip_address': '127.0.0.1',
            'user_agent': 'test-agent',
            'created_at': '2026-01-01T00:00:00'
        }
        
        import json
        token_key = f"ticketbooking:refresh_token:{test_token_id}"
        redis_client.setex(token_key, 60, json.dumps(test_token_data))
        
        stored_data = redis_client.get(token_key)
        if stored_data:
            parsed = json.loads(stored_data)
            if parsed.get('user_id') == 1:
                print("[OK] Token storage pattern: PASSED")
            else:
                print("[ERROR] Token storage pattern: FAILED")
                return False
        else:
            print("[ERROR] Token storage pattern: FAILED")
            return False
        
        redis_client.delete(token_key)
        
        print("\n" + "=" * 60)
        print("[SUCCESS] All Redis tests passed!")
        print("=" * 60)
        print("\nRedis is ready to use for token management.")
        return True
        
    except redis.ConnectionError as e:
        print(f"\n[ERROR] Redis connection error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check Redis is running:")
        print("   redis-cli ping")
        print("2. Verify Redis host/port:")
        print(f"   Host: {redis_host}, Port: {redis_port}")
        print("3. Check firewall settings")
        print("4. For Windows, ensure Redis service is running")
        return False
    except Exception as e:
        print(f"\n[ERROR] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_redis_simple()
    sys.exit(0 if success else 1)
