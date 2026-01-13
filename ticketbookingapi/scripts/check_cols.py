import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        result = db.session.execute(text("DESCRIBE Venue"))
        print("Columns in Venue:")
        for row in result:
            print(f"- {row[0]}")
    except Exception as e:
        print(f"Error describing Venue: {e}")

    try:
        result = db.session.execute(text("DESCRIBE Event"))
        print("\nColumns in Event:")
        for row in result:
            print(f"- {row[0]}")
    except Exception as e:
        print(f"Error describing Event: {e}")
