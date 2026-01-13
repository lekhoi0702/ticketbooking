import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    print("Checking for missing columns...")
    
    # 1. Check Venue
    result = db.session.execute(text("DESCRIBE Venue"))
    cols = [row[0] for row in result]
    
    if 'seat_map_template' not in cols:
        print("Adding 'seat_map_template' to Venue...")
        try:
            db.session.execute(text("ALTER TABLE Venue ADD COLUMN seat_map_template JSON AFTER capacity"))
            db.session.commit()
            print("✓ Added seat_map_template to Venue")
        except Exception as e:
            print(f"Error adding column to Venue: {e}")
            db.session.rollback()
    else:
        print("✓ Venue already has seat_map_template")

    print("\nDatabase schema check completed.")
