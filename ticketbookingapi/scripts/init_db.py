from app import create_app
from app.extensions import db
import os

app = create_app()
with app.app_context():
    try:
        print("Creating database tables...")
        # This will create tables if they don't exist
        db.create_all()
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")
