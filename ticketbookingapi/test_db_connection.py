"""
Quick test to check database connection and tables
"""
import sys
import os

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app
from app.extensions import db
from app.models.banner import Banner
from app.models.event_category import EventCategory

app = create_app()

with app.app_context():
    try:
        print("=" * 60)
        print("DATABASE & TABLES TEST")
        print("=" * 60)
        
        # Test 1: Database connection
        print("\n[1] Testing database connection...")
        db.session.execute(db.text('SELECT 1'))
        print("    [OK] Database connected")
        
        # Test 2: Check what tables exist
        print("\n[2] Checking existing tables...")
        result = db.session.execute(db.text("SHOW TABLES"))
        tables = [row[0] for row in result]
        
        if tables:
            print(f"    [OK] Found {len(tables)} tables:")
            for table in tables:
                print(f"        - {table}")
        else:
            print("    [WARNING] No tables found in database!")
            print("    [ACTION] You need to import ticketbookingdb.sql!")
        
        # Test 3: Banners table
        print("\n[3] Testing Banners table...")
        try:
            banners = Banner.query.all()
            print(f"    [OK] Banners table exists ({len(banners)} records)")
            if len(banners) == 0:
                print("    [WARNING] Banners table is EMPTY!")
        except Exception as e:
            print(f"    [ERROR] Banners table: {str(e)}")
            print("    [ACTION] Table doesn't exist or schema mismatch!")
        
        # Test 4: Categories table
        print("\n[4] Testing EventCategory table...")
        try:
            categories = EventCategory.query.all()
            print(f"    [OK] EventCategory table exists ({len(categories)} records)")
            if len(categories) == 0:
                print("    [WARNING] EventCategory table is EMPTY!")
            else:
                for cat in categories:
                    print(f"        - {cat.category_name}")
        except Exception as e:
            print(f"    [ERROR] EventCategory table: {str(e)}")
            print("    [ACTION] Table doesn't exist or schema mismatch!")
        
        print("\n" + "=" * 60)
        print("TEST COMPLETE")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n[FATAL ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
