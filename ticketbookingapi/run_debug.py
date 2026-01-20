"""
Run backend with detailed error logging
"""
import os
import sys

# Force detailed error output
os.environ['FLASK_DEBUG'] = '1'
os.environ['FLASK_ENV'] = 'development'

from app import create_app
from app.extensions import socketio

try:
    print("=" * 60)
    print("STARTING BACKEND IN DEBUG MODE")
    print("=" * 60)
    
    app = create_app()
    
    print("\n[OK] Flask app created successfully")
    print(f"[INFO] Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI', 'NOT SET')[:50]}...")
    
    # Test database connection
    print("\n[TEST] Testing database connection...")
    with app.app_context():
        from app.extensions import db
        try:
            db.session.execute(db.text('SELECT 1'))
            print("[OK] Database connection successful!")
        except Exception as e:
            print(f"[ERROR] Database connection failed: {str(e)}")
            print("\nPlease fix database connection before starting server.")
            sys.exit(1)
    
    print("\n[INFO] Starting Flask server...")
    print("=" * 60)
    
    # Run with detailed error output
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=True,
        log_output=True
    )
    
except Exception as e:
    print("\n" + "=" * 60)
    print("[FATAL ERROR] Failed to start backend:")
    print("=" * 60)
    print(f"\nError: {str(e)}\n")
    
    import traceback
    traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("COMMON FIXES:")
    print("=" * 60)
    print("1. Check .env file exists and has correct values")
    print("2. Ensure database is running and accessible")
    print("3. Run: pip install -r requirements.txt")
    print("4. Check if port 5000 is already in use")
    print("=" * 60)
